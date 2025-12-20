# ShopMaster - E-Commerce Platform 🛒

## Quick Start

### 1. Install Dependencies
```bash
npm install
```

### 2. Run Development Server
```bash
npm run dev
```
Visit: `http://localhost:5173`

### 3. Test Login

**Admin Access:**
- Email: `admin@shop.com`
- Password: `admin123`
- Access: Full Admin Dashboard

**User Access:**
- Email: `user@shop.com`
- Password: `user123`
- Access: Product Browsing

---

## 📁 Project Structure

```
src/
├── pages/
│   ├── LoginPage.jsx        # User & Admin login
│   ├── ProductPage.jsx      # Product details with images
│   └── AdminPanel.jsx       # Admin dashboard
├── styles/
│   ├── Auth.css             # Login styling
│   ├── ProductPage.css      # Product page styling
│   └── AdminPanel.css       # Admin panel styling
├── App.jsx
├── Navigation.jsx
└── index.js
```

---

## ✨ Features

### Login Page
- ✅ User & Admin login
- ✅ Role-based routing
- ✅ Form validation
- ✅ LocalStorage persistence

### Product Page
- ✅ Image gallery with thumbnails
- ✅ Price with discount
- ✅ Color selection
- ✅ Size selection
- ✅ Quantity selector
- ✅ Add to Cart button
- ✅ Buy Now button
- ✅ Related products

### Admin Panel
- ✅ Dashboard with statistics
- ✅ Product management
- ✅ Order management
- ✅ Analytics section
- ✅ Responsive tables

---

## 🏗️ Build & Deploy

### Build for Production
```bash
npm run build
```

### Preview Build
```bash
npm run preview
```

### Deploy to Vercel
```bash
git push
```
Vercel auto-deploys on push to main branch.

---

## 🔧 Scripts Available

```bash
npm run dev              # Start development server
npm run build           # Build for production
npm run preview         # Preview production build
npm run lint            # Run ESLint
npm run fix-permissions # Fix binary permissions
```

---

## 📦 Dependencies

- **React 19.2.0** - UI framework
- **Vite 7.2.4** - Build tool
- **SweetAlert2** - Notifications
- **FontAwesome** - Icons
- **ESLint** - Code quality

---

## 🎨 Responsive Design

✅ Desktop (1200px+)
✅ Tablet (768px - 1199px)
✅ Mobile (480px - 767px)
✅ Small Mobile (<480px)

---

## 🚀 Next Steps

1. Connect to backend API
2. Add payment integration
3. Implement shopping cart
4. Add user profiles
5. Deploy to production

---

## 📝 Notes

- Demo credentials are for testing only
- Images use Unsplash URLs (replace with your own)
- Data stored in localStorage (use database for production)

---

**Ready to go! Happy coding! 🎉**
