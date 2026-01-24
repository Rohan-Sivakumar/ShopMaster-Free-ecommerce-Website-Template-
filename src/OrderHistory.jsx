import React, { useState, useEffect } from 'react';
import { getOrders } from './api';
import { getCurrentUser } from './cartService';

const OrderHistory = () => {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const user = getCurrentUser();
        if (user && user.email) {
            const getOrderHistory = async () => {
                try {
                    const data = await getOrders(50, user.email);
                    setOrders(Array.isArray(data) ? data : []);
                } catch (error) {
                    console.error("Failed to fetch orders:", error);
                } finally {
                    setLoading(false);
                }
            };
            getOrderHistory();
        } else {
            setLoading(false);
        }
    }, []);

    const getStatusColor = (status) => {
        switch (status) {
            case 'Order Placed': return 'bg-primary';
            case 'Processing': return 'bg-info text-dark';
            case 'Shipped': return 'bg-warning text-dark';
            case 'Delivered': return 'bg-success';
            default: return 'bg-secondary';
        }
    };

    if (loading) {
        return (
            <div className="container py-5 text-center">
                <div className="spinner-border text-primary" role="status">
                    <span className="visually-hidden">Loading your orders...</span>
                </div>
            </div>
        );
    }

    return (
        <div className="container py-4">
            <nav aria-label="breadcrumb">
                <ol className="breadcrumb">
                    <li className="breadcrumb-item"><a href="#dashboard" onClick={() => window.location.hash = 'dashboard'}>Your Account</a></li>
                    <li className="breadcrumb-item active">Your Orders</li>
                </ol>
            </nav>

            <div className="d-flex justify-content-between align-items-center mb-4">
                <h2 className="fw-bold mb-0">Your Orders</h2>
                <div className="w-25">
                    <input type="text" className="form-control" placeholder="Search orders..." />
                </div>
            </div>

            {orders.length === 0 ? (
                <div className="card shadow-sm border-0 text-center p-5">
                    <div className="card-body">
                        <i className="bi bi-bag-x text-muted" style={{ fontSize: '4rem' }}></i>
                        <h4 className="mt-3 font-amazon-bold">No orders found</h4>
                        <p className="text-muted">Looks like you haven't placed any orders in the last 3 months.</p>
                        <button className="btn btn-warning px-4 shadow-sm" onClick={() => window.location.hash = 'product'}>
                            Continue Shopping
                        </button>
                    </div>
                </div>
            ) : (
                <div className="row">
                    {orders.map(order => {
                        const orderId = order._id || order.id || 'N/A';
                        const displayId = typeof orderId === 'string' ? orderId.slice(-8).toUpperCase() : String(orderId);
                        
                        return (
                            <div key={orderId} className="col-12 mb-4">
                                <div className="card shadow-sm border rounded-3 overflow-hidden">
                                    <div className="card-header border-bottom py-3 px-4" style={{backgroundColor: '#F0F2f2'}}>
                                        <div className="row align-items-center">
                                            <div className="col-md-2">
                                                <small className="text-secondary d-block text-uppercase small fw-bold">Order Placed</small>
                                                <span className="text-muted">{order.createdAt ? new Date(order.createdAt).toLocaleDateString('en-IN') : 'N/A'}</span>
                                            </div>
                                            <div className="col-md-2">
                                                <small className="text-secondary d-block text-uppercase small fw-bold">Total</small>
                                                <span className="text-muted fw-bold">₹{order.total || '0'}</span>
                                            </div>
                                            <div className="col-md-3">
                                                <small className="text-secondary d-block text-uppercase small fw-bold">Ship To</small>
                                                <div className="dropdown">
                                                    <span className="text-primary cursor-pointer dropdown-toggle" data-bs-toggle="dropdown">
                                                        {order.address?.name || order.userName}
                                                    </span>
                                                </div>
                                            </div>
                                            <div className="col-md-5 text-md-end">
                                                <div className="text-secondary small">Order # {displayId}</div>
                                                <div className="mt-1">
                                                    <span className={`badge ${getStatusColor(order.status || 'Order Placed')} px-3 py-2 rounded-pill`}>
                                                        {order.status || 'Order Placed'}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="card-body p-0">
                                        <div className="list-group list-group-flush">
                                            {(order.cart || []).map((item, idx) => (
                                                <div key={idx} className="list-group-item p-4 border-0">
                                                    <div className="row">
                                                        <div className="col-md-2 col-3">
                                                            <img 
                                                                src={item.img} 
                                                                alt={item.id} 
                                                                className="img-fluid rounded" 
                                                                style={{ maxHeight: '100px', width: '100%', objectFit: 'contain' }}
                                                                onError={(e) => e.target.src = 'https://via.placeholder.com/100'}
                                                            />
                                                        </div>
                                                        <div className="col-md-7 col-9">
                                                            <h6 className="text-primary mb-1 fw-bold">{item.id}</h6>
                                                            <p className="text-muted small mb-2">{item.brand || 'ShopMaster Selection'}</p>
                                                            <button className="btn btn-warning btn-sm p-1 px-3 shadow-sm rounded-pill">
                                                                <i className="bi bi-arrow-repeat me-1"></i> Buy it again
                                                            </button>
                                                        </div>
                                                        <div className="col-md-3 mt-3 mt-md-0 d-grid gap-2 h-100">
                                                            <button className="btn btn-sm btn-outline-secondary rounded-pill">Track Package</button>
                                                            <button className="btn btn-sm btn-outline-secondary rounded-pill">Return Items</button>
                                                            <button className="btn btn-sm btn-outline-secondary rounded-pill">Write a product review</button>
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
};

export default OrderHistory;