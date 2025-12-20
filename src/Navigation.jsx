
import React, { useState, useEffect } from "react";
import { user } from "./index.js";
import us from "./assets/login.json";
var users = JSON.parse(JSON.stringify(us));

const getInitialCartCount = () => {
    return users?.[user]?.cart?.length ?? 0;
};

export default function Navigation({ activePage, onPageChange }) {
  const [cartCount, setCartCount] = useState(getInitialCartCount());

  useEffect(() => {
    const handleCartUpdate = (event) => {
      setCartCount(event.detail.count);
    };
    window.addEventListener("cartUpdated", handleCartUpdate);
    return () => window.removeEventListener("cartUpdated", handleCartUpdate);
  }, []);

  const go = (page) => (e) => {
    e.preventDefault();
    onPageChange(page);
  };

  return (
    <nav className="navigation">
        <h2 className="heading" style={{marginLeft: "40px",marginRight: "800px",cursor: "pointer"}} onClick={() => window.location.href='/'}>Shopmaster</h2>
      <ul>
        
        <li className={activePage === "home" ? "active-nav-link" : ""}><a href="#home" onClick={go("home")}>Home</a></li>
        <li className={activePage === "p" ? "active-nav-link" : ""}><a href="#product" onClick={go("p")}>Products</a></li>
        {user === "anonymous" ? (
          <li className={activePage === "login" ? "active-nav-link" : ""}>
            <a href="#login" onClick={go("login")}>Login</a>
          </li>
        ) : (
          <li className={activePage === "dashboard" ? "active-nav-link" : ""}>
            <a href="#dashboard" onClick={go("dashboard")}>Dashboard</a>
          </li>
        )}
        <li className={activePage === "Cart" ? "active-nav-link" : ""}>
          <a href="#Cart" onClick={go("Cart")}>
            Cart ({cartCount})
          </a>
        </li>
      </ul>
    </nav>
  );

