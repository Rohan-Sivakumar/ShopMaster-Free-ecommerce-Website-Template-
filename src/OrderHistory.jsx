import React, { useEffect, useState } from 'react';
import { getOrders } from './api';
import { getCurrentUser } from './cartService';

const OrderHistory = () => {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const user = getCurrentUser();
        if (user && user.email) {
            const getOrderHistory = async () => {
                const data = await getOrders(50, user.email); // Updated to use getOrders
                setOrders(data);
                setLoading(false);
            };
            getOrderHistory();
        } else {
            setLoading(false);
        }
    }, []);

    if (loading) return <div>Loading...</div>;

    return (
        <div>
            <h2>Order History</h2>
            {orders.length === 0 ? (
                <p>No orders found.</p>
            ) : (
                <ul>
                    {orders.map(order => (
                        <li key={order.id}>
                            <strong>Order ID:</strong> {order.id || 'N/A'}<br />
                            <strong>Description:</strong> {order.description || 'No description available'}<br />
                            <strong>Date:</strong> {order.date ? new Date(order.date).toLocaleString() : 'N/A'}<br />
                            <strong>Total:</strong> ₹{order.total || '0'}
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
};

export default OrderHistory;