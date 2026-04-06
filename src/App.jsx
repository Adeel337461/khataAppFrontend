import React from 'react';

import {
  Link,
  Route,
  Routes,
} from 'react-router-dom'; // Added Link here

import ProductForm from './pages/ProductForm';
import ProductList from './pages/ProductList';

const Home = () => (
  <div className="text-center mt-5">
    <h2 className="fw-bold text-primary">Welcome to</h2>
    <h1 className="display-4 fw-bold">Asad Mobile</h1>
    <p className="text-muted">Manage your inventory with ease.</p>
  </div>
);

export default function App() {
  return (
    <div className="bg-light" style={{ maxWidth: "420px", margin: "auto", minHeight: "100vh", display: "flex", flexDirection: "column", position: "relative" }}>
      
      <div className="bg-primary text-white text-center py-3 fw-bold shadow">
        📱 Asad Mobile Shop
      </div>

      <div style={{ flex: 1, overflowY: "auto", padding: "15px", paddingBottom: "80px" }}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/add" element={<ProductForm/>} />
          <Route path="/list" element={<ProductList/>} />
        </Routes>
      </div>

      <div className="bg-white border-top d-flex justify-content-around py-2 position-fixed bottom-0 w-100" style={{ maxWidth: "420px" }}>
        <Link to="/" className="btn btn-link text-decoration-none text-dark">🏠 Home</Link>
        <Link to="/add" className="btn btn-link text-decoration-none text-dark">➕ Add</Link>
        <Link to="/list" className="btn btn-link text-decoration-none text-dark">📊 Products</Link>
      </div>
    </div>
  );
}