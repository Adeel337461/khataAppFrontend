import React from 'react';

import {
  Link,
  Route,
  Routes,
  useLocation,
} from 'react-router-dom';

import shopImage from './assets/shop.jpeg';
import LoanHistory from './pages/LoanHistory';
import ProductForm from './pages/ProductForm';
import ProductList from './pages/ProductList';
import SalesHistory from './pages/SalesHistory';

const Home = () => (
  <div className="text-center mt-5">
    <h2 className="fw-bold text-primary">Welcome to</h2>
    <h1 className="display-4 fw-bold">Asad Mobile</h1>
    <p className="">Manage your inventory with ease.</p>
  </div>
);

export default function App() {
  const location = useLocation(); // 2. Get the current route
const overlay = "rgba(0, 0, 0, 0.6)"; 
  
  const containerStyle = {
    flex: 1,
    overflowY: "auto",
    padding: "15px",
    paddingBottom: "80px",
    backgroundImage: location.pathname === "/" 
      ? `linear-gradient(${overlay}, ${overlay}), url(${shopImage})` 
      : "none",
    backgroundSize: "cover",
    backgroundPosition: "center",
    backgroundRepeat: "no-repeat",
    color: location.pathname === "/" ? "white" : "inherit" 
  };

  return (
    <div
      className="bg-light"
      style={{
        maxWidth: "420px",
        margin: "auto",
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        position: "relative",
      }}
    >
      <div className="bg-primary text-white text-center py-3 fw-bold shadow">
        📱 Asad Mobile Shop
      </div>

      {/* 4. Apply the conditional style here */}
      <div style={containerStyle}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/add" element={<ProductForm />} />
          <Route path="/list" element={<ProductList />} />
          <Route path="/sales" element={<SalesHistory />} />
          <Route path="/loan" element={<LoanHistory />} />
        </Routes>
      </div>

      <div
        className="bg-white border-top d-flex justify-content-around py-2 position-fixed bottom-0 w-100"
        style={{ maxWidth: "420px" }}
      >
        <Link to="/" className="btn btn-link text-decoration-none text-dark">🏠 Home</Link>
        <Link to="/add" className="btn btn-link text-decoration-none text-dark">➕ Add</Link>
        <Link to="/list" className="btn btn-link text-decoration-none text-dark">📊 Products</Link>
        <Link to="/sales" className="btn btn-link text-decoration-none text-dark">💰 Sales</Link>
        <Link to="/loan" className="btn btn-link text-decoration-none text-dark">📝 Loan</Link>
      </div>
    </div>
  );
}
