import React, { useState } from 'react';
import { getOrders } from './api';
import './OrderTracking.css';

const OrderTracking = () => {
  const [trackingId, setTrackingId] = useState('');
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [searched, setSearched] = useState(false);

  const handleSearch = async (e) => {
    e.preventDefault();
    
    if (!trackingId.trim()) {
      setError('Please enter a tracking ID');
      return;
    }

    try {
      setLoading(true);
      setError('');
      setOrder(null);
      setSearched(true);

      // Get all orders and search for matching tracking ID
      const allOrders = await getOrders(500);
      
      const foundOrder = allOrders.find(o => {
        const orderId = o._id || o.id || '';
        const displayId = typeof orderId === 'string' ? orderId.slice(-6) : String(orderId).slice(-6);
        return displayId.toLowerCase() === trackingId.toLowerCase();
      });

      if (foundOrder) {
        setOrder(foundOrder);
        setError('');
      } else {
        setError('Order not found. Please check your tracking ID and try again.');
        setOrder(null);
      }
    } catch (err) {
      console.error('Error searching order:', err);
      setError('Error searching for order. Please try again later.');
      setOrder(null);
    } finally {
      setLoading(false);
    }
  };

  const getOrderStatus = (order) => {
    // You can customize this logic based on your order status field
    return order.status || 'Processing';
  };

  const getStatusColor = (status) => {
    switch(status?.toLowerCase()) {
      case 'delivered':
        return 'success';
      case 'processing':
        return 'info';
      case 'shipped':
        return 'primary';
      case 'cancelled':
        return 'danger';
      default:
        return 'warning';
    }
  };

  return (
    <div className="order-tracking">
      <div className="container my-5">
        <div className="row justify-content-center">
          <div className="col-md-8">
            {/* Tracking Search Section */}
            <div className="card shadow mb-4">
              <div className="card-body p-5">
                <div className="text-center mb-4">
                  <i className="bi bi-box-seam" style={{fontSize: '3rem', color: '#667eea'}}></i>
                  <h2 className="card-title mt-3">Track Your Order</h2>
                  <p className="text-muted">Enter your tracking ID to view order details and delivery status</p>
                </div>

                <form onSubmit={handleSearch}>
                  <div className="input-group input-group-lg">
                    <input
                      type="text"
                      className="form-control"
                      placeholder="Enter tracking ID (e.g., abc123)"
                      value={trackingId}
                      onChange={(e) => setTrackingId(e.target.value)}
                      maxLength="6"
                    />
                    <button className="btn btn-primary" type="submit" disabled={loading}>
                      {loading ? (
                        <>
                          <span className="spinner-border spinner-border-sm me-2"></span>
                          Searching...
                        </>
                      ) : (
                        <>
                          <i className="bi bi-search"></i> Search
                        </>
                      )}
                    </button>
                  </div>
                  <small className="text-muted d-block mt-2">
                    💡 Your tracking ID is the last 6 characters of your order ID
                  </small>
                </form>
              </div>
            </div>

            {/* Error Message */}
            {error && (
              <div className="alert alert-danger alert-dismissible fade show" role="alert">
                <i className="bi bi-exclamation-triangle"></i> {error}
                <button type="button" className="btn-close" onClick={() => setError('')}></button>
              </div>
            )}

            {/* Order Found Section */}
            {order && (
              <>
                {/* Order Status Badge */}
                <div className="alert alert-info text-center mb-4">
                  <span className={`badge bg-${getStatusColor(getOrderStatus(order))} fs-6`}>
                    {getOrderStatus(order).toUpperCase()}
                  </span>
                </div>

                {/* Order Details Card */}
                <div className="card shadow mb-4">
                  <div className="card-header bg-light">
                    <h5 className="mb-0">Order Information</h5>
                  </div>
                  <div className="card-body">
                    <div className="row mb-3">
                      <div className="col-md-6">
                        <p className="text-muted mb-1">Tracking ID</p>
                        <h5 className="mb-0">
                          {typeof (order._id || order.id) === 'string' 
                            ? (order._id || order.id).slice(-6).toUpperCase()
                            : String(order._id || order.id).slice(-6).toUpperCase()}
                        </h5>
                      </div>
                      <div className="col-md-6">
                        <p className="text-muted mb-1">Order Date</p>
                        <h5 className="mb-0">
                          {order.createdAt || order.date
                            ? new Date(order.createdAt || order.date).toLocaleDateString()
                            : 'N/A'}
                        </h5>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Customer Information */}
                <div className="card shadow mb-4">
                  <div className="card-header bg-light">
                    <h5 className="mb-0"><i className="bi bi-person-circle"></i> Customer Details</h5>
                  </div>
                  <div className="card-body">
                    <p className="mb-2"><strong>Name:</strong> {order.userName || 'N/A'}</p>
                    <p className="mb-2"><strong>Email:</strong> {order.user || 'N/A'}</p>
                    <p className="mb-0"><strong>Phone:</strong> {order.phone || 'N/A'}</p>
                  </div>
                </div>

                {/* Delivery Address */}
                <div className="card shadow mb-4">
                  <div className="card-header bg-light">
                    <h5 className="mb-0"><i className="bi bi-geo-alt"></i> Delivery Address</h5>
                  </div>
                  <div className="card-body">
                    {order.address ? (
                      <>
                        <p className="mb-1" style={{fontSize: '1.1rem'}}>
                          {order.address.street || 'N/A'}
                        </p>
                        <p className="mb-1 text-muted">
                          {order.address.city || 'N/A'}, {order.address.state || 'N/A'} {order.address.pincode || ''}
                        </p>
                        <p className="mb-0 text-muted">{order.address.country || 'India'}</p>
                      </>
                    ) : (
                      <p className="text-muted">Address not available</p>
                    )}
                  </div>
                </div>

                {/* Order Items */}
                <div className="card shadow mb-4">
                  <div className="card-header bg-light">
                    <h5 className="mb-0"><i className="bi bi-box"></i> Order Items ({order.items || 0})</h5>
                  </div>
                  <div className="card-body">
                    {order.cart && order.cart.length > 0 ? (
                      <div className="table-responsive">
                        <table className="table table-sm table-hover">
                          <thead className="table-light">
                            <tr>
                              <th style={{width: '70px'}}>Image</th>
                              <th>Product</th>
                              <th style={{width: '100px'}}>Price</th>
                              <th style={{width: '80px'}}>Qty</th>
                              <th style={{width: '100px'}}>Subtotal</th>
                            </tr>
                          </thead>
                          <tbody>
                            {order.cart.map((item, index) => (
                              <tr key={index}>
                                <td>
                                  {item.img ? (
                                    <img
                                      src={item.img}
                                      alt={item.id || 'Product'}
                                      style={{width: '60px', height: '60px', objectFit: 'cover', borderRadius: '4px'}}
                                      onError={(e) => e.target.src = 'https://via.placeholder.com/60'}
                                    />
                                  ) : (
                                    <div
                                      className="bg-light rounded d-flex align-items-center justify-content-center"
                                      style={{width: '60px', height: '60px'}}
                                    >
                                      <i className="bi bi-image text-muted"></i>
                                    </div>
                                  )}
                                </td>
                                <td>
                                  <div className="fw-bold">{item.id || 'Unknown Product'}</div>
                                  {item.brand && (
                                    <small className="text-muted">{item.brand}</small>
                                  )}
                                </td>
                                <td>₹{item.cost || 0}</td>
                                <td className="text-center">{item.quantity || 1}</td>
                                <td className="fw-bold">₹{(item.cost || 0) * (item.quantity || 1)}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    ) : (
                      <p className="text-muted">No items in this order</p>
                    )}
                  </div>
                </div>

                {/* Order Summary */}
                <div className="card shadow border-success">
                  <div className="card-header bg-success text-white">
                    <h5 className="mb-0"><i className="bi bi-receipt"></i> Order Total</h5>
                  </div>
                  <div className="card-body">
                    <div className="d-flex justify-content-between align-items-center">
                      <h4 className="mb-0">Total Amount:</h4>
                      <h3 className="text-success mb-0">₹{order.total || 0}</h3>
                    </div>
                    {order.createdAt || order.date && (
                      <p className="text-muted mt-3 mb-0">
                        <i className="bi bi-calendar-event"></i> Ordered on {new Date(order.createdAt || order.date).toLocaleString()}
                      </p>
                    )}
                  </div>
                </div>
              </>
            )}

            {/* No Result Message */}
            {searched && !order && !error && (
              <div className="alert alert-warning text-center" role="alert">
                <i className="bi bi-question-circle"></i> No orders found with that tracking ID
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderTracking;