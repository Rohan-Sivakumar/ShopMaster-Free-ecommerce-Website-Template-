import React, { useEffect, useState } from 'react';
import { fetchOrderHistory } from './api';
import { getCurrentUser } from './cartService';

const OrderHistory = () => {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const user = getCurrentUser();
        if (user && user.email) {
            const getOrderHistory = async () => {
                const data = await fetchOrderHistory(user.email);
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
            <ul>
                {orders.map(order => (
                    <li key={order.id}>{order.description} - {order.date}</li>
                ))}
            </ul>
        </div>
    );
};

export default OrderHistory;