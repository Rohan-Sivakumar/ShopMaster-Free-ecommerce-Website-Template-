import React, { useState, useEffect } from 'react';
import { getStats, getOrders, checkBackendHealth, getProducts, addProduct, deleteProduct, getSeller, getAllSellers, approveSeller } from './api';
import { getCurrentUser } from './cartService';
import './AdminPanel.css';
import Swal from 'sweetalert2';

const AdminPanel = () => {
  const [stats, setStats] = useState({
    totalViews: 0,
    totalOrders: 0,
    todayViews: 0,
    todayOrders: 0,
    totalProducts: 0,
    activeProducts: 0,
    totalRevenue: 0
  });
  const [orders, setOrders] = useState([]);
  const [products, setProducts] = useState([]);
  const [sellers, setSellers] = useState([]);
  const [currentSeller, setCurrentSeller] = useState(null);
  const [loading, setLoading] = useState(true);
  const [backendOnline, setBackendOnline] = useState(false);
  const [lastUpdated, setLastUpdated] = useState(null);
  const [activeTab, setActiveTab] = useState('dashboard'); // 'dashboard', 'products', or 'sellers'
  const [productLoading, setProductLoading] = useState(false);
  const [imagePreview, setImagePreview] = useState(null);

  // New product form state
  const [newProduct, setNewProduct] = useState({
    id: '',
    year: new Date().getFullYear(),
    cost: '',
    img: '',
    category: '',
    description: ''
  });

  // Load current seller info
  const loadSellerInfo = async () => {
    try {
      const user = getCurrentUser();
      if (!user) {
        console.warn('No user logged in');
        return null;
      }

      if (!user.email) {
        console.warn('User email is missing');
        return null;
      }

      const seller = await getSeller(user.email);
      setCurrentSeller(seller);
      return seller;
    } catch (error) {
      console.error('Error loading seller info:', error);
      return null;
    }
  };

  // Load stats and orders from MongoDB (with localStorage fallback)
  const loadData = async () => {
    try {
      setLoading(true);
      
      // Check if backend is available
      const isOnline = await checkBackendHealth();
      setBackendOnline(isOnline);

      // Load seller info
      const seller = await loadSellerInfo();
      
      if (!seller) {
        setLoading(false);
        return;
      }
      
      // Load data (filter by seller if not super admin)
      const sellerEmail = (seller && !seller.isSuperAdmin) ? seller.email : null;
      
      try {
        const [statsData, ordersData, productsData] = await Promise.all([
          getStats(sellerEmail),
          getOrders(50, sellerEmail),
          getProducts(sellerEmail)
        ]);
        
        setStats(statsData || {});
        setOrders(Array.isArray(ordersData) ? ordersData : []);
        setProducts(Array.isArray(productsData) ? productsData : []);
      } catch (apiError) {
        console.error('Error loading from API:', apiError);
        setStats({});
        setOrders([]);
        setProducts([]);
      }

      // Load all sellers if super admin
      if (seller && seller.isSuperAdmin) {
        try {
          const sellersData = await getAllSellers();
          setSellers(Array.isArray(sellersData) ? sellersData : []);
        } catch (sellersError) {
          console.error('Error loading sellers:', sellersError);
          setSellers([]);
        }
      }
      
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

  // Handle image file selection
  const handleImageChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        Swal.fire({
          icon: 'error',
          title: 'Invalid File',
          text: 'Please select an image file (JPG, PNG, WEBP, etc.)'
        });
        return;
      }

      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        Swal.fire({
          icon: 'error',
          title: 'File Too Large',
          text: 'Image size should be less than 5MB'
        });
        return;
      }

      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
        setNewProduct({...newProduct, img: reader.result});
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAddProduct = async (e) => {
    e.preventDefault();

    // Check if seller is registered and approved
    if (!currentSeller) {
      Swal.fire({
        icon: 'error',
        title: 'Not Registered',
        text: 'You need to register as a seller first!'
      });
      return;
    }

    if (!currentSeller.isApproved) {
      Swal.fire({
        icon: 'warning',
        title: 'Pending Approval',
        text: 'Your seller account is pending approval. Please wait for admin approval.'
      });
      return;
    }
    
    // Validation
    if (!newProduct.id?.trim() || !newProduct.cost || !newProduct.img || !newProduct.category?.trim() || !newProduct.description?.trim()) {
      Swal.fire({
        icon: 'error',
        title: 'Validation Error',
        text: 'Please fill in all fields and upload an image'
      });
      return;
    }

    const cost = parseFloat(newProduct.cost);
    if (isNaN(cost) || cost <= 0) {
      Swal.fire({
        icon: 'error',
        title: 'Invalid Price',
        text: 'Please enter a valid price'
      });
      return;
    }

    try {
      setProductLoading(true);
      const productData = {
        ...newProduct,
        cost: cost,
        year: parseInt(newProduct.year),
        sellerEmail: currentSeller.email
      };

      await addProduct(productData);
      
      Swal.fire({
        icon: 'success',
        title: 'Product Added!',
        text: `${newProduct.id} has been added successfully`,
        timer: 2000
      });

      // Reset form
      setNewProduct({
        id: '',
        year: new Date().getFullYear(),
        cost: '',
        img: '',
        category: '',
        description: ''
      });
      setImagePreview(null);

      // Reload products
      await loadData();
      setProductLoading(false);
    } catch (error) {
      setProductLoading(false);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: error.message || 'Failed to add product. Please try again.'
      });
    }
  };

  const handleDeleteProduct = async (productId) => {
    if (!productId || !currentSeller) return;

    const result = await Swal.fire({
      title: 'Delete Product?',
      text: `Are you sure you want to delete "${productId}"? This action cannot be undone.`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Yes, delete it!',
      cancelButtonText: 'Cancel'
    });

    if (result.isConfirmed) {
      try {
        setProductLoading(true);
        await deleteProduct(productId, currentSeller.email);
        
        Swal.fire({
          icon: 'success',
          title: 'Deleted!',
          text: 'Product has been deleted successfully',
          timer: 2000
        });

        // Reload products
        await loadData();
        setProductLoading(false);
      } catch (error) {
        setProductLoading(false);
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: error.message || 'Failed to delete product. Please try again.'
        });
      }
    }
  };

  const handleApproveSeller = async (email) => {
    if (!email) return;

    const result = await Swal.fire({
      title: 'Approve Seller?',
      text: `Approve ${email} to start selling on the platform?`,
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: 'Yes, approve',
      cancelButtonText: 'Cancel'
    });

    if (result.isConfirmed) {
      try {
        await approveSeller(email);
        
        Swal.fire({
          icon: 'success',
          title: 'Approved!',
          text: 'Seller has been approved successfully',
          timer: 2000
        });

        // Reload data
        await loadData();
      } catch (error) {
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'Failed to approve seller. Please try again.'
        });
      }
    }
  };

  const getRecentOrders = () => {
    return Array.isArray(orders) ? orders.slice(0, 10) : [];
  };

  const formatLastUpdated = () => {
    if (!lastUpdated) return '';
    try {
      return lastUpdated.toLocaleTimeString();
    } catch {
      return 'Unknown';
    }
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

  // Check seller status
  if (!currentSeller) {
    return (
      <div className="admin-panel">
        <div className="container my-5">
          <div className="alert alert-warning text-center">
            <h4>🛍️ You're not registered as a seller</h4>
            <p>To access the seller dashboard and manage products, you need to register as a seller.</p>
            <button className="btn btn-primary mt-3" onClick={() => window.location.href = '#/seller-register'}>
              Register as Seller
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!currentSeller.isApproved && !currentSeller.isSuperAdmin) {
    return (
      <div className="admin-panel">
        <div className="container my-5">
          <div className="alert alert-info text-center">
            <h4>⏳ Seller Account Pending Approval</h4>
            <p>Your seller account is under review. You'll be able to add products once approved by the admin.</p>
            <div className="mt-3">
              <p><strong>Business Name:</strong> {currentSeller.businessName || 'N/A'}</p>
              <p><strong>Email:</strong> {currentSeller.email || 'N/A'}</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-panel">
      <div className="admin-header">
        <div>
          <h2>{currentSeller.isSuperAdmin ? 'Super Admin' : 'Seller'} Dashboard</h2>
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
          <div className="mt-2">
            <span className="badge bg-primary">{currentSeller.businessName || 'Seller'}</span>
            {currentSeller.isSuperAdmin && <span className="badge bg-warning ms-2">👑 Super Admin</span>}
          </div>
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

      {/* Tab Navigation */}
      <div className="admin-tabs mb-4">
        <button 
          className={`btn ${activeTab === 'dashboard' ? 'btn-primary' : 'btn-outline-primary'} me-2`}
          onClick={() => setActiveTab('dashboard')}
        >
          <i className="bi bi-speedometer2"></i> Dashboard
        </button>
        <button 
          className={`btn ${activeTab === 'products' ? 'btn-primary' : 'btn-outline-primary'} me-2`}
          onClick={() => setActiveTab('products')}
        >
          <i className="bi bi-box-seam"></i> My Products
        </button>
        {currentSeller.isSuperAdmin && (
          <button 
            className={`btn ${activeTab === 'sellers' ? 'btn-primary' : 'btn-outline-primary'}`}
            onClick={() => setActiveTab('sellers')}
          >
            <i className="bi bi-people"></i> Manage Sellers
          </button>
        )}
      </div>

      {/* Dashboard Tab */}
      {activeTab === 'dashboard' && (
        <>
          {/* Stats Cards */}
          <div className="stats-grid">
            {currentSeller.isSuperAdmin ? (
              <>
                <div className="stat-card">
                  <div className="stat-icon" style={{background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'}}>{
                    <i className="bi bi-eye-fill"></i>
                  </div>
                  <div className="stat-details">
                    <h3>{stats.totalViews || 0}</h3>
                    <p>Total Views</p>
                  </div>
                </div>

                <div className="stat-card">
                  <div className="stat-icon" style={{background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)'}}>{
                    <i className="bi bi-cart-fill"></i>
                  </div>
                  <div className="stat-details">
                    <h3>{stats.totalOrders || 0}</h3>
                    <p>Total Orders</p>
                  </div>
                </div>

                <div className="stat-card">
                  <div className="stat-icon" style={{background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)'}}>{
                    <i className="bi bi-calendar-day"></i>
                  </div>
                  <div className="stat-details">
                    <h3>{stats.todayViews || 0}</h3>
                    <p>Today's Views</p>
                  </div>
                </div>

                <div className="stat-card">
                  <div className="stat-icon" style={{background: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)'}}>{
                    <i className="bi bi-bag-check-fill"></i>
                  </div>
                  <div className="stat-details">
                    <h3>{stats.todayOrders || 0}</h3>
                    <p>Today's Orders</p>
                  </div>
                </div>
              </>
            ) : (
              <>
                <div className="stat-card">
                  <div className="stat-icon" style={{background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'}}>{
                    <i className="bi bi-box-seam"></i>
                  </div>
                  <div className="stat-details">
                    <h3>{stats.totalProducts || products.length || 0}</h3>
                    <p>Total Products</p>
                  </div>
                </div>

                <div className="stat-card">
                  <div className="stat-icon" style={{background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)'}}>{
                    <i className="bi bi-cart-check"></i>
                  </div>
                  <div className="stat-details">
                    <h3>{stats.totalOrders || 0}</h3>
                    <p>Total Orders</p>
                  </div>
                </div>

                <div className="stat-card">
                  <div className="stat-icon" style={{background: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)'}}>{
                    <i className="bi bi-currency-rupee"></i>
                  </div>
                  <div className="stat-details">
                    <h3>₹{stats.totalRevenue || 0}</h3>
                    <p>Total Revenue</p>
                  </div>
                </div>

                <div className="stat-card">
                  <div className="stat-icon" style={{background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)'}}>{
                    <i className="bi bi-check-circle"></i>
                  </div>
                  <div className="stat-details">
                    <h3>{stats.activeProducts || (products?.filter(p => p.isActive)?.length) || 0}</h3>
                    <p>Active Products</p>
                  </div>
                </div>
              </>
            )}
          </div>

          {/* Recent Orders */}
          <div className="recent-orders">
            <h3>Recent Orders ({orders.length || 0} total)</h3>
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
                      const displayId = typeof orderId === 'string' ? orderId.slice(-6) : String(orderId).slice(-6);
                      const orderDate = order.createdAt || order.date;
                      
                      return (
                        <tr key={orderId}>
                          <td>#{displayId}</td>
                          <td>{orderDate ? new Date(orderDate).toLocaleString() : 'N/A'}</td>
                          <td>
                            <div>{order.userName || 'Unknown'}</div>
                            <small className="text-muted">{order.user || 'N/A'}</small>
                          </td>
                          <td>{order.items || 0} items</td>
                          <td className="text-success fw-bold">₹{order.total || 0}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Backend Status */}
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
                </>
              )}
            </div>
          </div>
        </>
      )}

      {/* Products Tab */}
      {activeTab === 'products' && (
        <div className="products-management">
          <div className="row">
            {/* Add Product Form */}
            <div className="col-lg-5 mb-4">
              <div className="card shadow">
                <div className="card-body">
                  <h3 className="card-title mb-4">
                    <i className="bi bi-plus-circle"></i> Add New Product
                  </h3>
                  <form onSubmit={handleAddProduct}>
                    <div className="mb-3">
                      <label className="form-label">Product Name *</label>
                      <input
                        type="text"
                        className="form-control"
                        value={newProduct.id}
                        onChange={(e) => setNewProduct({...newProduct, id: e.target.value})}
                        placeholder="e.g., Wireless Headphones"
                        required
                      />
                    </div>

                    <div className="mb-3">
                      <label className="form-label">Price (₹) *</label>
                      <input
                        type="number"
                        className="form-control"
                        value={newProduct.cost}
                        onChange={(e) => setNewProduct({...newProduct, cost: e.target.value})}
                        placeholder="e.g., 9999"
                        min="0"
                        step="0.01"
                        required
                      />
                    </div>

                    <div className="mb-3">
                      <label className="form-label">Product Image *</label>
                      <input
                        type="file"
                        className="form-control"
                        accept="image/*"
                        onChange={handleImageChange}
                        required={!newProduct.img}
                      />
                      <small className="text-muted">Choose an image file (JPG, PNG, WEBP, etc.) - Max 5MB</small>
                      
                      {imagePreview && (
                        <div className="mt-3 text-center">
                          <img 
                            src={imagePreview} 
                            alt="Preview" 
                            className="img-thumbnail"
                            style={{maxWidth: '200px', maxHeight: '200px', objectFit: 'contain'}}
                          />
                          <div className="mt-2">
                            <button 
                              type="button" 
                              className="btn btn-sm btn-outline-danger"
                              onClick={() => {
                                setImagePreview(null);
                                setNewProduct({...newProduct, img: ''});
                              }}
                            >
                              <i className="bi bi-x-circle"></i> Remove Image
                            </button>
                          </div>
                        </div>
                      )}
                    </div>

                    <div className="mb-3">
                      <label className="form-label">Category *</label>
                      <input
                        type="text"
                        className="form-control"
                        value={newProduct.category}
                        onChange={(e) => setNewProduct({...newProduct, category: e.target.value})}
                        placeholder="e.g., Electronics"
                        required
                      />
                    </div>

                    <div className="mb-3">
                      <label className="form-label">Year</label>
                      <input
                        type="number"
                        className="form-control"
                        value={newProduct.year}
                        onChange={(e) => setNewProduct({...newProduct, year: e.target.value})}
                        min="2000"
                        max="2100"
                      />
                    </div>

                    <div className="mb-3">
                      <label className="form-label">Description *</label>
                      <textarea
                        className="form-control"
                        value={newProduct.description}
                        onChange={(e) => setNewProduct({...newProduct, description: e.target.value})}
                        placeholder="Product description..."
                        rows="3"
                        required
                      />
                    </div>

                    <button 
                      type="submit" 
                      className="btn btn-success w-100"
                      disabled={productLoading}
                    >
                      {productLoading ? (
                        <>
                          <span className="spinner-border spinner-border-sm me-2"></span>
                          Adding...
                        </>
                      ) : (
                        <>
                          <i className="bi bi-plus-lg"></i> Add Product
                        </>
                      )}
                    </button>
                  </form>
                </div>
              </div>
            </div>

            {/* Product List */}
            <div className="col-lg-7">
              <div className="card shadow">
                <div className="card-body">
                  <h3 className="card-title mb-4">
                    <i className="bi bi-box-seam"></i> My Products ({products.length || 0})
                  </h3>
                  
                  {!products || products.length === 0 ? (
                    <div className="alert alert-info">
                      <i className="bi bi-info-circle"></i> No products available. Add your first product!
                    </div>
                  ) : (
                    <div className="products-list" style={{maxHeight: '600px', overflowY: 'auto'}}>
                      {products.map(product => (
                        <div key={product.id || product._id} className="product-item border rounded p-3 mb-3">
                          <div className="row align-items-center">
                            <div className="col-md-2">
                              <img 
                                src={product.img} 
                                alt={product.id} 
                                className="img-fluid rounded"
                                style={{width: '100%', height: '60px', objectFit: 'cover'}}
                                onError={(e) => e.target.src = 'https://via.placeholder.com/60'}
                              />
                            </div>
                            <div className="col-md-7">
                              <h5 className="mb-1">{product.id || 'Unnamed'}</h5>
                              <p className="mb-1 text-success fw-bold">₹{product.cost || 0}</p>
                              <small className="text-muted">{product.category || 'No category'} • {product.year || 'N/A'}</small>
                              {product.sellerBusinessName && (
                                <div>
                                  <small className="text-muted">By: {product.sellerBusinessName}</small>
                                </div>
                              )}
                            </div>
                            <div className="col-md-3 text-end">
                              <button 
                                className="btn btn-danger btn-sm"
                                onClick={() => handleDeleteProduct(product.id)}
                                disabled={productLoading}
                              >
                                <i className="bi bi-trash"></i> Delete
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Sellers Tab (Super Admin Only) */}
      {activeTab === 'sellers' && currentSeller.isSuperAdmin && (
        <div className="sellers-management">
          <div className="card shadow">
            <div className="card-body">
              <h3 className="card-title mb-4">
                <i className="bi bi-people"></i> All Sellers ({sellers.length || 0})
              </h3>
              
              {!sellers || sellers.length === 0 ? (
                <div className="alert alert-info">
                  <i className="bi bi-info-circle"></i> No sellers registered yet.
                </div>
              ) : (
                <div className="table-responsive">
                  <table className="table table-hover">
                    <thead>
                      <tr>
                        <th>Business Name</th>
                        <th>Name</th>
                        <th>Email</th>
                        <th>Phone</th>
                        <th>Status</th>
                        <th>Registered</th>
                        <th>Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {sellers.map(seller => (
                        <tr key={seller.email}>
                          <td>
                            <strong>{seller.businessName || 'N/A'}</strong>
                            {seller.isSuperAdmin && <span className="badge bg-warning ms-2">👑</span>}
                          </td>
                          <td>{seller.name || 'N/A'}</td>
                          <td>{seller.email}</td>
                          <td>{seller.phone || 'N/A'}</td>
                          <td>
                            {seller.isApproved ? (
                              <span className="badge bg-success">✓ Approved</span>
                            ) : (
                              <span className="badge bg-warning">⏳ Pending</span>
                            )}
                          </td>
                          <td>{seller.createdAt ? new Date(seller.createdAt).toLocaleDateString() : 'N/A'}</td>
                          <td>
                            {!seller.isApproved && !seller.isSuperAdmin && (
                              <button 
                                className="btn btn-sm btn-success"
                                onClick={() => handleApproveSeller(seller.email)}
                              >
                                <i className="bi bi-check-circle"></i> Approve
                              </button>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminPanel;
