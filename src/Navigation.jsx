import React, { useState, useEffect, useRef } from "react";
import "./Navigation.css";
import { getCurrentUser } from "./cartService";
import Swal from 'sweetalert2';

export default function Navigation({ activePage, onPageChange, cartCount = 0 }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const userMenuRef = useRef(null);

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

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target)) {
        setShowUserMenu(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const go = (page) => (e) => {
    e.preventDefault();
    onPageChange(page);
    setMobileMenuOpen(false);
  };

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  const toggleUserMenu = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setShowUserMenu(!showUserMenu);
  };

  const handleSignOut = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setShowUserMenu(false);
    
    Swal.fire({
      title: 'Sign Out?',
      text: 'Are you sure you want to sign out?',
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: 'Yes, sign out',
      cancelButtonText: 'Cancel'
    }).then((result) => {
      if (result.isConfirmed) {
        sessionStorage.removeItem('authUser');
        sessionStorage.removeItem('authToken');
        
        window.dispatchEvent(new Event('userChanged'));
        
        Swal.fire({
          icon: 'success',
          title: 'Signed Out',
          text: 'You have been signed out successfully',
          timer: 1500,
          showConfirmButton: false
        });
        
        setTimeout(() => {
          onPageChange('home');
        }, 1500);
      }
    });
  };

  // Get first name from full name
  const getFirstName = (fullName) => {
    if (!fullName) return 'User';
    return fullName.split(' ')[0];
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
          <li className={activePage === "dashboard" ? "active-nav-link" : ""} ref={userMenuRef} style={{position: 'relative'}}>
            <a href="#dashboard" onClick={toggleUserMenu}>
              {getFirstName(currentUser.name)} ▾
            </a>
            {showUserMenu && (
              <div style={{
                position: 'absolute',
                top: '100%',
                right: 0,
                backgroundColor: 'white',
                border: '1px solid #ddd',
                borderRadius: '4px',
                boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
                minWidth: '150px',
                zIndex: 1000,
                marginTop: '5px'
              }}>
                <a 
                  href="#dashboard" 
                  onClick={(e) => {
                    e.preventDefault();
                    setShowUserMenu(false);
                    onPageChange('dashboard');
                  }}
                  style={{
                    display: 'block',
                    padding: '10px 15px',
                    color: '#333',
                    textDecoration: 'none',
                    borderBottom: '1px solid #eee'
                  }}
                  onMouseOver={(e) => e.target.style.backgroundColor = '#f5f5f5'}
                  onMouseOut={(e) => e.target.style.backgroundColor = 'white'}
                >
                  Dashboard
                </a>
                <a 
                  href="#signout" 
                  onClick={handleSignOut}
                  style={{
                    display: 'block',
                    padding: '10px 15px',
                    color: '#dc3545',
                    textDecoration: 'none'
                  }}
                  onMouseOver={(e) => e.target.style.backgroundColor = '#f5f5f5'}
                  onMouseOut={(e) => e.target.style.backgroundColor = 'white'}
                >
                  Sign Out
                </a>
              </div>
            )}
          </li>
        )}
        <li className={activePage === "Cart" ? "active-nav-link" : ""}>
          <a href="#Cart" onClick={go("Cart")}>Cart ({cartCount})</a>
        </li>
      </ul>
    </nav>
  );
}
