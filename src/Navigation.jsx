import React, { useState, useEffect, useRef } from 'react';
import "./Navigation.css";
import { getCurrentUser } from "./cartService";
import Swal from 'sweetalert2';

export default function Navigation({ activePage, onPageChange, search, setSearch, cartCount = 0 }) {
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

  const go = (page) => (event) => {
    event.preventDefault();
    onPageChange(page);
    setMobileMenuOpen(false);
  };

  const handleSearch = (event) => {
    const value = event.target.value;
    setSearch(value);
    if (activePage !== 'p' && value.length > 0) {
      onPageChange('p');
    }
  };

  const toggleUserMenu = () => {
    setShowUserMenu((prev) => !prev);
  };

  const handleSignOut = (event) => {
    event.preventDefault();
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
        setTimeout(() => onPageChange('home'), 1500);
      }
    });
  };

  const searchContainerClass = `search-box-container mx-3 d-none d-md-flex ${activePage === 'p' ? 'd-none' : ''}`;
  const mobileSearchClass = `w-100 px-3 pb-2 d-md-none ${activePage === 'p' ? 'd-none' : ''}`;

  return (
    <nav className={`navigation ${mobileMenuOpen ? 'mobile-menu-open' : ''}`}>
      <div className="d-flex align-items-center justify-content-between w-100">
        <h2 className="heading mb-0" onClick={go('home')}>
          Shopmaster
        </h2>

        <div className={searchContainerClass}>
          <input
            type="text"
            className="form-control border-0 bg-light"
            placeholder="Search for products..."
            value={search}
            onChange={handleSearch}
            aria-label="Search products"
          />
        </div>

        <button
          className="mobile-menu-toggle d-md-none"
          aria-label="Toggle menu"
          onClick={() => setMobileMenuOpen((prev) => !prev)}
        >
          {mobileMenuOpen ? '✕' : '☰'}
        </button>

        <ul className={`navigation-links mb-0 ${mobileMenuOpen ? 'd-flex flex-column' : 'd-none d-md-flex align-items-center'}`}>
          <li className={activePage === 'home' ? 'active-nav-link' : ''}>
            <a href="#home" onClick={go('home')}>
              Home
            </a>
          </li>
          <li className={activePage === 'p' ? 'active-nav-link' : ''}>
            <a href="#p" onClick={go('p')}>
              Products
            </a>
          </li>
          <li className={activePage === 'Cart' ? 'active-nav-link' : ''}>
            <a href="#Cart" onClick={go('Cart')} className="position-relative">
              Cart ({cartCount})
            </a>
          </li>
          {!currentUser ? (
            <li className={activePage === 'login' ? 'active-nav-link' : ''}>
              <a href="#login" onClick={go('login')}>
                Login
              </a>
            </li>
          ) : (
            <li ref={userMenuRef} className={activePage === 'dashboard' ? 'active-nav-link' : ''} style={{ position: 'relative' }}>
              <a href="#dashboard" onClick={go('dashboard')}>
                {currentUser.name ? currentUser.name.split(' ')[0] : 'User'}
              </a>
            </li>
          )}
        </ul>
      </div>

      <div className={mobileSearchClass}>
        <input
          type="text"
          className="form-control border-0 bg-light"
          placeholder="Search for products..."
          value={search}
          onChange={handleSearch}
        />
      </div>
    </nav>
  );
}