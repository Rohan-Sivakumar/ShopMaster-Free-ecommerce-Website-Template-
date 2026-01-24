import React, { useState, useEffect, useRef } from 'react';
import "./Navigation.css";
import { getCurrentUser } from "./cartService";
import Swal from 'sweetalert2';

export default function Navigation({ activePage, onPageChange, search, setSearch, cartCount = 0, isAdmin = false }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const userMenuRef = useRef(null);

  useEffect(() => {
    const user = getCurrentUser();
    setCurrentUser(user);

    const handleUserChange = () => {
      const updatedUser = getCurrentUser();
      setCurrentUser(updatedUser);
    };

    window.addEventListener('userChanged', handleUserChange);
    return () => window.removeEventListener('userChanged', handleUserChange);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target)) {
        setShowUserMenu(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSearch = (e) => {
    const value = e.target.value;
    setSearch(value);
    if (activePage !== 'p' && value.length > 0) {
      onPageChange('p');
    }
  };

  const handleSignOut = (e) => {
    e.preventDefault();
    setShowUserMenu(false);
    
    Swal.fire({
      title: 'Sign Out?',
      text: 'Are you sure you want to sign out?',
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: 'Yes, sign out'
    }).then((result) => {
      if (result.isConfirmed) {
        sessionStorage.removeItem('authUser');
        sessionStorage.removeItem('authToken');
        window.dispatchEvent(new Event('userChanged'));
        onPageChange('home');
      }
    });
  };

  return (
    <nav className={`navigation sticky-top ${mobileMenuOpen ? 'mobile-menu-open' : ''}`}>
      <div className="nav-container d-flex align-items-center w-100">
        <h2 className="heading mb-0" onClick={() => onPageChange('home')}>ShopMaster</h2>

        <div className="search-box-container flex-grow-1 mx-4 d-none d-md-block">
          <div className="input-group">
            <input 
              type="text" 
              className="form-control border-0 bg-light" 
              placeholder="Search for products, brands and more..." 
              value={search}
              onChange={handleSearch}
            />
            <button className="btn btn-primary"><i className="bi bi-search"></i></button>
          </div>
        </div>

        <ul className="nav-links mb-0 d-none d-md-flex align-items-center">
          <li><a href="#" onClick={() => onPageChange('p')}>Products</a></li>
          <li>
            <a href="#" onClick={() => onPageChange('Cart')} className="position-relative">
              <i className="bi bi-cart3"></i>
              {cartCount > 0 && <span className="badge rounded-pill bg-danger ms-1">{cartCount}</span>}
            </a>
          </li>
          {currentUser ? (
            <li className="nav-item dropdown" ref={userMenuRef}>
              <a href="#" onClick={() => setShowUserMenu(!showUserMenu)}>
                <i className="bi bi-person-circle"></i> {currentUser.name.split(' ')[0]}
              </a>
              {showUserMenu && (
                <div className="dropdown-menu-custom shadow border-0">
                  <a href="#" onClick={() => {onPageChange('dashboard'); setShowUserMenu(false);}}>Dashboard</a>
                  <a href="#" onClick={() => {onPageChange('orderhistory'); setShowUserMenu(false);}}>Orders</a>
                  {isAdmin && <a href="#" className="fw-bold text-warning" onClick={() => onPageChange('admin')}>Admin Panel</a>}
                  <hr className="my-1"/>
                  <a href="#" className="text-danger" onClick={handleSignOut}>Sign Out</a>
                </div>
              )}
            </li>
          ) : (
            <li><a href="#" onClick={() => onPageChange('login')}>Login</a></li>
          )}
        </ul>
      </div>
    </nav>
  );
}