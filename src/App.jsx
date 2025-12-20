import React, { useState, useEffect } from "react";
import Navigation from "./Navigation";
import "./App.css";
import "./styles/ProductDetails.css";
import { addcart, removecart, user, useCartUpdater } from "./index.js";
import us from "./assets/login.json";
var users = JSON.parse(JSON.stringify(us));


const initialProducts = [
    {
        id: "Wireless headphone",
        year: 2025,
        cost: 9999,
        img: "./src/assets/headphone.jpeg",
        category: "Electronics",
        description: "High-quality wireless headphones with noise cancellation.",
        originalPrice: 14999,
        rating: 4.5,
        reviews: 342,
        stock: 15,
        colors: [
            { name: 'black', hex: '#000000' },
            { name: 'silver', hex: '#C0C0C0' },
            { name: 'gold', hex: '#FFD700' },
        ],
        sizes: ['S', 'M', 'L', 'XL'],
        features: [
            '✓ Active Noise Cancellation',
            '✓ 30-Hour Battery Life',
            '✓ Premium Sound Quality',
            '✓ Bluetooth 5.0',
        ]
    },
    {
        id: "Smart Watch",
        year: 2024,
        cost: 4999,
        img: "./src/assets/watch.jpeg",
        category: "Wearables",
        description: "Feature-rich smart watch with health tracking.",
        originalPrice: 7999,
        rating: 4.3,
        reviews: 215,
        stock: 20,
        colors: [
            { name: 'black', hex: '#000000' },
            { name: 'silver', hex: '#C0C0C0' },
            { name: 'rose', hex: '#F64A8A' },
        ],
        sizes: ['S', 'M', 'L'],
        features: [
            '✓ Heart Rate Monitor',
            '✓ Sleep Tracking',
            '✓ GPS Navigation',
            '✓ Water Resistant',
        ]
    },
    // Add more products as needed
];

