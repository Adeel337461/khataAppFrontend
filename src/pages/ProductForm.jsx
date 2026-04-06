import React, { useState } from 'react';

import axios from 'axios';
import Swal from 'sweetalert2'; // Swapped Toastify for SweetAlert2

// In Vite, environment variables must start with VITE_ 
// and are accessed via import.meta.env
const API = import.meta.env.VITE_API_URL;

export default function ProductForm() {
  const [form, setForm] = useState({
    category: "",
    model: "",
    imei: "",
    price: "",
    color: "",
  });

  const [isAdding, setIsAdding] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsAdding(true);

    try {
      // Ensure your .env file has VITE_API_URL defined
      await axios.post(`${API}/products`, form);
      
      // SweetAlert2 Success Message
      Swal.fire({
        icon: 'success',
        title: 'Product Added!',
        text: 'Inventory has been updated successfully.',
        timer: 2000,
        showConfirmButton: false,
        background: '#fff',
      });

      // Reset form
      setForm({ category: "", model: "", imei: "", price: "", color: "" });
    } catch (error) {
      console.error(error);
      
      // SweetAlert2 Error Message
      Swal.fire({
        icon: 'error',
        title: 'Oops...',
        text: 'Failed to add product. Please try again.',
        confirmButtonColor: '#0d6efd',
      });
    } finally {
      setIsAdding(false);
    }
  };

  return (
    <div className="card shadow-sm border-0 mt-3">
      <div className="card-header bg-white border-0">
        <h5 className="fw-bold mb-0">Add New Item</h5>
      </div>
      <div className="card-body">
        <form onSubmit={handleSubmit}>
          <div className="mb-2">
            <label className="small fw-bold text-muted">Category</label>
            <input
              className="form-control"
              placeholder="e.g. Smartphone"
              value={form.category}
              onChange={(e) => setForm({ ...form, category: e.target.value })}
              required
            />
          </div>

          <div className="mb-2">
            <label className="small fw-bold text-muted">Model</label>
            <input
              className="form-control"
              placeholder="e.g. iPhone 15 Pro"
              value={form.model}
              onChange={(e) => setForm({ ...form, model: e.target.value })}
              required
            />
          </div>

          <div className="mb-2">
            <label className="small fw-bold text-muted">Color</label>
            <input
              className="form-control"
              placeholder="e.g. Titanium Gray"
              value={form.color}
              onChange={(e) => setForm({ ...form, color: e.target.value })}
            />
          </div>

          <div className="mb-2">
            <label className="small fw-bold text-muted">IMEI Number</label>
            <input
              className="form-control"
              placeholder="15-digit number"
              value={form.imei}
              onChange={(e) => setForm({ ...form, imei: e.target.value })}
              required
            />
          </div>

          <div className="mb-3">
            <label className="small fw-bold text-muted">Price (PKR)</label>
            <input
              type="number"
              className="form-control"
              placeholder="0.00"
              value={form.price}
              onChange={(e) => setForm({ ...form, price: e.target.value })}
              required
            />
          </div>

          <button 
            type="submit"
            className="btn btn-primary w-100 d-flex align-items-center justify-content-center py-2" 
            disabled={isAdding}
          >
            {isAdding ? (
              <>
                <span className="spinner-border spinner-border-sm me-2"></span>
                Processing...
              </>
            ) : (
              "➕ Save to Inventory"
            )}
          </button>
        </form>
      </div>
    </div>
  );
}