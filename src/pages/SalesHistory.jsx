import React, {
  useCallback,
  useEffect,
  useState,
} from 'react';

import axios from 'axios';

const API = import.meta.env.VITE_API_URL;

export default function SalesHistory() {
  const [sales, setSales] = useState([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  
  // Filter States
  const [search, setSearch] = useState("");
  const [dates, setDates] = useState({ start: "", end: "" });

  const fetchSales = useCallback(async (pageNum, isNewSearch = false) => {
    if (loading) return;
    setLoading(true);
    try {
      const res = await axios.get(`${API}/products/sales-history`, {
        params: { 
          page: pageNum, 
          search, 
          startDate: dates.start, 
          endDate: dates.end 
        }
      });

      const newData = res.data;
      // If it's a new search, replace the list; otherwise, append to it
      setSales(prev => isNewSearch ? newData : [...prev, ...newData]);
      
      // If the backend returns fewer than 10 items, we've reached the end
      setHasMore(newData.length === 10); 
    } catch (err) {
      console.error("Error fetching sales", err);
    } finally {
      setLoading(false);
    }
  }, [search, dates, loading]);

  // Reset page and data when filters change
  useEffect(() => {
    setPage(1);
    fetchSales(1, true);
  }, [search, dates]);

  const handleScroll = (e) => {
    const { scrollTop, clientHeight, scrollHeight } = e.currentTarget;
    // Load more when user is 50px from the bottom
    if (scrollHeight - scrollTop <= clientHeight + 50 && hasMore && !loading) {
      const nextPage = page + 1;
      setPage(nextPage);
      fetchSales(nextPage, false);
    }
  };

  // Totals based on currently loaded/filtered items
  const totalInvestment = sales.reduce((acc, item) => acc + item.purchasePrice, 0);
  const totalRevenue = sales.reduce((acc, item) => acc + item.finalSalePrice, 0);
  const totalProfit = totalRevenue - totalInvestment;

  return (
    <div onScroll={handleScroll} style={{ height: "85vh", overflowY: "auto", paddingBottom: "80px" }}>
      
      {/* STICKY FILTER & SUMMARY HEADER */}
      <div className="sticky-top bg-white pt-2 shadow-sm" style={{ zIndex: 1020 }}>
        {/* SALES SUMMARY CARD */}
        <div className="card border-0 bg-success text-white mx-2 mb-2" style={{ borderRadius: "15px" }}>
          <div className="card-body py-3">
            <h6 className="opacity-75 small text-uppercase fw-bold">Sales Performance</h6>
            <div className="row mt-2">
              <div className="col-6 border-end border-white border-opacity-25">
                <small className="d-block opacity-75">Cost of Items</small>
                <span className="fw-bold fs-6">Rs {totalInvestment.toLocaleString()}</span>
              </div>
              <div className="col-6">
                <small className="d-block opacity-75">Net Profit</small>
                <span className="fw-bold fs-6 text-warning">Rs {totalProfit.toLocaleString()}</span>
              </div>
            </div>
          </div>
        </div>

        {/* SEARCH & DATE FILTERS */}
        <div className="px-2 pb-2">
          <input
            className="form-control form-control-sm mb-2 shadow-sm"
            placeholder="🔍 Search Sold Model or IMEI..."
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
        </div>
      </div>

      <h6 className="text-muted fw-bold mt-3 mb-3 px-2">Recent Sales ({sales.length})</h6>

      <div className="px-2">
        {sales.length === 0 && !loading ? (
          <div className="text-center py-5 text-muted">No matching sales found.</div>
        ) : (
          sales.map((item) => (
            <div key={item._id} className="card border-0 shadow-sm mb-2" style={{ borderRadius: "12px" }}>
              <div className="card-body py-2">
                <div className="d-flex justify-content-between align-items-start">
                  <div>
                    <strong className="text-capitalize">{item.model}</strong>
                    <div className="text-muted" style={{ fontSize: "11px" }}>
                      IMEI: {item.imei} <br/>
                      Sold on: {new Date(item.soldAt).toLocaleDateString("en-GB", { day: 'numeric', month: 'long', year: 'numeric' })}
                    </div>
                  </div>
                  <div className="text-end">
                    <div className="text-success fw-bold" style={{ fontSize: "14px" }}>
                        +{ (item.finalSalePrice - item.purchasePrice).toLocaleString() }
                    </div>
                    <div className="text-muted small" style={{ fontSize: "10px" }}>
                      Cost: {item.purchasePrice.toLocaleString()} <br/>
                      Sold: {item.finalSalePrice.toLocaleString()}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {loading && (
        <div className="text-center py-3">
          <div className="spinner-border spinner-border-sm text-success"></div>
          <div className="small text-muted mt-1">Loading more sales...</div>
        </div>
      )}
      
      {!hasMore && sales.length > 0 && (
        <div className="text-center text-muted small py-3">
          End of sales history.
        </div>
      )}
    </div>
  );
}