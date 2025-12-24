// API configuration
const API_URL = import.meta.env.VITE_API_URL || 'https://shopmaster-backend.vercel.app/api';

// Retry logic for failed requests
const fetchWithRetry = async (url, options = {}, retries = 2) => {
  try {
    const response = await fetch(url, options);
    return response;
  } catch (error) {
    if (retries > 0) {
      console.warn(`Retry attempt ${3 - retries} for ${url}`);
      await new Promise(resolve => setTimeout(resolve, 1000));
      return fetchWithRetry(url, options, retries - 1);
    }
    throw error;
  }
};

// Check if backend is available
export const checkBackendHealth = async () => {
  try {
    const response = await fetch(`${API_URL.replace('/api', '')}/api/health`, {
      signal: AbortSignal.timeout(5000)
    });
    if (!response.ok) return false;
    const data = await response.json();
    return data.status === 'ok';
  } catch (error) {
    console.warn('Backend health check failed:', error.message);
    return false;
  }
};

// Track page view
export const trackView = async () => {
  try {
    const response = await fetchWithRetry(`${API_URL}/stats/view`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    });
    if (!response.ok) throw new Error('Failed to track view');
    return await response.json();
  } catch (error) {
    console.error('Error tracking view:', error.message);
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
    if (!orderData || !orderData.user || !orderData.userName) {
      throw new Error('Invalid order data: missing user information');
    }

    const response = await fetchWithRetry(`${API_URL}/orders`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(orderData)
    });
    if (!response.ok) throw new Error('Failed to create order');
    return await response.json();
  } catch (error) {
    console.error('Error creating order:', error.message);
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
export const getStats = async () => {
  try {
    const response = await fetchWithRetry(`${API_URL}/stats`);
    if (!response.ok) throw new Error('Failed to get stats');
    return await response.json();
  } catch (error) {
    console.error('Error getting stats:', error.message);
    // Fallback to localStorage
    const stats = JSON.parse(localStorage.getItem('adminStats') || '{}');
    return {
      totalViews: stats.totalViews || 0,
      totalOrders: stats.totalOrders || 0,
      todayViews: stats.todayViews || 0,
      todayOrders: stats.todayOrders || 0,
      totalProducts: 0,
      activeProducts: 0,
      totalRevenue: 0
    };
  }
};

// Get all orders
export const getOrders = async (limit = 50) => {
  try {
    const response = await fetchWithRetry(`${API_URL}/orders?limit=${limit}`);
    if (!response.ok) throw new Error('Failed to get orders');
    return await response.json();
  } catch (error) {
    console.error('Error getting orders:', error.message);
    // Fallback to localStorage
    const stats = JSON.parse(localStorage.getItem('adminStats') || '{}');
    return stats.ordersHistory || [];
  }
};

// ========== PRODUCT MANAGEMENT ==========

// Get all products
export const getProducts = async () => {
  try {
    const response = await fetchWithRetry(`${API_URL}/products`);
    if (!response.ok) throw new Error('Failed to get products');
    return await response.json();
  } catch (error) {
    console.error('Error getting products:', error.message);
    // Fallback to localStorage
    const products = JSON.parse(localStorage.getItem('products') || '[]');
    return Array.isArray(products) ? products : [];
  }
};

// Add new product
export const addProduct = async (productData) => {
  try {
    if (!productData.id || !productData.cost) {
      throw new Error('Missing required product fields');
    }

    const response = await fetchWithRetry(`${API_URL}/products`, {
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
    console.error('Error adding product:', error.message);
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
    if (!productId) throw new Error('Product ID is required');

    const response = await fetchWithRetry(`${API_URL}/products/${encodeURIComponent(productId)}`, {
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
    console.error('Error updating product:', error.message);
    throw error;
  }
};

// Delete product
export const deleteProduct = async (productId) => {
  try {
    if (!productId) throw new Error('Product ID is required');

    const response = await fetchWithRetry(
      `${API_URL}/products/${encodeURIComponent(productId)}`,
      { method: 'DELETE' }
    );
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to delete product');
    }
    return await response.json();
  } catch (error) {
    console.error('Error deleting product:', error.message);
    // Fallback to localStorage
    const products = JSON.parse(localStorage.getItem('products') || '[]');
    const updatedProducts = products.filter(p => p.id !== productId);
    localStorage.setItem('products', JSON.stringify(updatedProducts));
    
    // Trigger storage event for App.jsx to update
    window.dispatchEvent(new CustomEvent('productsUpdated', { detail: updatedProducts }));
    
    throw error; // Re-throw to show error message
  }
};
