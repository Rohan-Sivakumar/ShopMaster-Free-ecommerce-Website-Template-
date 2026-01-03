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
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// MongoDB Connection with proper error handling
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/shopmaster';

// Configure mongoose settings
mongoose.set('strictQuery', false);
mongoose.set('bufferTimeoutMS', 30000); // Increase buffer timeout to 30 seconds

// Connection flag
let isConnected = false;

// Connect to MongoDB with retry logic (non-blocking)
const connectDB = async () => {
  if (isConnected) {
    console.log('✅ MongoDB already connected');
    return;
  }

  try {
    await mongoose.connect(MONGODB_URI, {
      serverSelectionTimeoutMS: 10000, // Timeout after 10s
      socketTimeoutMS: 45000, // Close sockets after 45s of inactivity
      family: 4 // Use IPv4, skip trying IPv6
    });
    
    isConnected = true;
    console.log('✅ Connected to MongoDB');
    
    // Initialize data after successful connection
    await initializeData();
  } catch (err) {
    console.error('❌ MongoDB connection error:', err.message);
    isConnected = false;
    
    // Retry connection after 5 seconds
    console.log('⏳ Retrying MongoDB connection in 5 seconds...');
    setTimeout(connectDB, 5000);
  }
};

// Handle connection events
mongoose.connection.on('connected', () => {
  isConnected = true;
  console.log('🔗 Mongoose connected to MongoDB');
});

mongoose.connection.on('disconnected', () => {
  isConnected = false;
  console.log('⚠️ Mongoose disconnected from MongoDB');
});

mongoose.connection.on('error', (err) => {
  isConnected = false;
  console.error('❌ Mongoose connection error:', err);
});

// Graceful shutdown
process.on('SIGINT', async () => {
  await mongoose.connection.close();
  console.log('👋 MongoDB connection closed through app termination');
  process.exit(0);
});

// Start connection (non-blocking - happens in background)
connectDB();

// Seller Schema
const sellerSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  businessName: { type: String, required: true },
  phone: { type: String },
  address: { type: String },
  isApproved: { type: Boolean, default: false },
  isSuperAdmin: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

const Seller = mongoose.model('Seller', sellerSchema);

