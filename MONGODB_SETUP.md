# MongoDB Setup Guide for ShopMaster

Complete guide to set up MongoDB backend for cross-browser order synchronization.

## Quick Overview

After MongoDB setup:
- ✅ Orders sync across **all browsers** (Chrome, Edge, Firefox, Safari)
- ✅ Orders sync across **all devices** (phone, tablet, laptop)
- ✅ **Persistent data** - never loses orders
- ✅ **Real-time updates** - see orders instantly

---

## Option 1: MongoDB Atlas (Cloud - Recommended)

### Why Atlas?
- 🆓 **Free tier** (512MB storage)
- ☁️ **Cloud-hosted** (no local installation)
- 🌍 **Global access** (works from anywhere)
- 🔒 **Secure** (built-in security)

### Setup Steps

#### 1. Create MongoDB Atlas Account

1. Go to https://www.mongodb.com/cloud/atlas/register
2. Sign up (free account)
3. Choose **FREE M0 tier**

#### 2. Create Cluster

1. Click **"Build a Database"**
2. Choose **FREE tier** (M0 Sandbox)
3. Select region closest to India:
   - **Mumbai (ap-south-1)** ← Best choice
   - Or Singapore (ap-southeast-1)
4. Cluster Name: `ShopMaster`
5. Click **"Create"** (takes 1-3 minutes)

#### 3. Configure Database Access

1. Go to **"Database Access"** (left sidebar)
2. Click **"Add New Database User"**
3. Authentication Method: **Password**
4. Username: `shopmaster`
5. Password: Click **"Autogenerate Secure Password"** → Copy it!
6. Database User Privileges: **Read and write to any database**
7. Click **"Add User"**

#### 4. Configure Network Access

1. Go to **"Network Access"** (left sidebar)
2. Click **"Add IP Address"**
3. Choose **"Allow Access from Anywhere"** (0.0.0.0/0)
   - ⚠️ For development only. In production, whitelist specific IPs
4. Click **"Confirm"**

#### 5. Get Connection String

1. Go to **"Database"** → Click **"Connect"**
2. Choose **"Connect your application"**
3. Driver: **Node.js**, Version: **5.5 or later**
4. Copy the connection string:
   ```
   mongodb+srv://shopmaster:<password>@shopmaster.xxxxx.mongodb.net/?retryWrites=true&w=majority
   ```
5. Replace `<password>` with your actual password from step 3
6. Add database name: `.../shopmaster?retryWrites=...`

Final connection string example:
```
mongodb+srv://shopmaster:MySecurePass123@shopmaster.abc123.mongodb.net/shopmaster?retryWrites=true&w=majority
```

---

## Option 2: Local MongoDB

### Install MongoDB Locally

**Windows:**
1. Download: https://www.mongodb.com/try/download/community
2. Run installer (choose Complete)
3. Check "Install MongoDB as a Service"
4. Install MongoDB Compass (GUI tool)

**macOS:**
```bash
brew tap mongodb/brew
brew install mongodb-community
brew services start mongodb-community
```

**Linux (Ubuntu):**
```bash
wget -qO - https://www.mongodb.org/static/pgp/server-7.0.asc | sudo apt-key add -
echo "deb [ arch=amd64,arm64 ] https://repo.mongodb.org/apt/ubuntu focal/mongodb-org/7.0 multiverse" | sudo tee /etc/apt/sources.list.d/mongodb-org-7.0.list
sudo apt-get update
sudo apt-get install -y mongodb-org
sudo systemctl start mongod
```

### Connection String (Local)
```
mongodb://localhost:27017/shopmaster
```

---

## Backend Server Setup

### 1. Install Dependencies

```bash
cd server
npm install
```

This installs:
- `express` - Web server
- `mongoose` - MongoDB ODM
- `cors` - Cross-origin support
- `dotenv` - Environment variables
- `nodemon` - Auto-restart (dev)

### 2. Configure Environment

```bash
cd server
cp .env.example .env
```

Edit `.env`:
```env
# For MongoDB Atlas:
MONGODB_URI=mongodb+srv://shopmaster:YourPassword@shopmaster.xxxxx.mongodb.net/shopmaster?retryWrites=true&w=majority

# OR for local MongoDB:
# MONGODB_URI=mongodb://localhost:27017/shopmaster

PORT=5000
```

### 3. Start Backend Server

```bash
# Development mode (auto-restart)
npm run dev

# Production mode
npm start
```

You should see:
```
✅ Connected to MongoDB
🚀 Server running on http://localhost:5000
📊 Stats initialized
```

### 4. Test API

Open browser: http://localhost:5000/api/health

Should return:
```json
{
  "status": "ok",
  "message": "Server is running"
}
```

---

## Frontend Integration

### 1. Update API Service

Create `src/api.js`:
```javascript
const API_URL = 'http://localhost:5000/api';

export const trackView = async () => {
  const response = await fetch(`${API_URL}/stats/view`, {
    method: 'POST'
  });
  return response.json();
};

export const createOrder = async (orderData) => {
  const response = await fetch(`${API_URL}/orders`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(orderData)
  });
  return response.json();
};

export const getStats = async () => {
  const response = await fetch(`${API_URL}/stats`);
  return response.json();
};

export const getOrders = async (limit = 50) => {
  const response = await fetch(`${API_URL}/orders?limit=${limit}`);
  return response.json();
};
```

### 2. Update App.jsx

Replace localStorage calls with API calls (instructions in next commit).

---

## Deployment

### Deploy Backend to Vercel

1. Add `vercel.json` in server folder:
```json
{
  "version": 2,
  "builds": [
    { "src": "index.js", "use": "@vercel/node" }
  ],
  "routes": [
    { "src": "/(.*)", "dest": "index.js" }
  ]
}
```

2. Deploy:
```bash
cd server
vercel
```

3. Set environment variables in Vercel dashboard:
   - `MONGODB_URI` = your connection string

4. Update frontend `API_URL` to your Vercel URL

---

## Troubleshooting

### MongoDB Connection Failed

**Atlas:**
- Check username/password in connection string
- Verify IP whitelist (0.0.0.0/0 for development)
- Wait 1-2 minutes after creating cluster

**Local:**
- Check if MongoDB service is running
- Try: `mongosh` to test connection

### CORS Error

Backend already has CORS enabled. If issue persists:
```javascript
// In server/index.js
app.use(cors({
  origin: 'http://localhost:5173' // Your frontend URL
}));
```

### Port 5000 Already in Use

Change in `.env`:
```env
PORT=5001
```

---

## Next Steps

After backend is running:
1. ✅ Test API endpoints with Postman or browser
2. ✅ Update frontend to use API (next commit)
3. ✅ Test cross-browser sync
4. ✅ Deploy to production

## Benefits After Setup

✅ **Cross-browser** - Chrome order shows in Edge  
✅ **Cross-device** - Phone order shows on laptop  
✅ **Persistent** - Data never lost  
✅ **Scalable** - Handles unlimited orders  
✅ **Free** - MongoDB Atlas free tier

Ready? Let's integrate the frontend! 🚀