function App() {
  const [products] = useState(initialProducts);
  const [activePage, setActivePage] = useState('home');
  const [cartItems, setCartItems] = useState(() => users?.[user]?.cart ?? []);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("All");
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [selectedSize, setSelectedSize] = useState('M');
  const [selectedColor, setSelectedColor] = useState('black');

  // Get unique categories for filter dropdown
  const categories = ["All", ...Array.from(new Set(products.map(p => p.category)))];

  // Custom hook to update cart items on 'cartUpdated' event
  useCartUpdater(setCartItems);

  const handlePageChange = (pageId) => {
    setActivePage(pageId);
    setSelectedProduct(null);
    setQuantity(1);
    setSelectedSize('M');
    setSelectedColor('black');
  };

  // Filter and search logic
  const filteredProducts = products.filter(product => {
    const matchesSearch = product.id.toLowerCase().includes(search.toLowerCase());
    const matchesFilter = filter === "All" || product.category === filter;
    return matchesSearch && matchesFilter;
  });

  // Product details modal/page
  const showProductDetails = (product) => {
    setSelectedProduct(product);
    setActivePage("pdetails");
    setQuantity(1);
    setSelectedSize('M');
    setSelectedColor('black');
  };

  const discount = selectedProduct ? Math.round(((selectedProduct.originalPrice - selectedProduct.cost) / selectedProduct.originalPrice) * 100) : 0;

  const handleAddToCart = () => {
    for (let i = 0; i < quantity; i++) {
      addcart(selectedProduct);
    }
    alert(`${quantity}x ${selectedProduct.id} added to cart!`);
    setQuantity(1);
  };

  const handleBuyNow = () => {
    alert(`Proceeding to checkout with ${quantity}x ${selectedProduct.id}`);
  };

  return (
    <>
      <Navigation activePage={activePage} onPageChange={handlePageChange} />

      {/* Product Page with Search and Filter */}
      <div id="p" className={`page ${activePage === 'p' ? 'active' : ''}`}>
        <h2 style={{textAlign:'center'}}>Products</h2>
        <div style={{display:'flex', justifyContent:'center', gap:'1rem', marginBottom:'1rem', flexWrap:'wrap'}}>
          <input
            type="text"
            placeholder="Search products..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            style={{padding:'8px', fontSize:'1rem'}}
          />
          <select
            value={filter}
            onChange={e => setFilter(e.target.value)}
            style={{padding:'8px', fontSize:'1rem'}}
          >
            {categories.map(cat => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
        </div>
        <div style={{display:'flex',flexWrap:'wrap',justifyContent:'center',gap:'10px'}}>
          {filteredProducts.length === 0 && <p>No products found.</p>}
          {filteredProducts.map((product) => {
            const quantity = cartItems.filter(item => item.id === product.id).length;
            return (
              <div
                className='div'
                key={product.id}
                style={{cursor:'pointer'}}
                onClick={() => showProductDetails(product)}
              >
                <img src={product.img} className='img' alt={product.id} height={'218.25px'} onError={(e) => {e.target.src = 'https://via.placeholder.com/300?text=Product'}} />
                <h2 className='h2'>{product.id}</h2>
                <h3 className='h3'>₹{product.cost}</h3>
                <div className='add' onClick={e => e.stopPropagation()}>
                  {quantity === 0 ? (
                    <button className="button" onClick={() => addcart(product)}>
                      Add To Cart
                    </button>
                  ) : (
                    <button className="button" style={{width: '90.16px'}}>
                      <span style={{marginRight:'22px',paddingLeft:'2px',paddingRight:'2px'}} onClick={() => removecart(product)}>-</span>
                      {quantity}
                      <span style={{marginLeft:'22px',paddingRight:'2px' ,paddingLeft:'2px'}} onClick={() => addcart(product)}>+</span>
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Product Details Page - ENHANCED */}
      <div className={`page ${activePage === 'pdetails' ? 'active' : ''}`} id="pdetails">
        {selectedProduct && (
          <div className="product-details-container">
            {/* Left Section - Product Image */}
            <div className="product-image-section">
              <div className="product-image-wrapper">
                <img
                  src={selectedProduct.img}
                  alt={selectedProduct.id}
                  className="product-main-image"
                  onError={(e) => {
                    e.target.src = 'https://via.placeholder.com/500?text=Product+Image';
                  }}
                />
                {discount > 0 && <div className="discount-badge">{discount}% OFF</div>}
                {selectedProduct.stock > 0 && <div className="stock-badge">In Stock</div>}
              </div>
              <div className="product-thumbnails">
                {[1, 2, 3].map((idx) => (
                  <img
                    key={idx}
                    src={selectedProduct.img}
                    alt={`thumbnail ${idx}`}
                    className={`thumbnail ${idx === 1 ? 'active' : ''}`}
                    onError={(e) => (e.target.src = 'https://via.placeholder.com/80?text=Thumb')}
                  />
                ))}
              </div>
            </div>

            {/* Right Section - Product Details */}
            <div className="product-details-section">
              {/* Title and Rating */}
              <div className="product-header">
                <h1 className="product-title">{selectedProduct.id}</h1>
                <div className="rating-section">
                  <div className="stars">
                    {'★'.repeat(Math.floor(selectedProduct.rating || 4))}
                    {(selectedProduct.rating || 4) % 1 !== 0 && '½'}
                  </div>
                  <span className="rating-value">{selectedProduct.rating || 4}</span>
                  <span className="review-count">({selectedProduct.reviews || 100} reviews)</span>
                </div>
              </div>

              {/* Price Section */}
              <div className="price-section">
                <div className="price-display">
                  <span className="current-price">₹{selectedProduct.cost.toLocaleString()}</span>
                  <span className="original-price">₹{selectedProduct.originalPrice.toLocaleString()}</span>
                  <span className="discount-percent">{discount}% OFF</span>
                </div>
                <p className="description">{selectedProduct.description}</p>
              </div>

              {/* Options */}
              <div className="product-options">
                {/* Color Selection */}
                {selectedProduct.colors && (
                  <div className="option-group">
                    <label>Color:</label>
                    <div className="color-options">
                      {selectedProduct.colors.map((color) => (
                        <button
                          key={color.name}
                          className={`color-btn ${selectedColor === color.name ? 'active' : ''}`}
                          style={{ backgroundColor: color.hex }}
                          onClick={() => setSelectedColor(color.name)}
                          title={color.name}
                        />
                      ))}
                    </div>
                    <p className="selected-option">Selected: {selectedColor}</p>
                  </div>
                )}

                {/* Size Selection */}
                {selectedProduct.sizes && (
                  <div className="option-group">
                    <label>Size:</label>
                    <div className="size-options">
                      {selectedProduct.sizes.map((size) => (
                        <button
                          key={size}
                          className={`size-btn ${selectedSize === size ? 'active' : ''}`}
                          onClick={() => setSelectedSize(size)}
                        >
                          {size}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Quantity Selection */}
                <div className="option-group">
                  <label>Quantity:</label>
                  <div className="quantity-selector">
                    <button
                      className="qty-btn"
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    >
                      −
                    </button>
                    <input
                      type="number"
                      value={quantity}
                      onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                      min="1"
                      max={selectedProduct.stock}
                    />
                    <button
                      className="qty-btn"
                      onClick={() => setQuantity(Math.min(selectedProduct.stock, quantity + 1))}
                    >
                      +
                    </button>
                  </div>
                  <small>Only {selectedProduct.stock} available</small>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="action-buttons">
                <button className="add-to-cart-btn" onClick={handleAddToCart}>
                  🛒 Add to Cart
                </button>
                <button className="buy-now-btn" onClick={handleBuyNow}>
                  💳 Buy Now
                </button>
              </div>

              {/* Features */}
              {selectedProduct.features && (
                <div className="features-section">
                  <h3>Key Features:</h3>
                  <ul className="features-list">
                    {selectedProduct.features.map((feature, idx) => (
                      <li key={idx}>{feature}</li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Shipping Info */}
              <div className="shipping-info">
                <div className="info-item">
                  <span>📦</span>
                  <div>
                    <strong>Free Shipping</strong>
                    <p>on orders above ₹500</p>
                  </div>
                </div>
                <div className="info-item">
                  <span>↩️</span>
                  <div>
                    <strong>Easy Returns</strong>
                    <p>30-day return policy</p>
                  </div>
                </div>
                <div className="info-item">
                  <span>🔒</span>
                  <div>
                    <strong>Secure Payment</strong>
                    <p>100% secure transactions</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Home, Login, Cart, Dashboard (unchanged) */}
      <div id="home" className={`page ${activePage === 'home' ? 'active' : ''}`}>
        <div className="body">
          <center>
            <div className="upper">
              <h1 className="heading" style={{ color: "black" }}>Welcome To ShopMaster</h1>
              <p className="para">Here You Can Buy Products In Unbeatable Prices</p>
              <button className="uppbutton" onClick={() => setActivePage('p')} ><h3 className="upbutton" style={{color: 'white'}}>Shop Now</h3></button>
            </div>
          </center>
        </div>
      </div>

      <div id="login" className={`page ${activePage === 'login' ? 'active' : ''}`}>
        <div className="login-container">
          <form className="login-form">
            <h2>Login</h2>
            <div className="input-group"><label htmlFor="username">Username</label><input type="text" id="username" name="username" required /></div>
            <div className="input-group"><label htmlFor="password">Password</label><input type="password" id="password" name="password" required /></div>
            <button type="submit" className="login-button">Login</button>
            <div className="form-footer"><a href="#">Forgot Password?</a><span> | </span><a href="#">Sign Up</a></div>
          </form>
        </div>
      </div>

      <div id="Cart" className={`page ${activePage === 'Cart' ? 'active' : ''}`}>
        <div className="cart-container">
            <h2>Your Cart</h2>
            {cartItems.length === 0 ? (
                <p>Your cart is empty.</p>
            ) : (
                (() => {
                    const groupedCart = cartItems.reduce((acc, item) => {
                        const existingItem = acc.find(i => i.id === item.id);
                        if (existingItem) {
                            existingItem.quantity++;
                        } else {
                            acc.push({ ...item, quantity: 1 });
                        }
                        return acc;
                    }, []);

                    const totalPrice = groupedCart.reduce((sum, item) => sum + (item.cost * item.quantity), 0);

                    return (
                        <>
                            <ul className="cart-list">
                                {groupedCart.map(item => (
                                    <li key={item.id}>
                                        <span>{item.id}{item.quantity > 1 ? ` × ${item.quantity}` : ''}</span>
                                        <span>₹{item.cost * item.quantity}</span>
                                    </li>
                                ))}
                            </ul>
                            <div style={{marginTop: '20px', fontSize: '18px', fontWeight: 'bold'}}>
                                <p>Total: ₹{totalPrice}</p>
                            </div>
                        </>
                    );
                })()
            )}
        </div>
      </div>
      <div id="dashboard" className={`page ${activePage === 'dashboard' ? 'active' : ''}`}>
        <center>
            <h2>dashboard</h2>
            <p>Welcome to your dashboard, {user}!</p>
        </center>
      </div>
    </>
  );
}

export default App;
