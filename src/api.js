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
        userName: orderData.userName,
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
export const getStats = async (sellerEmail = null) => {
  try {
    const url = sellerEmail ? `${API_URL}/stats?sellerEmail=${encodeURIComponent(sellerEmail)}` : `${API_URL}/stats`;
    const response = await fetch(url);
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
export const getOrders = async (limit = 50, sellerEmail = null) => {
  try {
    const url = sellerEmail 
      ? `${API_URL}/orders?limit=${limit}&sellerEmail=${encodeURIComponent(sellerEmail)}`
      : `${API_URL}/orders?limit=${limit}`;
    const response = await fetch(url);
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

// ========== SELLER MANAGEMENT ==========

// Register as seller
export const registerSeller = async (sellerData) => {
  try {
    const response = await fetch(`${API_URL}/sellers/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(sellerData)
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to register seller');
    }
    return await response.json();
  } catch (error) {
    console.error('Error registering seller:', error);
    throw error;
  }
};

// Get seller by email
export const getSeller = async (email) => {
  try {
    const response = await fetch(`${API_URL}/sellers/${encodeURIComponent(email)}`);
    if (!response.ok) {
      if (response.status === 404) return null;
      throw new Error('Failed to get seller');
    }
    return await response.json();
  } catch (error) {
    console.error('Error getting seller:', error);
    return null;
  }
};

// Get all sellers (super admin only)
export const getAllSellers = async () => {
  try {
    const response = await fetch(`${API_URL}/sellers`);
    if (!response.ok) throw new Error('Failed to get sellers');
    return await response.json();
  } catch (error) {
    console.error('Error getting sellers:', error);
    return [];
  }
};

// Approve seller (super admin only)
export const approveSeller = async (email) => {
  try {
    const response = await fetch(`${API_URL}/sellers/${encodeURIComponent(email)}/approve`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' }
    });
    if (!response.ok) throw new Error('Failed to approve seller');
    return await response.json();
  } catch (error) {
    console.error('Error approving seller:', error);
    throw error;
  }
};

// ========== PRODUCT MANAGEMENT ==========

// Get all products
export const getProducts = async (sellerEmail = null) => {
  try {
    const url = sellerEmail 
      ? `${API_URL}/products?sellerEmail=${encodeURIComponent(sellerEmail)}`
      : `${API_URL}/products`;
    const response = await fetch(url);
    if (!response.ok) throw new Error('Failed to get products');
    return await response.json();
  } catch (error) {
    console.error('Error getting products:', error);
    // Fallback to localStorage
    const products = JSON.parse(localStorage.getItem('products') || '[]');
    return products;
  }
};

// Get seller's products
export const getSellerProducts = async (email) => {
  try {
    const response = await fetch(`${API_URL}/sellers/${encodeURIComponent(email)}/products`);
    if (!response.ok) throw new Error('Failed to get seller products');
    return await response.json();
  } catch (error) {
    console.error('Error getting seller products:', error);
    return [];
  }
};

// Add new product
export const addProduct = async (productData) => {
  try {
    const response = await fetch(`${API_URL}/products`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(productData)
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to add product');
    }
    return await response.json();
  } catch (error) {
    console.error('Error adding product:', error);
    // Fallback to localStorage
    const products = JSON.parse(localStorage.getItem('products') || '[]');
    products.push(productData);
    localStorage.setItem('products', JSON.stringify(products));
    
    // Trigger storage event for App.jsx to update
    window.dispatchEvent(new CustomEvent('productsUpdated', { detail: products }));
    
    throw error; // Re-throw to show error message
  }
};

// Update product
export const updateProduct = async (productId, productData) => {
  try {
    const response = await fetch(`${API_URL}/products/${encodeURIComponent(productId)}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(productData)
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to update product');
    }
    return await response.json();
  } catch (error) {
    console.error('Error updating product:', error);
    throw error;
  }
};

// Delete product
export const deleteProduct = async (productId, sellerEmail) => {
  try {
    const response = await fetch(`${API_URL}/products/${encodeURIComponent(productId)}?sellerEmail=${encodeURIComponent(sellerEmail)}`, {
      method: 'DELETE'
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to delete product');
    }
    return await response.json();
  } catch (error) {
    console.error('Error deleting product:', error);
    // Fallback to localStorage
    const products = JSON.parse(localStorage.getItem('products') || '[]');
    const updatedProducts = products.filter(p => p.id !== productId);
    localStorage.setItem('products', JSON.stringify(updatedProducts));
    
    // Trigger storage event for App.jsx to update
    window.dispatchEvent(new CustomEvent('productsUpdated', { detail: updatedProducts }));
    
    throw error; // Re-throw to show error message
  }
};