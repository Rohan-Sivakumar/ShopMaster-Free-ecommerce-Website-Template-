import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors({
  origin: [
    'http://localhost:5173',
    'http://localhost:3000',
    'https://scs577738.vercel.app',
    'https://*.vercel.app'
  ],
  credentials: true
}));
app.use(express.json());

// MongoDB Connection
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/shopmaster';

mongoose.connect(MONGODB_URI)
  .then(() => console.log('✅ Connected to MongoDB'))
  .catch(err => console.error('❌ MongoDB connection error:', err));

// Order Schema
const orderSchema = new mongoose.Schema({
  user: { type: String, required: true },
  userName: { type: String, required: true },
  items: { type: Number, required: true },
  total: { type: Number, required: true },
  products: [{
    name: String,
    quantity: Number,
    price: Number
  }],
  createdAt: { type: Date, default: Date.now }
});

const Order = mongoose.model('Order', orderSchema);

// Stats Schema
const statsSchema = new mongoose.Schema({
  totalViews: { type: Number, default: 0 },
  totalOrders: { type: Number, default: 0 },
  todayViews: { type: Number, default: 0 },
  todayOrders: { type: Number, default: 0 },
  lastViewDate: { type: String, default: () => new Date().toLocaleDateString() },
  lastOrderDate: { type: String, default: () => new Date().toLocaleDateString() },
  updatedAt: { type: Date, default: Date.now }
});

const Stats = mongoose.model('Stats', statsSchema);

// Initialize stats if not exists
const initializeStats = async () => {
  try {
    const stats = await Stats.findOne();
    if (!stats) {
      await Stats.create({});
      console.log('📊 Stats initialized');
    }
  } catch (error) {
    console.log('Stats initialization pending...');
  }
};

initializeStats();

// Routes

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Server is running' });
});

// Get stats
app.get('/api/stats', async (req, res) => {
  try {
    let stats = await Stats.findOne();
    if (!stats) {
      stats = await Stats.create({});
    }
    res.json(stats);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Track page view
app.post('/api/stats/view', async (req, res) => {
  try {
    let stats = await Stats.findOne();
    if (!stats) {
      stats = await Stats.create({});
    }

    const today = new Date().toLocaleDateString();
    
    // Reset today's views if it's a new day
    if (stats.lastViewDate !== today) {
      stats.todayViews = 1;
      stats.lastViewDate = today;
    } else {
      stats.todayViews += 1;
    }
    
    stats.totalViews += 1;
    stats.updatedAt = new Date();
    
    await stats.save();
    res.json(stats);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create order
app.post('/api/orders', async (req, res) => {
  try {
    const { user, userName, items, total, products } = req.body;
    
    // Create order
    const order = await Order.create({
      user,
      userName,
      items,
      total,
      products
    });

    // Update stats
    let stats = await Stats.findOne();
    if (!stats) {
      stats = await Stats.create({});
    }

    const today = new Date().toLocaleDateString();
    
    // Reset today's orders if it's a new day
    if (stats.lastOrderDate !== today) {
      stats.todayOrders = 1;
      stats.lastOrderDate = today;
    } else {
      stats.todayOrders += 1;
    }
    
    stats.totalOrders += 1;
    stats.updatedAt = new Date();
    
    await stats.save();

    res.status(201).json({ order, stats });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get recent orders
app.get('/api/orders', async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 50;
    const orders = await Order.find()
      .sort({ createdAt: -1 })
      .limit(limit);
    res.json(orders);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get order by ID
app.get('/api/orders/:id', async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }
    res.json(order);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Start server (for local development)
if (process.env.NODE_ENV !== 'production') {
  app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
  });
}

export default app;