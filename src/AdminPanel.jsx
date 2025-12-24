import React, { useState, useEffect } from 'react';
import { getStats, getOrders, checkBackendHealth } from './api';
import './AdminPanel.css';

const AdminPanel = () => {
  const [stats, setStats] = useState({
    totalViews: 0,
    totalOrders: 0,
    todayViews: 0,
    todayOrders: 0
  });
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [backendOnline, setBackendOnline] = useState(false);
  const [lastUpdated, setLastUpdated] = useState(null);

  // Load stats and orders from MongoDB (with localStorage fallback)
  const loadData = async () => {
    try {
      setLoading(true);
      
      // Check if backend is available
      const isOnline = await checkBackendHealth();
      setBackendOnline(isOnline);
      
      const [statsData, ordersData] = await Promise.all([
        getStats(),
        getOrders(50)
      ]);
      
      setStats(statsData);
      setOrders(ordersData);
      setLastUpdated(new Date());
      setLoading(false);
    } catch (error) {
      console.error('Error loading admin data:', error);
      setBackendOnline(false);
      setLoading(false);
    }
  };

  useEffect(() => {
    // Initial load
    loadData();
    
    // Auto-refresh every 30 minutes
    const intervalId = setInterval(loadData, 30 * 60 * 1000);
    
    return () => clearInterval(intervalId);
  }, []);

  const getRecentOrders = () => {
    return orders.slice(0, 10);
  };

  const formatLastUpdated = () => {
    if (!lastUpdated) return '';
    return lastUpdated.toLocaleTimeString();
  };

  if (loading && orders.length === 0) {
    return (
      <div className="admin-panel">
        <div className="text-center py-5">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
          <p className="mt-3 text-muted">Loading admin data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-panel">
      <div className="admin-header">
        <div>
          <h2>Admin Dashboard</h2>
          <small className="text-muted">
            {backendOnline ? (
              <span className="text-success">☁️ MongoDB Connected - Cross-browser sync enabled</span>
            ) : (
              <span className="text-warning">⚠️ Using local storage - Backend offline</span>
            )}
          </small>
          {lastUpdated && (
            <div>
              <small className="text-muted">Last updated: {formatLastUpdated()} • Auto-refresh: Every 30 min</small>
            </div>
          )}
        </div>
        <button className="btn btn-info btn-sm" onClick={loadData} disabled={loading}>
          {loading ? (
            <>
              <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
              Refreshing...
            </>
          ) : (
            <>
              <i className="bi bi-arrow-clockwise"></i> Refresh Now
            </>
          )}
        </button>
      </div>

      {/* Stats Cards */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon" style={{background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'}}>
            <i className="bi bi-eye-fill"></i>
          </div>
          <div className="stat-details">
            <h3>{stats.totalViews}</h3>
            <p>Total Views</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon" style={{background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)'}}>
            <i className="bi bi-cart-fill"></i>
          </div>
          <div className="stat-details">
            <h3>{stats.totalOrders}</h3>
            <p>Total Orders</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon" style={{background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)'}}>
            <i className="bi bi-calendar-day"></i>
          </div>
          <div className="stat-details">
            <h3>{stats.todayViews}</h3>
            <p>Today's Views</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon" style={{background: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)'}}>
            <i className="bi bi-bag-check-fill"></i>
          </div>
          <div className="stat-details">
            <h3>{stats.todayOrders}</h3>
            <p>Today's Orders</p>
          </div>
        </div>
      </div>

      {/* Recent Orders */}
      <div className="recent-orders">
        <h3>Recent Orders ({orders.length} total)</h3>
        {getRecentOrders().length === 0 ? (
          <div className="alert alert-info">
            No orders yet. Orders will appear here when customers complete checkout.
          </div>
        ) : (
          <div className="table-responsive">
            <table className="table table-hover">
              <thead>
                <tr>
                  <th>Order ID</th>
                  <th>Date</th>
                  <th>Customer</th>
                  <th>Items</th>
                  <th>Total</th>
                </tr>
              </thead>
              <tbody>
                {getRecentOrders().map(order => {
                  const orderId = order._id || order.id || 'N/A';
                  const displayId = typeof orderId === 'string' ? orderId.slice(-6) : orderId;
                  const orderDate = order.createdAt || order.date;
                  
                  return (
                    <tr key={orderId}>
                      <td>#{displayId}</td>
                      <td>{orderDate ? new Date(orderDate).toLocaleString() : 'N/A'}</td>
                      <td>
                        <div>{order.userName || 'Unknown'}</div>
                        <small className="text-muted">{order.user}</small>
                      </td>
                      <td>{order.items} items</td>
                      <td className="text-success fw-bold">₹{order.total}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Quick Actions */}
      <div className="quick-actions">
        <h3>Backend Status</h3>
        <div className="action-buttons">
          {backendOnline ? (
            <>
              <button className="btn btn-success" disabled>
                <i className="bi bi-cloud-check"></i> MongoDB Connected
              </button>
              <button className="btn btn-success" disabled>
                <i className="bi bi-globe"></i> Cross-Browser Sync
              </button>
              <button className="btn btn-success" disabled>
                <i className="bi bi-database"></i> Cloud Database
              </button>
            </>
          ) : (
            <>
              <button className="btn btn-warning" disabled>
                <i className="bi bi-exclamation-triangle"></i> Backend Offline
              </button>
              <button className="btn btn-info" disabled>
                <i className="bi bi-hdd"></i> Using localStorage
              </button>
              <a href="/MONGODB_SETUP.md" target="_blank" className="btn btn-primary">
                <i className="bi bi-book"></i> Setup Guide
              </a>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminPanel;