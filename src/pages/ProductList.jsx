import React, {
  useCallback,
  useEffect,
  useState,
} from 'react';

import axios from 'axios';
import Swal from 'sweetalert2';

const API = import.meta.env.VITE_API_URL;

export default function ProductList() {
  const [modelGroups, setModelGroups] = useState([]);
  const [loading, setLoading] = useState(false);
  const [expandedModel, setExpandedModel] = useState(null);
  const [stats, setStats] = useState({
    totalQty: 0,
    totalInvestment: 0,
    totalPotentialRevenue: 0,
    totalProfit: 0,
  });
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [search, setSearch] = useState("");
  const [dates, setDates] = useState({ start: "", end: "" });

  // Combined fetch function for initial load, search, and infinite scroll
  const fetchData = useCallback(async (pageNum, isNewSearch = false) => {
    if (loading) return;
    setLoading(true);
    try {
      const res = await axios.get(`${API}/products/grouped`, {
        params: {
          page: pageNum,
          search,
          startDate: dates.start,
          endDate: dates.end,
        },
      });

      const newData = res.data.groupedData;
      setStats(res.data.global);

      // If it's a new search/filter, replace data. If scrolling, append.
      setModelGroups(prev => isNewSearch ? newData : [...prev, ...newData]);
      setHasMore(newData.length === 5);
    } catch (e) {
      console.error("Fetch Error:", e);
    } finally {
      setLoading(false);
    }
  }, [search, dates, loading]);

  // Trigger search/filter reset
  useEffect(() => {
    setPage(1);
    fetchData(1, true);
  }, [search, dates]);

  const handleScroll = (e) => {
    const { scrollTop, clientHeight, scrollHeight } = e.currentTarget;
    // Load more when 50px from bottom
    if (scrollHeight - scrollTop <= clientHeight + 50 && hasMore && !loading) {
      const nextPage = page + 1;
      setPage(nextPage);
      fetchData(nextPage, false);
    }
  };

  const formatDate = (date) =>
    new Date(date).toLocaleDateString("en-GB", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });

  const handleSell = async (item) => {
    const { value: finalPrice } = await Swal.fire({
      title: "Confirm Sale",
      text: `Selling ${item.model} (${item.imei})`,
      input: "number",
      inputLabel: "Final Sale Price (PKR)",
      inputValue: item.sellPrice,
      showCancelButton: true,
      confirmButtonText: "Confirm Sold",
      confirmButtonColor: "#198754",
    });

    if (finalPrice) {
      try {
        await axios.put(`${API}/products/sell/${item._id}`, { finalSalePrice: finalPrice });
        Swal.fire("Sold!", "Item moved to sales history.", "success");
        fetchData(1, true); // Refresh list
      } catch (e) {
        Swal.fire("Error", "Could not process sale", "error");
      }
    }
  };

  const handleDelete = async (id) => {
    const result = await Swal.fire({
      title: "Delete this item?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
    });
    if (result.isConfirmed) {
      try {
        await axios.delete(`${API}/products/${id}`);
        fetchData(1, true); // Refresh list
      } catch (e) {
        Swal.fire("Error", "Delete failed", "error");
      }
    }
  };
  const handleLoan = async (item) => {
    const { value: formValues } = await Swal.fire({
      title: "Process Loan",
      html: `<input id="custName" class="swal2-input" placeholder="Customer Name">`
        + `<input id="finalPrice" type="number" class="swal2-input" placeholder="Total Sale Price" value="${item.sellPrice}">`
        + `<input id="paidAmount" type="number" class="swal2-input" placeholder="Initial Deposit">`,
      focusConfirm: false,
      preConfirm: () => {
        return {
          customerName: document.getElementById("custName").value,
          finalSalePrice: document.getElementById("finalPrice").value,
          amountPaid: document.getElementById("paidAmount").value,
        };
      },
    });

    if (formValues && formValues.customerName) {
      await axios.put(`${API}/products/loan/${item._id}`, formValues);
      Swal.fire("Loan Recorded", "", "success");
      fetchData(1, true);
    }
  };

  return (
    <div onScroll={handleScroll} style={{ height: "85vh", overflowY: "auto" }}>
      {/* STICKY HEADER */}
      <div
        className="alert alert-primary sticky-top shadow-sm border-0 px-3 py-3"
        style={{ borderRadius: "0 0 15px 15px", backgroundColor: "#0d6efd", color: "white", zIndex: 1020 }}
      >
        <div className="row text-center g-0 mb-3">
          <div className="col-4 border-end border-white border-opacity-25">
            <small className="opacity-75 d-block">Stock</small>
            <h6 className="fw-bold mb-0">{stats.totalQty}</h6>
          </div>
          <div className="col-4 border-end border-white border-opacity-25">
            <small className="opacity-75 d-block">Investment</small>
            <h6 className="fw-bold mb-0">Rs {stats.totalInvestment.toLocaleString()}</h6>
          </div>
          <div className="col-4">
            <small className="opacity-75 d-block">Potential Rev.</small>
            <h6 className="fw-bold mb-0 text-warning">Rs {stats.totalPotentialRevenue.toLocaleString()}</h6>
          </div>
        </div>

        {/* SEARCH & FILTERS */}
        <input
          className="form-control form-control-sm mb-2 shadow-sm"
          placeholder="🔍 Search Model or IMEI..."
          onChange={e => setSearch(e.target.value)}
        />
        <div className="d-flex gap-1">
          <input
            type="date"
            className="form-control form-control-sm shadow-sm"
            onChange={e => setDates({ ...dates, start: e.target.value })}
          />
          <input
            type="date"
            className="form-control form-control-sm shadow-sm"
            onChange={e => setDates({ ...dates, end: e.target.value })}
          />
        </div>

        <div className="text-center mt-2 pt-1 border-top border-white border-opacity-10">
          <small className="opacity-75">Expected Profit:</small>
          <span className="fw-bold">Rs {(stats.totalPotentialRevenue - stats.totalInvestment).toLocaleString()}</span>
        </div>
      </div>

      {/* PRODUCT LIST */}
      <div className="p-2">
        {modelGroups.length === 0 && !loading && <div className="text-center py-5 text-muted">No items found.</div>}

        {Object.entries(modelGroups.reduce((acc, g) => {
          const cat = g.category || "Other";
          if (!acc[cat]) acc[cat] = [];
          acc[cat].push(g);
          return acc;
        }, {})).map(([category, models]) => (
          <div key={category} className="mb-3">
            <div className="text-primary small fw-bold text-uppercase border-bottom mb-2 px-1">{category}</div>
            {models.map(model => (
              <div key={model._id} className="mb-2">
                <div
                  className="card border-0 shadow-sm py-2 px-3"
                  onClick={() => setExpandedModel(expandedModel === model._id ? null : model._id)}
                  style={{ cursor: "pointer", borderRadius: "10px" }}
                >
                  <div className="d-flex justify-content-between align-items-center">
                    <div className="text-capitalize">
                      <strong>{model._id}</strong> <br />
                      <span className="badge bg-light text-primary">Qty: {model.totalInModel}</span>
                    </div>
                    <div className="text-end text-success fw-bold">Rs {model.totalSellValue.toLocaleString()}</div>
                  </div>
                </div>

                {expandedModel === model._id && (
                  <div className="bg-white border-start border-primary border-3 ms-3 shadow-sm rounded-bottom">
                    {model.items.map(item => (
                      <div key={item._id} className="p-2 border-bottom d-flex justify-content-between">
                        <div>
                          <div className="small fw-bold">{item.color}</div>
                          <div className="text-muted" style={{ fontSize: "10px" }}>IMEI: {item.imei}</div>
                          <div className="text-muted" style={{ fontSize: "10px" }}>Dealer: {item.dealerName}</div>
                          <div className="text-muted" style={{ fontSize: "10px" }}>
                            Added: {formatDate(item.createdAt)}
                          </div>
                        </div>
                        <div className="text-end">
                          <div className="small text-muted">Cost: {item.purchasePrice}</div>
                          <div className="d-flex gap-1 mt-1">
                            <button
                              onClick={() =>
                                handleSell(item)}
                              className="btn btn-sm btn-success py-0 px-2"
                            >
                              Sell
                            </button>
                              <button onClick={() => handleLoan(item)} className="btn btn-sm btn-warning py-0 px-2 ms-1">Loan</button>

                            <button
                              onClick={() =>
                                handleDelete(item._id)}
                              className="btn btn-sm btn-outline-danger py-0 px-1"
                            >
                              🗑️
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        ))}
      </div>

      {loading && (
        <div className="text-center py-3">
          <div className="spinner-border spinner-border-sm text-primary"></div>
        </div>
      )}
    </div>
  );
}
