import React, { useState, useEffect } from "react";
import "./Navigation.css";
import { getCurrentUser } from "./cartService";

export default function Navigation({ activePage, onPageChange, cartCount = 0 }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);

  // Check if user is logged in
  useEffect(() => {
    const user = getCurrentUser();
    setCurrentUser(user);

    // Listen for user changes
    const handleUserChange = () => {
      const updatedUser = getCurrentUser();
      setCurrentUser(updatedUser);
    };

    window.addEventListener('userChanged', handleUserChange);
    return () => window.removeEventListener('userChanged', handleUserChange);
  }, []);

  const go = (page) => (e) => {
    e.preventDefault();
    onPageChange(page);
    setMobileMenuOpen(false);
  };

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  return (
    <nav className={`navigation ${mobileMenuOpen ? 'mobile-menu-open' : ''}`}>
      <h2 className="heading" onClick={() => {
        onPageChange('home');
        setMobileMenuOpen(false);
      }}>
        Shopmaster
      </h2>
      
      <button 
        className="mobile-menu-toggle" 
        onClick={toggleMobileMenu}
        aria-label="Toggle menu"
      >
        {mobileMenuOpen ? '✕' : '☰'}
      </button>
      
      <ul>
        <li className={activePage === "home" ? "active-nav-link" : ""}>
          <a href="#home" onClick={go("home")}>Home</a>
        </li>
        <li className={activePage === "p" ? "active-nav-link" : ""}>
          <a href="#product" onClick={go("p")}>Products</a>
        </li>
        {!currentUser ? (
          <li className={activePage === "login" ? "active-nav-link" : ""}>
            <a href="#login" onClick={go("login")}>Login</a>
          </li>
        ) : (
          <li className={activePage === "dashboard" ? "active-nav-link" : ""}>
            <a href="#dashboard" onClick={go("dashboard")}>
              {currentUser.name}
            </a>
          </li>
        )}
        <li className={activePage === "Cart" ? "active-nav-link" : ""}>
          <a href="#Cart" onClick={go("Cart")}>Cart ({cartCount})</a>
        </li>
      </ul>
    </nav>
  );
}
