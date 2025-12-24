# Firebase Setup Instructions

## Step 1: Create Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click **"Add project"**
3. Enter project name: `shopmaster` (or any name you prefer)
4. Disable Google Analytics (optional) or enable it
5. Click **"Create project"**

## Step 2: Register Your Web App

1. In your Firebase project dashboard, click the **Web icon** (</>) to add a web app
2. Enter app nickname: `ShopMaster Web`
3. **Check** "Also set up Firebase Hosting" (optional)
4. Click **"Register app"**
5. Copy the `firebaseConfig` object

## Step 3: Update Firebase Configuration

1. Open `src/firebase.js`
2. Replace the placeholder values with your actual Firebase config:

```javascript
const firebaseConfig = {
  apiKey: "YOUR_ACTUAL_API_KEY",
  authDomain: "your-project.firebaseapp.com",
  projectId: "your-project-id",
  storageBucket: "your-project.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:abcdef",
  measurementId: "G-XXXXXXXXXX"
};
```

## Step 4: Set Up Firestore Database

1. In Firebase Console, go to **"Firestore Database"** from left sidebar
2. Click **"Create database"**
3. Choose **"Start in production mode"** (we'll add rules next)
4. Select your location (choose closest to India: `asia-south1` or `asia-southeast1`)
5. Click **"Enable"**

## Step 5: Configure Firestore Security Rules

1. Go to **"Firestore Database" → "Rules"** tab
2. Replace the rules with:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Allow anyone to read stats and orders (for admin panel)
    match /stats/{document=**} {
      allow read: true;
      allow write: true;
    }
    
    match /orders/{document=**} {
      allow read: true;
      allow write: true;
    }
    
    match /views/{document=**} {
      allow read: true;
      allow write: true;
    }
  }
}
```

3. Click **"Publish"**

## Step 6: Install Firebase Dependencies

Run this command in your project terminal:

```bash
npm install firebase
```

## Step 7: Deploy and Test

1. Push your code to GitHub
2. Vercel will auto-deploy
3. Test by:
   - Placing an order in Chrome
   - Opening admin panel in Edge
   - Order should appear! ✅

## Firestore Collections Structure

### `stats` collection:
```json
{
  "adminStats": {
    "totalViews": 100,
    "totalOrders": 25,
    "todayViews": 15,
    "todayOrders": 3,
    "lastViewDate": "12/24/2025",
    "lastOrderDate": "12/24/2025"
  }
}
```

### `orders` collection:
```json
{
  "orderId_timestamp": {
    "id": 1703412345678,
    "date": "2025-12-24T05:30:00.000Z",
    "user": "user@gmail.com",
    "items": 3,
    "total": 15999
  }
}
```

## Troubleshooting

### Error: "Permission denied"
- Check Firestore security rules are published
- Make sure rules allow read/write access

### Error: "Firebase not initialized"
- Verify `firebaseConfig` in `src/firebase.js` is correct
- Make sure you ran `npm install firebase`

### Orders not syncing
- Check browser console for errors
- Verify Firestore rules are set correctly
- Check Firebase Console → Firestore Database to see if data is being written

## Benefits After Setup

✅ Orders sync across **all browsers** (Chrome, Edge, Firefox, Safari)  
✅ Orders sync across **all devices** (phone, tablet, laptop)  
✅ **Real-time updates** - see orders instantly  
✅ **Persistent data** - never loses orders  
✅ **Scalable** - handles unlimited orders  
✅ **Free tier** - 50K reads + 20K writes per day

## Security Note

⚠️ **IMPORTANT:** Never commit your actual Firebase config with sensitive keys to public repositories. Consider using environment variables:

```javascript
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  // ... etc
};
```