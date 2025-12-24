import React, { useState, useEffect } from 'react';
import { getAdminStats, getRecentOrders } from './firebaseService';
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
  const [error, setError] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(null);

  // Load stats and orders from Firebase
  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const [statsData, ordersData] = await Promise.all([
        getAdminStats(),
        getRecentOrders(50)
      ]);
      
      setStats(statsData);
      setOrders(ordersData);
      setLastUpdated(new Date());
      setLoading(false);
    } catch (err) {
      console.error('Error loading admin data:', err);
      setError('Failed to load data. Please check Firebase configuration.');
      setLoading(false);
    }
  };

  useEffect(() => {
    // Initial load
    loadData();
    
    // Auto-refresh every 30 minutes (1800000 milliseconds)
    const intervalId = setInterval(loadData, 30 * 60 * 1000);
    
    return () => clearInterval(intervalId);
  }, []);

  const getRecentOrdersList = () => {
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
          <p className="mt-3 text-muted">Loading admin data from Firebase...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="admin-panel">
        <div className="alert alert-danger" role="alert">
          <h4 className="alert-heading">⚠️ Firebase Not Configured</h4>
          <p>{error}</p>
          <hr />
          <p className="mb-0">
            <strong>Setup Instructions:</strong><br />
            1. Run: <code>npm install firebase</code><br />
            2. Follow the guide in <a href="https://github.com/Rohan-Sivakumar/Shop/blob/main/FIREBASE_SETUP.md" target="_blank" className="alert-link">FIREBASE_SETUP.md</a><br />
            3. Update your Firebase config in <code>src/firebase.js</code>
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-panel">
      <div className="admin-header">
        <div>
          <h2>Admin Dashboard</h2>
          <small className="text-muted">☁️ Synced across all browsers & devices</small>
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
        {getRecentOrdersList().length === 0 ? (
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
                {getRecentOrdersList().map(order => (
                  <tr key={order.id}>
                    <td>#{order.id.slice(-6)}</td>
                    <td>{order.createdAt ? new Date(order.createdAt).toLocaleString() : 'N/A'}</td>
                    <td>
                      <div>{order.userName || 'Unknown'}</div>
                      <small className="text-muted">{order.user}</small>
                    </td>
                    <td>{order.items} items</td>
                    <td className="text-success fw-bold">₹{order.total}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Quick Actions */}
      <div className="quick-actions">
        <h3>Firebase Features</h3>
        <div className="action-buttons">
          <button className="btn btn-success" disabled>
            <i className="bi bi-check-circle"></i> Real-time Sync
          </button>
          <button className="btn btn-success" disabled>
            <i className="bi bi-globe"></i> Cross-Browser
          </button>
          <button className="btn btn-success" disabled>
            <i className="bi bi-cloud"></i> Cloud Storage
          </button>
        </div>
      </div>
    </div>
  );
};

export default AdminPanel;