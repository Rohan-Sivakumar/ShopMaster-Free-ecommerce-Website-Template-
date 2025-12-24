// API configuration
const API_URL = import.meta.env.VITE_API_URL || 'https://shopmaster-backend.vercel.app/api';

// Track page view
export const trackView = async () => {
  try {
    const response = await fetch(`${API_URL}/stats/view`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    });
    if (!response.ok) throw new Error('Failed to track view');
    return await response.json();
  } catch (error) {
    console.error('Error tracking view:', error);
    // Fallback to localStorage if API fails
    const stats = JSON.parse(localStorage.getItem('adminStats') || '{}');
    const today = new Date().toLocaleDateString();
    
    if (!stats.lastViewDate || stats.lastViewDate !== today) {
      stats.todayViews = 1;
      stats.lastViewDate = today;
    } else {
      stats.todayViews = (stats.todayViews || 0) + 1;
    }
    
    stats.totalViews = (stats.totalViews || 0) + 1;
    localStorage.setItem('adminStats', JSON.stringify(stats));
    return stats;
  }
};

// Create new order
export const createOrder = async (orderData) => {
  try {
    const response = await fetch(`${API_URL}/orders`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(orderData)
    });
    if (!response.ok) throw new Error('Failed to create order');
    return await response.json();
  } catch (error) {
    console.error('Error creating order:', error);
    // Fallback to localStorage if API fails
    const stats = JSON.parse(localStorage.getItem('adminStats') || '{}');
    const today = new Date().toLocaleDateString();
    
    stats.totalOrders = (stats.totalOrders || 0) + 1;
    stats.ordersHistory = stats.ordersHistory || [];
    
    if (!stats.lastOrderDate || stats.lastOrderDate !== today) {
      stats.todayOrders = 1;
      stats.lastOrderDate = today;
    } else {
      stats.todayOrders = (stats.todayOrders || 0) + 1;
    }
    
    stats.ordersHistory = [
      {
        id: Date.now(),
        date: new Date().toISOString(),
        user: orderData.user,
        items: orderData.items,
        total: orderData.total
      },
      ...stats.ordersHistory
    ].slice(0, 50);
    
    localStorage.setItem('adminStats', JSON.stringify(stats));
    return { order: orderData, stats };
  }
};

// Get statistics
export const getStats = async () => {
  try {
    const response = await fetch(`${API_URL}/stats`);
    if (!response.ok) throw new Error('Failed to get stats');
    return await response.json();
  } catch (error) {
    console.error('Error getting stats:', error);
    // Fallback to localStorage
    const stats = JSON.parse(localStorage.getItem('adminStats') || '{}');
    return {
      totalViews: stats.totalViews || 0,
      totalOrders: stats.totalOrders || 0,
      todayViews: stats.todayViews || 0,
      todayOrders: stats.todayOrders || 0
    };
  }
};

// Get all orders
export const getOrders = async (limit = 50) => {
  try {
    const response = await fetch(`${API_URL}/orders?limit=${limit}`);
    if (!response.ok) throw new Error('Failed to get orders');
    return await response.json();
  } catch (error) {
    console.error('Error getting orders:', error);
    // Fallback to localStorage
    const stats = JSON.parse(localStorage.getItem('adminStats') || '{}');
    return stats.ordersHistory || [];
  }
};

// Check if backend is available
export const checkBackendHealth = async () => {
  try {
    const response = await fetch(`${API_URL}/health`);
    if (!response.ok) return false;
    const data = await response.json();
    return data.status === 'ok';
  } catch (error) {
    return false;
  }
};