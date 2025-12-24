import { db } from './firebase';
import { collection, doc, setDoc, getDoc, getDocs, addDoc, query, orderBy, limit, serverTimestamp } from 'firebase/firestore';

// Get admin stats from Firestore
export const getAdminStats = async () => {
  try {
    const statsDoc = doc(db, 'stats', 'adminStats');
    const docSnap = await getDoc(statsDoc);
    
    if (docSnap.exists()) {
      return docSnap.data();
    } else {
      // Initialize with default values
      const defaultStats = {
        totalViews: 0,
        totalOrders: 0,
        todayViews: 0,
        todayOrders: 0,
        lastViewDate: new Date().toLocaleDateString(),
        lastOrderDate: new Date().toLocaleDateString()
      };
      await setDoc(statsDoc, defaultStats);
      return defaultStats;
    }
  } catch (error) {
    console.error('Error getting admin stats:', error);
    return {
      totalViews: 0,
      totalOrders: 0,
      todayViews: 0,
      todayOrders: 0,
      lastViewDate: new Date().toLocaleDateString(),
      lastOrderDate: new Date().toLocaleDateString()
    };
  }
};

// Update admin stats in Firestore
export const updateAdminStats = async (updates) => {
  try {
    const statsDoc = doc(db, 'stats', 'adminStats');
    await setDoc(statsDoc, updates, { merge: true });
    return true;
  } catch (error) {
    console.error('Error updating admin stats:', error);
    return false;
  }
};

// Track page view
export const trackPageView = async () => {
  try {
    const stats = await getAdminStats();
    const today = new Date().toLocaleDateString();
    
    let updates = {
      totalViews: (stats.totalViews || 0) + 1
    };
    
    // Reset today's views if it's a new day
    if (stats.lastViewDate !== today) {
      updates.todayViews = 1;
      updates.lastViewDate = today;
    } else {
      updates.todayViews = (stats.todayViews || 0) + 1;
    }
    
    await updateAdminStats(updates);
    return true;
  } catch (error) {
    console.error('Error tracking page view:', error);
    return false;
  }
};

// Add order to Firestore
export const addOrder = async (orderData) => {
  try {
    // Add order to orders collection
    const ordersRef = collection(db, 'orders');
    const orderDoc = await addDoc(ordersRef, {
      ...orderData,
      timestamp: serverTimestamp(),
      createdAt: new Date().toISOString()
    });
    
    // Update stats
    const stats = await getAdminStats();
    const today = new Date().toLocaleDateString();
    
    let updates = {
      totalOrders: (stats.totalOrders || 0) + 1
    };
    
    // Reset today's orders if it's a new day
    if (stats.lastOrderDate !== today) {
      updates.todayOrders = 1;
      updates.lastOrderDate = today;
    } else {
      updates.todayOrders = (stats.todayOrders || 0) + 1;
    }
    
    await updateAdminStats(updates);
    
    return orderDoc.id;
  } catch (error) {
    console.error('Error adding order:', error);
    return null;
  }
};

// Get recent orders from Firestore
export const getRecentOrders = async (limitCount = 50) => {
  try {
    const ordersRef = collection(db, 'orders');
    const q = query(ordersRef, orderBy('timestamp', 'desc'), limit(limitCount));
    const querySnapshot = await getDocs(q);
    
    const orders = [];
    querySnapshot.forEach((doc) => {
      orders.push({
        id: doc.id,
        ...doc.data()
      });
    });
    
    return orders;
  } catch (error) {
    console.error('Error getting recent orders:', error);
    return [];
  }
};

// Get all orders (for admin panel)
export const getAllOrders = async () => {
  try {
    const ordersRef = collection(db, 'orders');
    const q = query(ordersRef, orderBy('timestamp', 'desc'));
    const querySnapshot = await getDocs(q);
    
    const orders = [];
    querySnapshot.forEach((doc) => {
      orders.push({
        id: doc.id,
        ...doc.data()
      });
    });
    
    return orders;
  } catch (error) {
    console.error('Error getting all orders:', error);
    return [];
  }
};