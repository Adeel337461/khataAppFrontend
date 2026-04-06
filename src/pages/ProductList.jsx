import React, {
  useCallback,
  useEffect,
  useState,
} from 'react';

import axios from 'axios';
import Swal from 'sweetalert2';

// Vite-specific environment variable access
const API = import.meta.env.VITE_API_URL;

export default function ProductList() {
  const [modelGroups, setModelGroups] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingModel, setLoadingModel] = useState(null); 
  const [expandedModel, setExpandedModel] = useState(null);

  // Stats for the Blue Sticky Header
  const [dbTotalQty, setDbTotalQty] = useState(0);
  const [dbTotalValue, setDbTotalValue] = useState(0);

  // 1. Initial Load
  const loadInitialData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${API}/products/grouped`);
      setDbTotalQty(res.data.global.totalQty);
      setDbTotalValue(res.data.global.totalValue);
      setModelGroups(res.data.groupedData);
    } catch (error) {
      // Swapped toast for Swal
      console.error(error);
      Swal.fire({
        icon: 'error',
        title: 'Fetch Failed',
        text: 'Could not load inventory data.',
        toast: true,
        position: 'top-end',
        showConfirmButton: false,
        timer: 3000
      });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadInitialData();
  }, [loadInitialData]);

  // 2. Load More Units
  const handleLoadMoreUnits = async (modelName) => {
    const currentModel = modelGroups.find(g => g._id === modelName);
    const skipCount = currentModel.items.length;

    setLoadingModel(modelName);
    try {
      const res = await axios.get(
        `${API}/products/model-details?model=${modelName}&skip=${skipCount}&limit=5`,
      );

      if (res.data.length > 0) {
        setModelGroups(prev =>
          prev.map(group => {
            if (group._id === modelName) {
              return { ...group, items: [...group.items, ...res.data] };
            }
            return group;
          })
        );
      }
    } catch (err) {
        console.log("err",err)
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Failed to load more units',
        toast: true,
        position: 'top-end',
        timer: 2000
      });
    } finally {
      setLoadingModel(null);
    }
  };

  const handleDelete = async (id) => {
    Swal.fire({
      title: "Are you sure?",
      text: "This item will be permanently removed.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#6c757d",
      confirmButtonText: "Yes, delete it!",
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          await axios.delete(`${API}/products/${id}`);
          loadInitialData();
          Swal.fire({
            title: "Deleted!",
            icon: "success",
            timer: 1500,
            showConfirmButton: false
          });
        } catch (e) {
            console.log("e",e)
          Swal.fire("Error!", "Failed to delete.", "error");
        }
      }
    });
  };

  // Group by category logic
  const categoryGrouped = modelGroups.reduce((acc, group) => {
    const cat = group.category || "General";
    if (!acc[cat]) acc[cat] = [];
    acc[cat].push(group);
    return acc;
  }, {});

  return (
    <div style={{ height: "85vh", overflowY: "auto", paddingBottom: "20px" }}>
      {/* --- GLOBAL TOTALS HEADER --- */}
      <div
        className="alert alert-primary py-3 sticky-top shadow-sm mb-3 border-0"
        style={{ borderRadius: "0 0 15px 15px", backgroundColor: "#0d6efd", color: "white", zIndex: 1020 }}
      >
        <div className="d-flex justify-content-between align-items-center">
          <div>
            <div className="small opacity-75">Total Stock</div>
            <h4 className="fw-bold mb-0">
              {dbTotalQty} <small style={{ fontSize: "12px" }}>Units</small>
            </h4>
          </div>
          <div className="text-end">
            <div className="small opacity-75">Inventory Value</div>
            <h4 className="fw-bold mb-0">Rs {dbTotalValue.toLocaleString()}</h4>
          </div>
        </div>
      </div>

      {loading && (
        <div className="text-center my-5">
          <div className="spinner-border text-primary" role="status"></div>
          <p className="mt-2 text-muted">Refreshing Inventory...</p>
        </div>
      )}

      {/* --- RENDER BY CATEGORY & MODEL --- */}
      {Object.entries(categoryGrouped).map(([category, models]) => (
        <div key={category} className="mb-4 px-2">
          <h6 className="text-primary fw-bold text-uppercase small border-bottom pb-1 mb-2 mx-1">{category}</h6>

          {models.map((model) => (
            <div key={model._id} className="mb-2">
              <div
                className="card border-0 shadow-sm"
                onClick={() => setExpandedModel(expandedModel === model._id ? null : model._id)}
                style={{ cursor: "pointer", borderRadius: "10px" }}
              >
                <div className="card-body py-2 d-flex justify-content-between align-items-center">
                  <div className="text-capitalize">
                    <strong style={{ fontSize: "1.05rem" }}>{model._id}</strong> <br />
                    <span className="badge text-primary" style={{ backgroundColor: "#e7f1ff", fontWeight: "500" }}>
                      Qty: {model.totalInModel}
                    </span>
                  </div>
                  <div className="text-end">
                    <div className="text-success fw-bold">Rs {model.totalModelValue.toLocaleString()}</div>
                    <small className="text-muted text-uppercase" style={{ fontSize: "10px" }}>
                      {expandedModel === model._id ? "▲ Close" : "▼ View Units"}
                    </small>
                  </div>
                </div>
              </div>

              {/* EXPANDED SECTION */}
              {expandedModel === model._id && (
                <div className="bg-white border-start border-primary border-3 ms-3 me-1 rounded-bottom shadow-sm">
                  {model.items.map(item => (
                    <div
                      key={item._id}
                      className="d-flex justify-content-between align-items-center p-2 border-bottom small"
                    >
                      <div>
                        <span className="text-capitalize fw-semibold">{item.color || "No Color"}</span>
                        <div className="text-muted" style={{ fontSize: "10px" }}>IMEI: {item.imei}</div>
                      </div>
                      <div className="d-flex align-items-center">
                        <span className="fw-bold me-2">Rs {item.price.toLocaleString()}</span>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDelete(item._id);
                          }}
                          className="btn btn-sm text-danger p-0 px-1"
                        >
                          🗑️
                        </button>
                      </div>
                    </div>
                  ))}

                  {/* PAGINATION */}
                  {model.items.length < model.totalInModel && (
                    <div className="p-2 text-center bg-light">
                      <button
                        className="btn btn-sm btn-outline-primary rounded-pill px-3 fw-bold"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleLoadMoreUnits(model._id);
                        }}
                        disabled={loadingModel === model._id}
                      >
                        {loadingModel === model._id
                          ? <span className="spinner-border spinner-border-sm"></span>
                          : `Load More (+${model.totalInModel - model.items.length})`
                        }
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}