import React, { useState } from 'react';

import axios from 'axios';
import Swal from 'sweetalert2';

const API = import.meta.env.VITE_API_URL;

export default function ProductForm() {
  const initialState = {
    category: "",
    model: "",
    imei: "",
    purchasePrice: "",
    sellPrice: "",
    dealerName: "",
    color: "",
  };

  const [form, setForm] = useState(initialState);
  const [isAdding, setIsAdding] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsAdding(true);

    try {
      await axios.post(`${API}/products`, form);
      
      Swal.fire({
        icon: 'success',
        title: 'Inventory Updated',
        text: `${form.model} added successfully!`,
        timer: 2000,
        showConfirmButton: false,
      });

      setForm(initialState);
    } catch (error) {
      console.error(error);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Failed to add product. Check your connection.',
        confirmButtonColor: '#0d6efd',
      });
    } finally {
      setIsAdding(false);
    }
  };

  return (
    <div className="card shadow-sm border-0 mt-3">
      <div className="card-header bg-white border-0 py-3">
        <h5 className="fw-bold mb-0 text-primary">➕ Add New Inventory</h5>
      </div>
      <div className="card-body">
        <form onSubmit={handleSubmit}>
          <div className="row">
            <div className="col-md-6 mb-2">
              <label className="small fw-bold text-muted">Category</label>
              <input
                className="form-control"
                placeholder="e.g. Smartphone"
                value={form.category}
                onChange={(e) => setForm({ ...form, category: e.target.value })}
                required
              />
            </div>
            <div className="col-md-6 mb-2">
              <label className="small fw-bold text-muted">Model Name</label>
              <input
                className="form-control"
                placeholder="e.g. iPhone 15 Pro"
                value={form.model}
                onChange={(e) => setForm({ ...form, model: e.target.value })}
                required
              />
            </div>
          </div>

          <div className="row">
            <div className="col-md-6 mb-2">
              <label className="small fw-bold text-muted">IMEI Number</label>
              <input
                className="form-control"
                placeholder="15-digit number"
                value={form.imei}
                onChange={(e) => setForm({ ...form, imei: e.target.value })}
                required
              />
            </div>
            <div className="col-md-6 mb-2">
              <label className="small fw-bold text-muted">Color</label>
              <input
                className="form-control"
                placeholder="e.g. Natural Titanium"
                value={form.color}
                onChange={(e) => setForm({ ...form, color: e.target.value })}
              />
            </div>
          </div>

          <div className="row">
            <div className="col-md-6 mb-2">
              <label className="small fw-bold text-muted">Purchase Price (Cost)</label>
              <input
                type="number"
                className="form-control border-danger-subtle"
                placeholder="What you paid"
                value={form.purchasePrice}
                onChange={(e) => setForm({ ...form, purchasePrice: e.target.value })}
                required
              />
            </div>
            <div className="col-md-6 mb-2">
              <label className="small fw-bold text-muted">Selling Price (Target)</label>
              <input
                type="number"
                className="form-control border-success-subtle"
                placeholder="Expected Sale"
                value={form.sellPrice}
                onChange={(e) => setForm({ ...form, sellPrice: e.target.value })}
                required
              />
            </div>
          </div>

          <div className="mb-3">
            <label className="small fw-bold text-muted">Dealer Name</label>
            <input
              className="form-control"
              placeholder="Supplier/Dealer name"
              value={form.dealerName}
              onChange={(e) => setForm({ ...form, dealerName: e.target.value })}
            />
          </div>

          <button 
            type="submit"
            className="btn btn-primary w-100 py-2 fw-bold" 
            disabled={isAdding}
          >
            {isAdding ? (
              <><span className="spinner-border spinner-border-sm me-2"></span> Saving...</>
            ) : (
              "Save to Inventory"
            )}
          </button>
        </form>
      </div>
    </div>
  );
}