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

// Product Schema
const productSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  year: { type: Number, required: true },
  cost: { type: Number, required: true },
  img: { type: String, required: true },
  category: { type: String, required: true },
  description: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

const Product = mongoose.model('Product', productSchema);

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

// Initialize with default products if empty
const initializeProducts = async () => {
  try {
    const count = await Product.countDocuments();
    if (count === 0) {
      const defaultProducts = [
        {
          id: "Wireless headphone",
          year: 2025,
          cost: 9999,
          img: "/images/headphone.webp",
          category: "Electronics",
          description: "High-quality wireless headphones with noise cancellation."
        },
        {
          id: "Smart Watch",
          year: 2024,
          cost: 4999,
          img: "/images/watch.webp",
          category: "Wearables",
          description: "Feature-rich smart watch with health tracking."
        },
        {
          id: "Bluetooth Speaker",
          year: 2025,
          cost: 2999,
          img: "/images/speaker.webp",
          category: "Electronics",
          description: "Portable Bluetooth speaker with premium sound quality and 12-hour battery life."
        },
        {
          id: "Wireless Mouse",
          year: 2024,
          cost: 799,
          img: "/images/mouse.webp",
          category: "Electronics",
          description: "Ergonomic wireless mouse with precision tracking and long battery life."
        },
        {
          id: "USB-C Cable",
          year: 2025,
          cost: 299,
          img: "/images/cable.webp",
          category: "Accessories",
          description: "Fast charging USB-C cable with durable braided design."
        },
        {
          id: "Fitness Band",
          year: 2024,
          cost: 1999,
          img: "/images/band.webp",
          category: "Wearables",
          description: "Track your fitness goals with heart rate monitoring and sleep tracking."
        },
        {
          id: "Phone Case",
          year: 2025,
          cost: 499,
          img: "/images/case.webp",
          category: "Accessories",
          description: "Shockproof phone case with premium finish and raised edges."
        },
        {
          id: "Power Bank",
          year: 2024,
          cost: 1499,
          img: "/images/powerbank.webp",
          category: "Electronics",
          description: "20000mAh power bank with fast charging support for multiple devices."
        }
      ];
      
      await Product.insertMany(defaultProducts);
      console.log('📦 Default products initialized');
    }
  } catch (error) {
    console.log('Products initialization pending...');
  }
};

initializeStats();
initializeProducts();

// Routes

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Server is running' });
});

// ========== PRODUCT ROUTES ==========

// Get all products
app.get('/api/products', async (req, res) => {
  try {
    const products = await Product.find().sort({ createdAt: -1 });
    res.json(products);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get product by ID
app.get('/api/products/:id', async (req, res) => {
  try {
    const product = await Product.findOne({ id: req.params.id });
    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }
    res.json(product);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Add new product
app.post('/api/products', async (req, res) => {
  try {
    const { id, year, cost, img, category, description } = req.body;
    
    // Check if product with same ID already exists
    const existing = await Product.findOne({ id });
    if (existing) {
      return res.status(400).json({ error: 'Product with this name already exists' });
    }
    
    const product = await Product.create({
      id,
      year,
      cost,
      img,
      category,
      description
    });
    
    res.status(201).json(product);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update product
app.put('/api/products/:id', async (req, res) => {
  try {
    const { year, cost, img, category, description } = req.body;
    
    const product = await Product.findOneAndUpdate(
      { id: req.params.id },
      { year, cost, img, category, description, updatedAt: new Date() },
      { new: true }
    );
    
    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }
    
    res.json(product);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Delete product
app.delete('/api/products/:id', async (req, res) => {
  try {
    const product = await Product.findOneAndDelete({ id: req.params.id });
    
    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }
    
    res.json({ message: 'Product deleted successfully', product });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ========== STATS ROUTES ==========

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

// ========== ORDER ROUTES ==========

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