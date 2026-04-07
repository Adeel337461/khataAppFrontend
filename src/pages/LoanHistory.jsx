import React, {
  useCallback,
  useEffect,
  useState,
} from 'react';

import axios from 'axios';
import Swal from 'sweetalert2';

const API = import.meta.env.VITE_API_URL;

export default function LoanHistory() {
  const [loans, setLoans] = useState([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [search, setSearch] = useState("");
  const [dates, setDates] = useState({ start: "", end: "" });

  const fetchLoans = useCallback(async (pageNum, isNewSearch = false) => {
    if (loading) return;
    setLoading(true);
    try {
      const res = await axios.get(`${API}/products/loan-history`, {
        params: {
          page: pageNum,
          search,
          startDate: dates.start,
          endDate: dates.end,
        },
      });

      const newData = res.data;
      setLoans(prev => isNewSearch ? newData : [...prev, ...newData]);

      // If we got less than 10, there's no more data to load
      setHasMore(newData.length === 10);
    } catch (err) {
      console.error("Error fetching loans", err);
    } finally {
      setLoading(false);
    }
  }, [search, dates, loading]);

  // Trigger on Search/Date change
  useEffect(() => {
    setPage(1);
    fetchLoans(1, true);
  }, [search, dates]);

  const handleScroll = (e) => {
    const { scrollTop, clientHeight, scrollHeight } = e.currentTarget;
    if (scrollHeight - scrollTop <= clientHeight + 50 && hasMore && !loading) {
      const nextPage = page + 1;
      setPage(nextPage);
      fetchLoans(nextPage, false);
    }
  };

  const totalPending = loans.reduce((acc, item) => acc + (item.finalSalePrice - item.amountPaid), 0);

  const handlePayment = async (item) => {
    const remaining = item.finalSalePrice - item.amountPaid;

    const { value: payment } = await Swal.fire({
      title: "Receive Payment",
      text: `Remaining Due: Rs ${remaining.toLocaleString()}`,
      input: "number",
      inputLabel: "Enter amount received (PKR)",
      inputPlaceholder: "e.g. 5000",
      showCancelButton: true,
      confirmButtonText: "Update Payment",
      confirmButtonColor: "#ffc107", // Matching warning color
    });

    if (payment) {
      try {
        await axios.put(`${API}/products/update-loan-payment/${item._id}`, {
          paymentAmount: payment,
        });

        Swal.fire("Success!", "Payment updated. If fully paid, item moved to Sales.", "success");
        fetchLoans(1, true); // Refresh the list
      } catch (err) {
        Swal.fire("Error", "Could not update payment", "error");
      }
    }
  };
  return (
    <div onScroll={handleScroll} style={{ height: "85vh", overflowY: "auto", paddingBottom: "80px" }}>
      {/* HEADER SECTION */}
      <div className="sticky-top bg-white pt-2 shadow-sm" style={{ zIndex: 1020 }}>
        <div className="card border-0 bg-warning text-dark mx-2 mb-2" style={{ borderRadius: "15px" }}>
          <div className="card-body py-3">
            <h6 className="opacity-75 small text-uppercase fw-bold">Loan Summary</h6>
            <div className="d-flex justify-content-between align-items-center">
              <h4 className="fw-bold mb-0">Rs {totalPending.toLocaleString()}</h4>
              <span className="badge bg-dark">Pending</span>
            </div>
          </div>
        </div>

        {/* FILTERS */}
        <div className="px-2 pb-2">
          <input
            className="form-control form-control-sm mb-2 shadow-sm"
            placeholder="🔍 Search Customer or IMEI..."
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

      {/* LOAN LIST */}
      <div className="px-2 mt-3">
        {loans.length === 0 && !loading ? <div className="text-center py-5 text-muted">No loans found.</div> : (
          loans.map((item) => (
            <div key={item._id} className="card border-0 shadow-sm mb-2" style={{ borderRadius: "12px" }}>
              <div className="card-body py-2">
                <div className="d-flex justify-content-between align-items-start">
                  <div>
                    <strong className="text-primary text-capitalize">{item.customerName || "Walk-in Customer"}</strong>
                    <div className="text-muted small fw-bold">{item.model}</div>
                    <div className="text-muted" style={{ fontSize: "10px" }}>
                      IMEI: {item.imei} <br />
                      Loan Date: {new Date(item.soldAt).toLocaleDateString("en-GB")}
                    </div>
                  </div>
                  <div className="text-end">
                    <div className="text-danger fw-bold" style={{ fontSize: "14px" }}>
                      Due: Rs {(item.finalSalePrice - item.amountPaid).toLocaleString()}
                    </div>
                    <div className="text-muted mb-2" style={{ fontSize: "10px" }}>
                      Total: {item.finalSalePrice.toLocaleString()} <br />
                      Paid: {item.amountPaid.toLocaleString()}
                    </div>

                    {/* 2. ADD UPDATE BUTTON */}
                    <button
                      onClick={() =>
                        handlePayment(item)}
                      className="btn btn-sm btn-warning py-0 px-2 fw-bold"
                      style={{ fontSize: "11px", borderRadius: "5px" }}
                    >
                      Receive Pay 💵
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* LOADING SPINNER */}
      {loading && (
        <div className="text-center py-3">
          <div className="spinner-border spinner-border-sm text-warning"></div>
        </div>
      )}

      {!hasMore && loans.length > 0 && <div className="text-center text-muted small py-3">End of loan records.</div>}
    </div>
  );
}
