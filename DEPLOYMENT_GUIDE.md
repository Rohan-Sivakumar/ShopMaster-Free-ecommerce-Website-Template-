# Deployment Guide for ShopMaster

Complete guide to deploy both frontend and backend to production.

---

## Frontend Deployment (Already Done ✅)

Your frontend is already deployed at: **https://scs577738.vercel.app**

---

## Backend Deployment to Vercel

### Option 1: Deploy via Vercel Dashboard (Easiest)

#### Step 1: Create Separate Vercel Project for Backend

1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Click **"Add New" → "Project"**
3. Import your GitHub repository: `Rohan-Sivakumar/shop`
4. **Important:** Configure root directory:
   - Click **"Edit"** next to Root Directory
   - Enter: `server`
   - This tells Vercel to deploy only the server folder
5. Project name: `shopmaster-backend` (or any name)
6. Click **"Deploy"**

#### Step 2: Add Environment Variable

1. After deployment, go to **Settings → Environment Variables**
2. Add new variable:
   - **Name:** `MONGODB_URI`
   - **Value:** Your MongoDB Atlas connection string
   - Example: `mongodb+srv://username:password@cluster.mongodb.net/shopmaster?retryWrites=true&w=majority`
3. Click **"Save"**
4. Go to **Deployments** → Click **"⋯"** → **"Redeploy"**

Your backend will be at: `https://shopmaster-backend-xxxxx.vercel.app`

---

### Option 2: Deploy via Vercel CLI

```bash
# Install Vercel CLI (if not already installed)
npm i -g vercel

# Navigate to server folder
cd server

# Login to Vercel
vercel login

# Deploy
vercel

# Follow prompts:
# - Set up and deploy? Yes
# - Which scope? (select your account)
# - Link to existing project? No
# - Project name? shopmaster-backend
# - Directory? ./ (already in server folder)
# - Override settings? No

# Add environment variable
vercel env add MONGODB_URI
# Paste your MongoDB connection string
# Select: Production, Preview, Development

# Deploy to production
vercel --prod
```

Your backend will be deployed!

---

## Update Frontend to Use Production Backend

### Step 1: Get Backend URL

After backend deployment, you'll get a URL like:
```
https://shopmaster-backend-xxxxx.vercel.app
```

### Step 2: Update Frontend Environment

1. Go to your frontend Vercel project: `scs577738`
2. Go to **Settings → Environment Variables**
3. Add new variable:
   - **Name:** `VITE_API_URL`
   - **Value:** `https://shopmaster-backend-xxxxx.vercel.app/api`
   - (Replace with your actual backend URL)
4. Select: **Production, Preview, Development**
5. Click **"Save"**

### Step 3: Redeploy Frontend

1. Go to **Deployments** tab
2. Click **"⋯"** on latest deployment
3. Click **"Redeploy"**

Done! ✅

---

## Alternative: Update Frontend Code Directly

Edit `src/api.js`:

```javascript
const API_URL = import.meta.env.VITE_API_URL || 'https://shopmaster-backend-xxxxx.vercel.app/api';
```

Commit and push - Vercel will auto-deploy.

---

## MongoDB Atlas Setup (If Not Done)

### Quick Setup:

1. **Create Account:** https://www.mongodb.com/cloud/atlas/register
2. **Create Cluster:**
   - Choose FREE M0 tier
   - Region: Mumbai (ap-south-1)
   - Cluster Name: ShopMaster
3. **Database Access:**
   - Add user: `shopmaster`
   - Autogenerate password → **Copy it!**
4. **Network Access:**
   - Add IP: `0.0.0.0/0` (Allow from anywhere)
5. **Get Connection String:**
   - Click "Connect" → "Connect your application"
   - Copy string: `mongodb+srv://shopmaster:<password>@...`
   - Replace `<password>` with your actual password
   - Add database name: `.../shopmaster?retryWrites=...`

Full guide: [MONGODB_SETUP.md](./MONGODB_SETUP.md)

---

## Testing Production Setup

### 1. Test Backend Health

Open in browser:
```
https://your-backend-url.vercel.app/api/health
```

Should return:
```json
{
  "status": "ok",
  "message": "Server is running"
}
```

### 2. Test Frontend

1. Visit: https://scs577738.vercel.app
2. Open browser console (F12)
3. Place a test order
4. Check for:
   - `✅ Order saved to MongoDB!`
   - No CORS errors

### 3. Test Cross-Browser Sync

1. Place order in **Chrome**
2. Open **Edge** or **Safari**
3. Go to Admin Panel
4. Should see the same order! ✅

---

## Architecture Overview

```
┌─────────────────────────────────────┐
│   Frontend (Vercel)                 │
│   https://scs577738.vercel.app     │
│                                     │
│   - React App                       │
│   - Google/Microsoft OAuth          │
│   - Shopping Cart                   │
└──────────────┬──────────────────────┘
               │
               │ API Calls
               ▼
┌─────────────────────────────────────┐
│   Backend (Vercel)                  │
│   https://shopmaster-backend.*.app  │
│                                     │
│   - Express.js Server               │
│   - RESTful API                     │
│   - CORS enabled                    │
└──────────────┬──────────────────────┘
               │
               │ MongoDB Driver
               ▼
┌─────────────────────────────────────┐
│   MongoDB Atlas (Cloud)             │
│                                     │
│   - Orders Collection               │
│   - Stats Collection                │
│   - Free M0 Cluster (512MB)         │
└─────────────────────────────────────┘
```

---

## Troubleshooting

### CORS Error

**Problem:** `Access to fetch blocked by CORS policy`

**Solution:** Backend `index.js` already includes your domain in CORS:
```javascript
cors({
  origin: ['https://scs577738.vercel.app', ...]
})
```

If issue persists, redeploy backend.

### Backend Not Connecting to MongoDB

**Check:**
1. Environment variable `MONGODB_URI` is set in Vercel
2. IP whitelist in MongoDB Atlas includes `0.0.0.0/0`
3. Username/password in connection string is correct
4. Database name is in connection string: `.../shopmaster?...`

### Orders Not Syncing

**Check:**
1. Backend health endpoint works
2. Frontend environment variable `VITE_API_URL` is set
3. Browser console shows "✅ Order saved to MongoDB!"
4. Admin panel shows "🟢 MongoDB Connected"

---

## Cost Breakdown

- **Frontend (Vercel):** FREE
- **Backend (Vercel):** FREE (Hobby plan)
- **MongoDB Atlas:** FREE (M0 tier - 512MB)
- **Total:** ₹0/month 🎉

**Free tier limits:**
- Vercel: 100GB bandwidth/month
- MongoDB Atlas: 512MB storage, unlimited reads/writes

---

## Next Steps After Deployment

1. ✅ Test all features in production
2. ✅ Place test orders from different browsers
3. ✅ Verify admin panel shows real-time data
4. ✅ Set up custom domain (optional)
5. ✅ Monitor MongoDB Atlas usage

---

## Custom Domain (Optional)

### Frontend Domain

1. Go to Vercel project: `scs577738`
2. Settings → Domains
3. Add your domain: `shopmaster.com`
4. Follow DNS configuration steps

### Backend Domain

1. Go to Vercel project: `shopmaster-backend`
2. Settings → Domains
3. Add subdomain: `api.shopmaster.com`
4. Update frontend `VITE_API_URL` to new domain

---

## Support

If you encounter issues:

1. Check Vercel deployment logs
2. Check MongoDB Atlas logs
3. Test backend health endpoint
4. Check browser console for errors

Happy deploying! 🚀