// Product Schema (updated with seller info)
const productSchema = new mongoose.Schema({
  id: { type: String, required: true },
  year: { type: Number, required: true },
  cost: { type: Number, required: true },
  img: { type: String, required: true },
  category: { type: String, required: true },
  description: { type: String, required: true },
  sellerEmail: { type: String, required: true },
  sellerName: { type: String, required: true },
  sellerBusinessName: { type: String, required: true },
  stock: { type: Number, default: 100 },
  isActive: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

// Create compound index for unique products per seller
productSchema.index({ id: 1, sellerEmail: 1 }, { unique: true });

const Product = mongoose.model('Product', productSchema);

// Order Schema (updated with seller info)
const orderSchema = new mongoose.Schema({
  user: { type: String, required: true },
  userName: { type: String, required: true },
  items: { type: Number, required: true },
  total: { type: Number, required: true },
  products: [{
    name: String,
    quantity: Number,
    price: Number,
    sellerEmail: String,
    sellerName: String
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

// Initialize all data - called after MongoDB connection
const initializeData = async () => {
  try {
    // Initialize stats if not exists
    const stats = await Stats.findOne();
    if (!stats) {
      await Stats.create({});
      console.log('📊 Stats initialized');
    }

    // Initialize super admin seller
    const superAdmin = await Seller.findOne({ email: 'rohan.sivaa@gmail.com' });
    if (!superAdmin) {
      await Seller.create({
        email: 'rohan.sivaa@gmail.com',
        name: 'Rohan',
        businessName: 'ShopMaster',
        isApproved: true,
        isSuperAdmin: true
      });
      console.log('👑 Super admin seller initialized');
    }

    // Initialize with default products if empty
    const count = await Product.countDocuments();
    if (count === 0) {
      const defaultProducts = [
        {
          id: "Wireless headphone",
          year: 2025,
          cost: 9999,
          img: "/images/headphone.webp",
          category: "Electronics",
          description: "High-quality wireless headphones with noise cancellation.",
          sellerEmail: 'rohan.sivaa@gmail.com',
          sellerName: 'Rohan',
          sellerBusinessName: 'ShopMaster'
        },
        {
          id: "Smart Watch",
          year: 2024,
          cost: 4999,
          img: "/images/watch.webp",
          category: "Wearables",
          description: "Feature-rich smart watch with health tracking.",
          sellerEmail: 'rohan.sivaa@gmail.com',
          sellerName: 'Rohan',
          sellerBusinessName: 'ShopMaster'
        },
        {
          id: "Bluetooth Speaker",
          year: 2025,
          cost: 2999,
          img: "/images/speaker.webp",
          category: "Electronics",
          description: "Portable Bluetooth speaker with premium sound quality and 12-hour battery life.",
          sellerEmail: 'rohan.sivaa@gmail.com',
          sellerName: 'Rohan',
          sellerBusinessName: 'ShopMaster'
        },
        {
          id: "Wireless Mouse",
          year: 2024,
          cost: 799,
          img: "/images/mouse.webp",
          category: "Electronics",
          description: "Ergonomic wireless mouse with precision tracking and long battery life.",
          sellerEmail: 'rohan.sivaa@gmail.com',
          sellerName: 'Rohan',
          sellerBusinessName: 'ShopMaster'
        },
        {
          id: "USB-C Cable",
          year: 2025,
          cost: 299,
          img: "/images/cable.webp",
          category: "Accessories",
          description: "Fast charging USB-C cable with durable braided design.",
          sellerEmail: 'rohan.sivaa@gmail.com',
          sellerName: 'Rohan',
          sellerBusinessName: 'ShopMaster'
        },
        {
          id: "Fitness Band",
          year: 2024,
          cost: 1999,
          img: "/images/band.webp",
          category: "Wearables",
          description: "Track your fitness goals with heart rate monitoring and sleep tracking.",
          sellerEmail: 'rohan.sivaa@gmail.com',
          sellerName: 'Rohan',
          sellerBusinessName: 'ShopMaster'
        },
        {
          id: "Phone Case",
          year: 2025,
          cost: 499,
          img: "/images/case.webp",
          category: "Accessories",
          description: "Shockproof phone case with premium finish and raised edges.",
          sellerEmail: 'rohan.sivaa@gmail.com',
          sellerName: 'Rohan',
          sellerBusinessName: 'ShopMaster'
        },
        {
          id: "Power Bank",
          year: 2024,
          cost: 1499,
          img: "/images/powerbank.webp",
          category: "Electronics",
          description: "20000mAh power bank with fast charging support for multiple devices.",
          sellerEmail: 'rohan.sivaa@gmail.com',
          sellerName: 'Rohan',
          sellerBusinessName: 'ShopMaster'
        }
      ];
      
      await Product.insertMany(defaultProducts);
      console.log('📦 Default products initialized');
    }

    console.log('✅ All data initialized successfully');
  } catch (error) {    console.error('❌ Error initializing data:', error.message);
  }
};

// Routes

// Health check (doesn't require DB)
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    message: 'Server is running',
    database: isConnected ? 'connected' : 'connecting...'
  });
});

// NOTE: Removed blocking checkDbConnection middleware
// MongoDB will connect in background, routes will work immediately

// ========== SELLER ROUTES ==========

// Register as seller
app.post('/api/sellers/register', async (req, res) => {
  try {
    const { email, name, businessName, phone, address } = req.body;
    
    // Check if seller already exists
    const existing = await Seller.findOne({ email }).maxTimeMS(5000);
    if (existing) {
      return res.status(400).json({ error: 'Seller already registered with this email' });
    }
    
    const seller = await Seller.create({
      email,
      name,
      businessName,
      phone,
      address,
      isApproved: email === 'rohan.sivaa@gmail.com' // Auto-approve super admin
    });
    
    res.status(201).json(seller);
  } catch (error) {
    console.error('Register seller error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get seller by email
app.get('/api/sellers/:email', async (req, res) => {
  try {
    const seller = await Seller.findOne({ email: req.params.email }).maxTimeMS(5000);
    if (!seller) {
      return res.status(404).json({ error: 'Seller not found' });
    }
    res.json(seller);
  } catch (error) {
    console.error('Get seller error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get all sellers (super admin only)
app.get('/api/sellers', async (req, res) => {
  try {
    const sellers = await Seller.find().sort({ createdAt: -1 }).maxTimeMS(5000);
    res.json(sellers);
  } catch (error) {
    console.error('Get all sellers error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Approve seller (super admin only)
app.put('/api/sellers/:email/approve', async (req, res) => {
  try {
    const seller = await Seller.findOneAndUpdate(
      { email: req.params.email },
      { isApproved: true, updatedAt: new Date() },
      { new: true }
    ).maxTimeMS(5000);
    
    if (!seller) {
      return res.status(404).json({ error: 'Seller not found' });
    }
    
    res.json(seller);
  } catch (error) {
    console.error('Approve seller error:', error);
    res.status(500).json({ error: error.message });
  }
});

// ========== PRODUCT ROUTES ==========

// Get all products (active only for customers)
app.get('/api/products', async (req, res) => {
  try {
    const { sellerEmail } = req.query;
    const filter = { isActive: true };
    
    if (sellerEmail) {
      filter.sellerEmail = sellerEmail;
    }
    
    const products = await Product.find(filter).sort({ createdAt: -1 }).maxTimeMS(5000);
    res.json(products);
  } catch (error) {
    console.error('Get products error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get products by seller
app.get('/api/sellers/:email/products', async (req, res) => {
  try {
    const products = await Product.find({ sellerEmail: req.params.email }).sort({ createdAt: -1 }).maxTimeMS(5000);
    res.json(products);
  } catch (error) {
    console.error('Get seller products error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get product by ID
app.get('/api/products/:id', async (req, res) => {
  try {
    const product = await Product.findOne({ id: req.params.id }).maxTimeMS(5000);
    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }
    res.json(product);
  } catch (error) {
    console.error('Get product error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Add new product (seller must be approved)
app.post('/api/products', async (req, res) => {
  try {
    const { id, year, cost, img, category, description, sellerEmail } = req.body;
    
    // Check if seller exists and is approved
    const seller = await Seller.findOne({ email: sellerEmail }).maxTimeMS(5000);
    if (!seller) {
      return res.status(403).json({ error: 'Seller not registered' });
    }
    if (!seller.isApproved) {
      return res.status(403).json({ error: 'Seller account pending approval' });
    }
    
    // Check if product with same ID already exists for this seller
    const existing = await Product.findOne({ id, sellerEmail }).maxTimeMS(5000);
    if (existing) {
      return res.status(400).json({ error: 'You already have a product with this name' });
    }
    
    const product = await Product.create({
      id,
      year,
      cost,
      img,
      category,
      description,
      sellerEmail,
      sellerName: seller.name,
      sellerBusinessName: seller.businessName
    });
    
    res.status(201).json(product);
  } catch (error) {
    console.error('Add product error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Update product (only by owner seller)
app.put('/api/products/:id', async (req, res) => {
  try {
    const { year, cost, img, category, description, sellerEmail, stock, isActive } = req.body;
    
    // Find product and verify ownership
    const product = await Product.findOne({ id: req.params.id, sellerEmail }).maxTimeMS(5000);
    if (!product) {
      return res.status(404).json({ error: 'Product not found or you do not have permission to edit it' });
    }
    
    // Update product
    product.year = year || product.year;
    product.cost = cost !== undefined ? cost : product.cost;
    product.img = img || product.img;
    product.category = category || product.category;
    product.description = description || product.description;
    product.stock = stock !== undefined ? stock : product.stock;
    product.isActive = isActive !== undefined ? isActive : product.isActive;
    product.updatedAt = new Date();
    
    await product.save();
    
    res.json(product);
  } catch (error) {
    console.error('Update product error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Delete product (only by owner seller)
app.delete('/api/products/:id', async (req, res) => {
  try {
    const { sellerEmail } = req.query;
    
    const product = await Product.findOneAndDelete({ id: req.params.id, sellerEmail }).maxTimeMS(5000);
    
    if (!product) {
      return res.status(404).json({ error: 'Product not found or you do not have permission to delete it' });
    }
    
    res.json({ message: 'Product deleted successfully', product });
  } catch (error) {
    console.error('Delete product error:', error);
    res.status(500).json({ error: error.message });
  }
});

// ========== STATS ROUTES ==========

// Get stats
app.get('/api/stats', async (req, res) => {
  try {
    const { sellerEmail } = req.query;
    
    if (sellerEmail) {
      // Get seller-specific stats
      const products = await Product.find({ sellerEmail }).maxTimeMS(5000);
      const orders = await Order.find({ 'products.sellerEmail': sellerEmail }).maxTimeMS(5000);
      
      const totalOrders = orders.length;
      const totalRevenue = orders.reduce((sum, order) => {
        const sellerItems = order.products.filter(p => p.sellerEmail === sellerEmail);
        return sum + sellerItems.reduce((s, item) => s + (item.price * item.quantity), 0);
      }, 0);
      
      res.json({
        totalProducts: products.length,
        totalOrders,
        totalRevenue,
        activeProducts: products.filter(p => p.isActive).length
      });
    } else {
      // Get global stats
      let stats = await Stats.findOne().maxTimeMS(5000);
      if (!stats) {
        stats = await Stats.create({});
      }
      res.json(stats);
    }
  } catch (error) {
    console.error('Get stats error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Track page view
app.post('/api/stats/view', async (req, res) => {
  try {
    let stats = await Stats.findOne().maxTimeMS(5000);
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
    console.error('Track view error:', error);
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
    let stats = await Stats.findOne().maxTimeMS(5000);
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
    console.error('Create order error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get recent orders
app.get('/api/orders', async (req, res) => {
  try {
    const { sellerEmail, limit } = req.query;
    const orderLimit = parseInt(limit) || 50;
    
    let orders;
    if (sellerEmail) {
      // Get orders containing this seller's products
      orders = await Order.find({ 'products.sellerEmail': sellerEmail })
        .sort({ createdAt: -1 })
        .limit(orderLimit)
        .maxTimeMS(5000);
    } else {
      orders = await Order.find()
        .sort({ createdAt: -1 })
        .limit(orderLimit)
        .maxTimeMS(5000);
    }
    
    res.json(orders);
  } catch (error) {
    console.error('Get orders error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get order by ID
app.get('/api/orders/:id', async (req, res) => {
  try {
    const order = await Order.findById(req.params.id).maxTimeMS(5000);
    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }
    res.json(order);
  } catch (error) {
    console.error('Get order error:', error);
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