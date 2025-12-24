import React, { useState, useEffect } from 'react';
import './AdminPanel.css';

const AdminPanel = () => {
  const [stats, setStats] = useState({
    totalViews: 0,
    totalOrders: 0,
    todayViews: 0,
    todayOrders: 0,
    viewsHistory: [],
    ordersHistory: []
  });

  useEffect(() => {
    // Load stats from localStorage
    const savedStats = localStorage.getItem('adminStats');
    if (savedStats) {
      setStats(JSON.parse(savedStats));
    }

    // Listen for new orders
    const handleNewOrder = (event) => {
      const orderData = event.detail;
      updateOrderStats(orderData);
    };

    window.addEventListener('newOrder', handleNewOrder);
    return () => window.removeEventListener('newOrder', handleNewOrder);
  }, []);

  const updateOrderStats = (orderData) => {
    const today = new Date().toLocaleDateString();
    
    setStats(prevStats => {
      const newStats = {
        ...prevStats,
        totalOrders: prevStats.totalOrders + 1,
        todayOrders: prevStats.todayOrders + 1,
        ordersHistory: [
          {
            id: Date.now(),
            date: new Date().toISOString(),
            user: orderData.user,
            items: orderData.items,
            total: orderData.total
          },
          ...prevStats.ordersHistory
        ].slice(0, 50) // Keep last 50 orders
      };
      
      localStorage.setItem('adminStats', JSON.stringify(newStats));
      return newStats;
    });
  };

  const resetStats = () => {
    if (window.confirm('Are you sure you want to reset all statistics?')) {
      const resetStats = {
        totalViews: 0,
        totalOrders: 0,
        todayViews: 0,
        todayOrders: 0,
        viewsHistory: [],
        ordersHistory: []
      };
      setStats(resetStats);
      localStorage.setItem('adminStats', JSON.stringify(resetStats));
    }
  };

  const getRecentOrders = () => {
    return stats.ordersHistory.slice(0, 10);
  };

  return (
    <div className="admin-panel">
      <div className="admin-header">
        <h2>Admin Dashboard</h2>
        <button className="btn btn-danger btn-sm" onClick={resetStats}>
          Reset Stats
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
        <h3>Recent Orders</h3>
        {getRecentOrders().length === 0 ? (
          <div className="alert alert-info">
            No orders yet
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
                    <td>#{order.id.toString().slice(-6)}</td>
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
          <button className="btn btn-secondary">
            <i className="bi bi-graph-up"></i> View Analytics
          </button>
          <button className="btn btn-info">
            <i className="bi bi-people"></i> Manage Users
          </button>
        </div>
      </div>
    </div>
  );
};

export default AdminPanel;