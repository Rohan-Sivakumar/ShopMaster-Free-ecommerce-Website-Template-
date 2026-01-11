import React, { useState } from 'react';
import { getOrders } from './api';
import './OrderTracking.css';
import Swal from 'sweetalert2';

const OrderTracking = () => {
  const [trackingId, setTrackingId] = useState('');
  const [orderDetails, setOrderDetails] = useState(null);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);

  const handleSearch = async (e) => {
    e.preventDefault();
    
    if (!trackingId.trim()) {
      Swal.fire({
        icon: 'warning',
        title: 'Enter Tracking ID',
        text: 'Please enter a tracking ID to search for your order'
      });
      return;
    }

    try {
      setLoading(true);
      setSearched(true);
      
      // Get all orders
      const orders = await getOrders(100);
      
      if (!Array.isArray(orders)) {
        throw new Error('Invalid orders data');
      }

      // Search for order by ID (exact match or partial match of the ID)
      const searchId = trackingId.trim().toLowerCase();
      const foundOrder = orders.find(order => {
        const orderId = (order._id || order.id || '').toString().toLowerCase();
        const displayId = orderId.slice(-6);
        
        // Match against full ID or last 6 digits
        return orderId.includes(searchId) || displayId === searchId;
      });

      if (foundOrder) {
        setOrderDetails(foundOrder);
      } else {
        setOrderDetails(null);
        Swal.fire({
          icon: 'info',
          title: 'Order Not Found',
          text: `No order found with tracking ID "${trackingId}". Please check the ID and try again.`
        });
      }
      
      setLoading(false);
    } catch (error) {
      setLoading(false);
      console.error('Error searching order:', error);
      Swal.fire({
        icon: 'error',
        title: 'Search Error',
        text: error.message || 'Failed to search for order. Please try again.'
      });
    }
  };

  const getOrderStatus = (order) => {
    if (!order) return 'Unknown';
    
    // Determine status based on order properties
    if (order.status === 'delivered' || order.delivered) {
      return 'Delivered';
    } else if (order.status === 'shipped' || order.shipped) {
      return 'Shipped';
    } else if (order.status === 'processing' || order.processing) {
      return 'Processing';
    } else if (order.status === 'cancelled' || order.cancelled) {
      return 'Cancelled';
    }
    return 'Pending';
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Delivered':
        return 'success';
      case 'Shipped':
        return 'info';
      case 'Processing':
        return 'primary';
      case 'Pending':
        return 'warning';
      case 'Cancelled':
        return 'danger';
      default:
        return 'secondary';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'Delivered':
        return 'bi-check-circle-fill';
      case 'Shipped':
        return 'bi-box-seam';
      case 'Processing':
        return 'bi-hourglass-split';
      case 'Pending':
        return 'bi-clock-history';
      case 'Cancelled':
        return 'bi-x-circle-fill';
      default:
        return 'bi-question-circle';
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    try {
      const date = new Date(dateString);
      return date.toLocaleString('en-IN', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return dateString;
    }
  };

  return (
    <div className="order-tracking">
      <div className="container mt-5 mb-5">
        {/* Header */}
        <div className="row mb-4">
          <div className="col-md-8 mx-auto text-center">
            <h1 className="display-5 fw-bold mb-2">Track Your Order</h1>
            <p className="text-muted">Enter your tracking ID to see the current status and details of your order</p>
          </div>
        </div>

        {/* Search Card */}
        <div className="row mb-4">
          <div className="col-md-8 mx-auto">
            <div className="card shadow-lg border-0 rounded-lg overflow-hidden">
              <div className="card-header bg-gradient" style={{background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'}}>
                <h5 className="mb-0 text-white">
                  <i className="bi bi-search"></i> Find Your Order
                </h5>
              </div>
              <div className="card-body p-4">
                <form onSubmit={handleSearch}>
                  <div className="input-group input-group-lg">
                    <input
                      type="text"
                      className="form-control border-0"
                      placeholder="Enter your tracking ID (e.g., 123456)"
                      value={trackingId}
                      onChange={(e) => setTrackingId(e.target.value)}
                      disabled={loading}
                    />
                    <button 
                      className="btn btn-primary px-4 fw-bold"
                      type="submit"
                      disabled={loading}
                    >
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
                  <small className="text-muted mt-2 d-block">
                    <i className="bi bi-info-circle"></i> Your tracking ID is shown in your order confirmation email
                  </small>
                </form>
              </div>
            </div>
          </div>
        </div>

        {/* Order Not Searched Yet */}
        {!searched && !orderDetails && (
          <div className="row">
            <div className="col-md-8 mx-auto">
              <div className="alert alert-info border-0 rounded-lg" role="alert">
                <div className="text-center py-4">
                  <i className="bi bi-box-seam" style={{fontSize: '3rem', color: '#0066cc'}}></i>
                  <h5 className="mt-3">No orders to display</h5>
                  <p className="text-muted mb-0">Enter your tracking ID above to view order details and real-time updates</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Order Found */}
        {searched && orderDetails && (
          <div className="row">
            <div className="col-md-10 mx-auto">
              {/* Status Section */}
              <div className="card shadow-lg border-0 rounded-lg mb-4 overflow-hidden">
                <div className="card-body p-4">
                  <div className="row align-items-center">
                    <div className="col-md-6">
                      <h5 className="mb-3">Order Status</h5>
                      <div className="d-flex align-items-center gap-3">
                        <div 
                          className={`badge bg-${getStatusColor(getOrderStatus(orderDetails))} p-3`}
                          style={{fontSize: '1rem'}}
                        >
                          <i className={`bi ${getStatusIcon(getOrderStatus(orderDetails))}`}></i>
                        </div>
                        <div>
                          <h4 className="mb-0 fw-bold">{getOrderStatus(orderDetails)}</h4>
                          <small className="text-muted">Current order status</small>
                        </div>
                      </div>
                    </div>
                    <div className="col-md-6 text-md-end mt-3 mt-md-0">
                      <div className="text-muted">
                        <div className="mb-2">
                          <strong>Tracking ID:</strong><br/>
                          <code style={{fontSize: '0.9rem'}}>
                            #{((orderDetails._id || orderDetails.id || '').toString()).slice(-6).toUpperCase()}
                          </code>
                        </div>
                        <div>
                          <strong>Order Date:</strong><br/>
                          {formatDate(orderDetails.createdAt || orderDetails.date)}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Customer Information */}
              <div className="row mb-4">
                <div className="col-md-6">
                  <div className="card shadow-sm border-0 rounded-lg">
                    <div className="card-body">
                      <h5 className="card-title border-bottom pb-2 mb-3">
                        <i className="bi bi-person-circle"></i> Customer Information
                      </h5>
                      <div className="customer-info">
                        <p className="mb-2">
                          <strong>Name:</strong>
                          <div className="text-muted">{orderDetails.userName || orderDetails.address?.name || 'N/A'}</div>
                        </p>
                        <p className="mb-2">
                          <strong>Email:</strong>
                          <div className="text-muted text-break">{orderDetails.user || 'N/A'}</div>
                        </p>
                        <p className="mb-0">
                          <strong>Phone:</strong>
                          <div className="text-muted">{orderDetails.address?.phone || orderDetails.phone || 'N/A'}</div>
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Delivery Address */}
                <div className="col-md-6">
                  <div className="card shadow-sm border-0 rounded-lg">
                    <div className="card-body">
                      <h5 className="card-title border-bottom pb-2 mb-3">
                        <i className="bi bi-geo-alt"></i> Delivery Address
                      </h5>
                      {orderDetails.address ? (
                        <div className="address-info text-muted">
                          {orderDetails.address.name && (
                            <p className="mb-2 fw-bold">
                              {orderDetails.address.name}
                            </p>
                          )}
                          <p className="mb-2">
                            {orderDetails.address.street || 'Street address not provided'}
                          </p>
                          <p className="mb-2">
                            {orderDetails.address.city || 'City'}{orderDetails.address.state ? `, ${orderDetails.address.state}` : ''}
                          </p>
                          {orderDetails.address.pincode && (
                            <p className="mb-2">
                              PIN: {orderDetails.address.pincode}
                            </p>
                          )}
                          <p className="mb-0">
                            {orderDetails.address.country || 'India'}
                          </p>
                        </div>
                      ) : (
                        <p className="text-muted">Delivery address not provided</p>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Order Items */}
              <div className="card shadow-sm border-0 rounded-lg mb-4">
                <div className="card-body">
                  <h5 className="card-title border-bottom pb-2 mb-3">
                    <i className="bi bi-cart"></i> Order Items ({orderDetails.items || 0})
                  </h5>
                  {orderDetails.cart && orderDetails.cart.length > 0 ? (
                    <div className="table-responsive">
                      <table className="table table-hover mb-0">
                        <thead className="table-light">
                          <tr>
                            <th style={{width: '70px'}}>Image</th>
                            <th>Product</th>
                            <th style={{width: '100px'}}>Price</th>
                            <th style={{width: '80px'}} className="text-center">Qty</th>
                            <th style={{width: '120px'}} className="text-end">Subtotal</th>
                          </tr>
                        </thead>
                        <tbody>
                          {orderDetails.cart.map((item, index) => (
                            <tr key={index}>
                              <td>
                                {item.img ? (
                                  <img 
                                    src={item.img} 
                                    alt={item.id} 
                                    className="img-fluid rounded"
                                    style={{width: '60px', height: '60px', objectFit: 'cover'}}
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
                                <strong>{item.id || 'Unknown'}</strong>
                                {item.brand && (
                                  <div className="text-muted small">{item.brand}</div>
                                )}
                              </td>
                              <td className="text-muted">₹{item.cost || 0}</td>
                              <td className="text-center">{item.quantity || 1}</td>
                              <td className="text-end fw-bold">₹{(item.cost || 0) * (item.quantity || 1)}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <div className="alert alert-warning mb-0">
                      No items in this order
                    </div>
                  )}
                </div>
              </div>

              {/* Order Summary */}
              <div className="card shadow-sm border-0 rounded-lg bg-light">
                <div className="card-body">
                  <div className="row align-items-center">
                    <div className="col-md-6">
                      <h5 className="mb-3">Order Summary</h5>
                      <div className="summary-details">
                        <p className="mb-2">
                          <strong>Total Items:</strong>
                          <span className="float-end">{orderDetails.items || 0}</span>
                        </p>
                        <p className="mb-2">
                          <strong>Order Date:</strong>
                          <span className="float-end text-muted small">
                            {formatDate(orderDetails.createdAt || orderDetails.date)}
                          </span>
                        </p>
                        <p className="mb-0">
                          <strong>Payment Status:</strong>
                          <span className="float-end">
                            <span className="badge bg-success">Paid</span>
                          </span>
                        </p>
                      </div>
                    </div>
                    <div className="col-md-6 text-md-end mt-3 mt-md-0">
                      <div className="order-total text-center p-3 bg-white rounded">
                        <p className="text-muted mb-1">Total Amount</p>
                        <h2 className="fw-bold text-success mb-0">
                          ₹{orderDetails.total || 0}
                        </h2>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Order Not Found Message */}
        {searched && !orderDetails && (
          <div className="row">
            <div className="col-md-8 mx-auto">
              <div className="alert alert-danger border-0 rounded-lg" role="alert">
                <div className="text-center py-4">
                  <i className="bi bi-exclamation-triangle" style={{fontSize: '3rem', color: '#dc3545'}}></i>
                  <h5 className="mt-3">Order Not Found</h5>
                  <p className="text-muted mb-3">We couldn't find an order with the tracking ID "<strong>{trackingId}</strong>"</p>
                  <small className="text-muted">Please check the tracking ID and try again. You can find it in your order confirmation email.</small>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Help Section */}
        <div className="row mt-5">
          <div className="col-md-8 mx-auto">
            <div className="card bg-light border-0 rounded-lg">
              <div className="card-body text-center">
                <h5 className="mb-3"><i className="bi bi-question-circle"></i> Need Help?</h5>
                <p className="text-muted mb-0">
                  If you can't find your order or have questions, please contact our customer support team at 
                  <strong> support@shopmaster.com</strong> or call us at <strong>+91-XXXX-XXXX-XXXX</strong>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderTracking;