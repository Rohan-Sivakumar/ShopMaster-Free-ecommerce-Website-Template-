import React, { useState, useEffect } from 'react';
import './AdminPanel.css';

const AdminPanel = () => {
  const [stats, setStats] = useState({
    totalViews: 0,
    totalOrders: 0,
    todayViews: 0,
    todayOrders: 0,
    ordersHistory: []
  });

  // Load stats from localStorage
  const loadStats = () => {
    const savedStats = JSON.parse(localStorage.getItem('adminStats') || '{}');
    setStats({
      totalViews: savedStats.totalViews || 0,
      totalOrders: savedStats.totalOrders || 0,
      todayViews: savedStats.todayViews || 0,
      todayOrders: savedStats.todayOrders || 0,
      ordersHistory: savedStats.ordersHistory || []
    });
  };

  useEffect(() => {
    // Initial load
    loadStats();
    
    // Listen for new orders
    const handleNewOrder = () => {
      loadStats();
    };

    window.addEventListener('newOrder', handleNewOrder);
    
    // Auto-refresh every 30 minutes
    const intervalId = setInterval(loadStats, 30 * 60 * 1000);
    
    return () => {
      window.removeEventListener('newOrder', handleNewOrder);
      clearInterval(intervalId);
    };
  }, []);

  const getRecentOrders = () => {
    return stats.ordersHistory.slice(0, 10);
  };

  return (
    <div className="admin-panel">
      <div className="admin-header">
        <div>
          <h2>Admin Dashboard</h2>
          <small className="text-muted">Real-time statistics and orders</small>
        </div>
        <button className="btn btn-info btn-sm" onClick={loadStats}>
          <i className="bi bi-arrow-clockwise"></i> Refresh
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
        <h3>Recent Orders ({stats.ordersHistory.length} total)</h3>
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
                {getRecentOrders().map(order => (
                  <tr key={order.id}>
                    <td>#{String(order.id).slice(-6)}</td>
                    <td>{new Date(order.date).toLocaleString()}</td>
                    <td>{order.user}</td>
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
        <h3>Quick Actions</h3>
        <div className="action-buttons">
          <button className="btn btn-primary">
            <i className="bi bi-download"></i> Export Data
          </button>
          <button className="btn btn-success">
            <i className="bi bi-graph-up"></i> View Analytics
          </button>
          <button className="btn btn-warning">
            <i className="bi bi-gear"></i> Settings
          </button>
        </div>
      </div>
    </div>
  );
};

export default AdminPanel;