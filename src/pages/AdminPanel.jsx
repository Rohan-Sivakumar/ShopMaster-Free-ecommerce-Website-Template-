import React, { useState } from 'react';
import '../styles/AdminPanel.css';
import Swal from 'sweetalert2';

const AdminPanel = ({ onLogout }) => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [products, setProducts] = useState([
    {
      id: 1,
      name: 'Wireless Headphones',
      price: 1299,
      stock: 15,
      category: 'Electronics',
      status: 'Active',
    },
    {
      id: 2,
      name: 'USB-C Cable',
      price: 299,
      stock: 50,
      category: 'Accessories',
      status: 'Active',
    },
    {
      id: 3,
      name: 'Phone Stand',
      price: 499,
      stock: 0,
      category: 'Accessories',
      status: 'Out of Stock',
    },
  ]);

  const [newProduct, setNewProduct] = useState({
    name: '',
    price: '',
    stock: '',
    category: '',
  });

  const [orders, setOrders] = useState([
    { id: 'ORD001', customer: 'John Doe', amount: 2599, status: 'Delivered', date: '2025-12-18' },
    { id: 'ORD002', customer: 'Jane Smith', amount: 1299, status: 'Processing', date: '2025-12-19' },
    { id: 'ORD003', customer: 'Mike Johnson', amount: 3999, status: 'Shipped', date: '2025-12-20' },
  ]);

  const stats = {
    totalSales: 45999,
    totalOrders: 342,
    totalProducts: products.length,
    totalCustomers: 1250,
    activeUsers: 89,
    revenue: '₹45,99,900',
  };

  const handleAddProduct = () => {
    if (!newProduct.name || !newProduct.price || !newProduct.stock || !newProduct.category) {
      Swal.fire('Error', 'Please fill all fields', 'error');
      return;
    }

    const product = {
      id: products.length + 1,
      name: newProduct.name,
      price: parseInt(newProduct.price),
      stock: parseInt(newProduct.stock),
      category: newProduct.category,
      status: 'Active',
    };

    setProducts([...products, product]);
    setNewProduct({ name: '', price: '', stock: '', category: '' });
    Swal.fire('Success', 'Product added successfully', 'success');
  };

  const handleDeleteProduct = (id) => {
    Swal.fire({
      title: 'Are you sure?',
      text: 'This product will be deleted permanently',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#dc3545',
      confirmButtonText: 'Delete',
    }).then((result) => {
      if (result.isConfirmed) {
        setProducts(products.filter((p) => p.id !== id));
        Swal.fire('Deleted', 'Product deleted successfully', 'success');
      }
    });
  };

  const handleUpdateOrderStatus = (orderId) => {
    Swal.fire({
      title: 'Update Order Status',
      input: 'select',
      inputOptions: {
        Processing: 'Processing',
        Shipped: 'Shipped',
        Delivered: 'Delivered',
        Cancelled: 'Cancelled',
      },
      showCancelButton: true,
      confirmButtonText: 'Update',
      confirmButtonColor: '#007bff',
    }).then((result) => {
      if (result.isConfirmed && result.value) {
        setOrders(
          orders.map((order) =>
            order.id === orderId ? { ...order, status: result.value } : order
          )
        );
        Swal.fire('Success', 'Order status updated', 'success');
      }
    });
  };

  return (
    <div className="admin-panel">
      {/* Header */}
      <div className="admin-header">
        <div className="admin-title">
          <h1>⚙️ Admin Dashboard</h1>
          <p>Manage your store</p>
        </div>
        <button className="logout-btn" onClick={onLogout}>
          🚪 Logout
        </button>
      </div>

      {/* Navigation Tabs */}
      <div className="admin-tabs">
        <button
          className={`tab-btn ${activeTab === 'dashboard' ? 'active' : ''}`}
          onClick={() => setActiveTab('dashboard')}
        >
          📊 Dashboard
        </button>
        <button
          className={`tab-btn ${activeTab === 'products' ? 'active' : ''}`}
          onClick={() => setActiveTab('products')}
        >
          📦 Products
        </button>
        <button
          className={`tab-btn ${activeTab === 'orders' ? 'active' : ''}`}
          onClick={() => setActiveTab('orders')}
        >
          🛒 Orders
        </button>
        <button
          className={`tab-btn ${activeTab === 'analytics' ? 'active' : ''}`}
          onClick={() => setActiveTab('analytics')}
        >
          📈 Analytics
        </button>
      </div>

      {/* Content Sections */}
      <div className="admin-content">
        {/* Dashboard Tab */}
        {activeTab === 'dashboard' && (
          <div className="dashboard-section">
            <h2>Dashboard Overview</h2>
            <div className="stats-grid">
              <div className="stat-card">
                <div className="stat-icon">💰</div>
                <div className="stat-content">
                  <p className="stat-label">Total Revenue</p>
                  <p className="stat-value">{stats.revenue}</p>
                </div>
              </div>
              <div className="stat-card">
                <div className="stat-icon">📦</div>
                <div className="stat-content">
                  <p className="stat-label">Total Products</p>
                  <p className="stat-value">{stats.totalProducts}</p>
                </div>
              </div>
              <div className="stat-card">
                <div className="stat-icon">🛒</div>
                <div className="stat-content">
                  <p className="stat-label">Total Orders</p>
                  <p className="stat-value">{stats.totalOrders}</p>
                </div>
              </div>
              <div className="stat-card">
                <div className="stat-icon">👥</div>
                <div className="stat-content">
                  <p className="stat-label">Total Customers</p>
                  <p className="stat-value">{stats.totalCustomers}</p>
                </div>
              </div>
              <div className="stat-card">
                <div className="stat-icon">👤</div>
                <div className="stat-content">
                  <p className="stat-label">Active Users</p>
                  <p className="stat-value">{stats.activeUsers}</p>
                </div>
              </div>
              <div className="stat-card">
                <div className="stat-icon">💵</div>
                <div className="stat-content">
                  <p className="stat-label">Avg Order Value</p>
                  <p className="stat-value">₹{(stats.totalSales / stats.totalOrders).toFixed(0)}</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Products Tab */}
        {activeTab === 'products' && (
          <div className="products-section">
            <h2>Product Management</h2>

            {/* Add New Product Form */}
            <div className="add-product-form">
              <h3>Add New Product</h3>
              <div className="form-row">
                <input
                  type="text"
                  placeholder="Product Name"
                  value={newProduct.name}
                  onChange={(e) => setNewProduct({ ...newProduct, name: e.target.value })}
                />
                <input
                  type="number"
                  placeholder="Price (₹)"
                  value={newProduct.price}
                  onChange={(e) => setNewProduct({ ...newProduct, price: e.target.value })}
                />
                <input
                  type="number"
                  placeholder="Stock"
                  value={newProduct.stock}
                  onChange={(e) => setNewProduct({ ...newProduct, stock: e.target.value })}
                />
                <select
                  value={newProduct.category}
                  onChange={(e) => setNewProduct({ ...newProduct, category: e.target.value })}
                >
                  <option value="">Select Category</option>
                  <option value="Electronics">Electronics</option>
                  <option value="Accessories">Accessories</option>
                  <option value="Clothing">Clothing</option>
                  <option value="Books">Books</option>
                </select>
                <button onClick={handleAddProduct} className="add-btn">
                  ➕ Add Product
                </button>
              </div>
            </div>

            {/* Products Table */}
            <div className="products-table-wrapper">
              <table className="products-table">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Name</th>
                    <th>Price</th>
                    <th>Stock</th>
                    <th>Category</th>
                    <th>Status</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {products.map((product) => (
                    <tr key={product.id}>
                      <td>#{product.id}</td>
                      <td>{product.name}</td>
                      <td>₹{product.price}</td>
                      <td>
                        <span className={`stock-badge ${product.stock > 0 ? 'in-stock' : 'out-stock'}`}>
                          {product.stock}
                        </span>
                      </td>
                      <td>{product.category}</td>
                      <td>
                        <span
                          className={`status-badge ${
                            product.status === 'Active' ? 'active' : 'inactive'
                          }`}
                        >
                          {product.status}
                        </span>
                      </td>
                      <td>
                        <button
                          className="edit-btn"
                          onClick={() => Swal.fire('Edit', 'Edit functionality coming soon', 'info')}
                        >
                          ✏️
                        </button>
                        <button
                          className="delete-btn"
                          onClick={() => handleDeleteProduct(product.id)}
                        >
                          🗑️
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Orders Tab */}
        {activeTab === 'orders' && (
          <div className="orders-section">
            <h2>Order Management</h2>
            <div className="orders-table-wrapper">
              <table className="orders-table">
                <thead>
                  <tr>
                    <th>Order ID</th>
                    <th>Customer</th>
                    <th>Amount</th>
                    <th>Status</th>
                    <th>Date</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {orders.map((order) => (
                    <tr key={order.id}>
                      <td>
                        <strong>{order.id}</strong>
                      </td>
                      <td>{order.customer}</td>
                      <td>₹{order.amount}</td>
                      <td>
                        <span
                          className={`status-badge ${
                            order.status === 'Delivered'
                              ? 'delivered'
                              : order.status === 'Shipped'
                              ? 'shipped'
                              : 'processing'
                          }`}
                        >
                          {order.status}
                        </span>
                      </td>
                      <td>{order.date}</td>
                      <td>
                        <button
                          className="action-btn"
                          onClick={() => handleUpdateOrderStatus(order.id)}
                        >
                          📝 Update
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Analytics Tab */}
        {activeTab === 'analytics' && (
          <div className="analytics-section">
            <h2>Analytics & Reports</h2>
            <div className="analytics-grid">
              <div className="analytics-card">
                <h3>Monthly Sales Trend</h3>
                <div className="chart-placeholder">
                  📊 Sales Chart (Implementation Required)
                </div>
              </div>
              <div className="analytics-card">
                <h3>Top Products</h3>
                <ul className="top-products">
                  <li>🥇 Wireless Headphones - 250 units sold</li>
                  <li>🥈 USB-C Cable - 180 units sold</li>
                  <li>🥉 Phone Stand - 120 units sold</li>
                </ul>
              </div>
              <div className="analytics-card">
                <h3>Customer Distribution</h3>
                <div className="chart-placeholder">
                  🎯 Customer Chart (Implementation Required)
                </div>
              </div>
              <div className="analytics-card">
                <h3>Payment Methods</h3>
                <ul className="payment-methods">
                  <li>💳 Credit Card - 45%</li>
                  <li>📱 UPI - 35%</li>
                  <li>🏦 Debit Card - 15%</li>
                  <li>💰 Cash on Delivery - 5%</li>
                </ul>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminPanel;
