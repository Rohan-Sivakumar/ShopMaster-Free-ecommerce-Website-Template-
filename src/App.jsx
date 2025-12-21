import React, { useState, useEffect } from "react";
import Navigation from "./Navigation";
import "./App.css";
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
        description: "High-quality wireless headphones with noise cancellation."
    },
    {
        id: "Smart Watch",
        year: 2024,
        cost: 4999,
        img: "./src/assets/watch.jpeg",
        category: "Wearables",
        description: "Feature-rich smart watch with health tracking."
    },
    {
        id: "Bluetooth Speaker",
        year: 2025,
        cost: 2999,
        img: "./src/assets/speaker.jpeg",
        category: "Electronics",
        description: "Portable Bluetooth speaker with premium sound quality and 12-hour battery life."
    },
    {
        id: "Wireless Mouse",
        year: 2024,
        cost: 799,
        img: "./src/assets/mouse.jpeg",
        category: "Electronics",
        description: "Ergonomic wireless mouse with precision tracking and long battery life."
    },
    {
        id: "USB-C Cable",
        year: 2025,
        cost: 299,
        img: "./src/assets/cable.jpeg",
        category: "Accessories",
        description: "Fast charging USB-C cable with durable braided design."
    },
    {
        id: "Fitness Band",
        year: 2024,
        cost: 1999,
        img: "./src/assets/band.jpeg",
        category: "Wearables",
        description: "Track your fitness goals with heart rate monitoring and sleep tracking."
    },
    {
        id: "Phone Case",
        year: 2025,
        cost: 499,
        img: "./src/assets/case.jpeg",
        category: "Accessories",
        description: "Shockproof phone case with premium finish and raised edges."
    },
    {
        id: "Power Bank",
        year: 2024,
        cost: 1499,
        img: "./src/assets/powerbank.jpeg",
        category: "Electronics",
        description: "20000mAh power bank with fast charging support for multiple devices."
    },
    {
        id: "Laptop Stand",
        year: 2025,
        cost: 899,
        img: "./src/assets/stand.jpeg",
        category: "Accessories",
        description: "Adjustable aluminum laptop stand for better ergonomics and cooling."
    },
    {
        id: "Gaming Keyboard",
        year: 2024,
        cost: 3499,
        img: "./src/assets/keyboard.jpeg",
        category: "Electronics",
        description: "Mechanical gaming keyboard with RGB lighting and programmable keys."
    },
    {
        id: "Webcam HD",
        year: 2025,
        cost: 2499,
        img: "./src/assets/webcam.jpeg",
        category: "Electronics",
        description: "1080p HD webcam with auto-focus and built-in microphone."
    },
    {
        id: "Screen Protector",
        year: 2024,
        cost: 199,
        img: "./src/assets/protector.jpeg",
        category: "Accessories",
        description: "Tempered glass screen protector with anti-fingerprint coating."
    },
    {
        id: "Earbuds Pro",
        year: 2025,
        cost: 5999,
        img: "./src/assets/earbuds.jpeg",
        category: "Electronics",
        description: "True wireless earbuds with active noise cancellation and premium audio."
    },
    {
        id: "Tablet Stand",
        year: 2024,
        cost: 599,
        img: "./src/assets/tabletstand.jpeg",
        category: "Accessories",
        description: "Universal tablet stand with adjustable angles and stable base."
    },
    {
        id: "LED Desk Lamp",
        year: 2025,
        cost: 1299,
        img: "./src/assets/lamp.jpeg",
        category: "Electronics",
        description: "Smart LED desk lamp with adjustable brightness and color temperature."
    },
    {
        id: "Car Charger",
        year: 2024,
        cost: 399,
        img: "./src/assets/carcharger.jpeg",
        category: "Accessories",
        description: "Dual-port car charger with fast charging technology."
    },
    {
        id: "Smart Ring",
        year: 2025,
        cost: 6999,
        img: "./src/assets/ring.jpeg",
        category: "Wearables",
        description: "Smart ring for fitness tracking, sleep monitoring, and notifications."
    },
    {
        id: "Portable SSD",
        year: 2024,
        cost: 4499,
        img: "./src/assets/ssd.jpeg",
        category: "Electronics",
        description: "1TB portable SSD with high-speed data transfer and compact design."
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

  // Get unique categories for filter dropdown
  const categories = ["All", ...Array.from(new Set(products.map(p => p.category)))];

  // Custom hook to update cart items on 'cartUpdated' event
  useCartUpdater(setCartItems);

  const handlePageChange = (pageId) => {
    setActivePage(pageId);
    setSelectedProduct(null);
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
  };

  return (
    <>
      <Navigation activePage={activePage} onPageChange={handlePageChange} />

      {/* Product Page with Search and Filter */}
      <div id="p" className={`page ${activePage === 'p' ? 'active' : ''}`}>
        <h2 style={{textAlign:'center'}}>Products</h2>
        <div style={{display:'flex', justifyContent:'center', gap:'1rem', marginBottom:'1rem'}}>
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
                <img src={product.img} className='img' alt={product.id} height={'218.25px'} />
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

      {/* Product Details Page */}
      <div className={`page ${activePage === 'pdetails' ? 'active' : ''}`} id="pdetails">
        {selectedProduct && (
          <div style={{justifyContent:'start'}}>
            <div style={{boxShadow: '1px 1px 1px 1px grey', padding: '20px', margin: '20px', borderRadius: '10px', justifyContent:'start', height: 'fit-content' ,width: 'fit-content', marginLeft: 'auto', marginRight: 'auto'}}>
              {selectedProduct.img && (
                <img src={selectedProduct.img} alt={selectedProduct.id} height={'300px'} />
              )}
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