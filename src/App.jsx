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
        img: "/images/headphone.jpeg",
        category: "Electronics",
        description: "High-quality wireless headphones with noise cancellation."
    },
    {
        id: "Smart Watch",
        year: 2024,
        cost: 4999,
        img: "/images/watch.jpeg",
        category: "Wearables",
        description: "Feature-rich smart watch with health tracking."
    },
    {
        id: "Bluetooth Speaker",
        year: 2025,
        cost: 2999,
        img: "/images/speaker.jpeg",
        category: "Electronics",
        description: "Portable Bluetooth speaker with premium sound quality and 12-hour battery life."
    },
    {
        id: "Wireless Mouse",
        year: 2024,
        cost: 799,
        img: "/images/mouse.jpeg",
        category: "Electronics",
        description: "Ergonomic wireless mouse with precision tracking and long battery life."
    },
    {
        id: "USB-C Cable",
        year: 2025,
        cost: 299,
        img: "/images/cable.jpeg",
        category: "Accessories",
        description: "Fast charging USB-C cable with durable braided design."
    },
    {
        id: "Fitness Band",
        year: 2024,
        cost: 1999,
        img: "/images/band.jpeg",
        category: "Wearables",
        description: "Track your fitness goals with heart rate monitoring and sleep tracking."
    },
    {
        id: "Phone Case",
        year: 2025,
        cost: 499,
        img: "/images/case.jpeg",
        category: "Accessories",
        description: "Shockproof phone case with premium finish and raised edges."
    },
    {
        id: "Power Bank",
        year: 2024,
        cost: 1499,
        img: "/images/powerbank.jpeg",
        category: "Electronics",
        description: "20000mAh power bank with fast charging support for multiple devices."
    },
    {
        id: "Laptop Stand",
        year: 2025,
        cost: 899,
        img: "/images/stand.jpeg",
        category: "Accessories",
        description: "Adjustable aluminum laptop stand for better ergonomics and cooling."
    },
    {
        id: "Gaming Keyboard",
        year: 2024,
        cost: 3499,
        img: "/images/keyboard.jpeg",
        category: "Electronics",
        description: "Mechanical gaming keyboard with RGB lighting and programmable keys."
    },
    {
        id: "Webcam HD",
        year: 2025,
        cost: 2499,
        img: "/images/webcam.jpeg",
        category: "Electronics",
        description: "1080p HD webcam with auto-focus and built-in microphone."
    },
    {
        id: "Screen Protector",
        year: 2024,
        cost: 199,
        img: "/images/protector.jpeg",
        category: "Accessories",
        description: "Tempered glass screen protector with anti-fingerprint coating."
    },
    {
        id: "Earbuds Pro",
        year: 2025,
        cost: 5999,
        img: "/images/earbuds.jpeg",
        category: "Electronics",
        description: "True wireless earbuds with active noise cancellation and premium audio."
    },
    {
        id: "Tablet Stand",
        year: 2024,
        cost: 599,
        img: "/images/tabletstand.jpeg",
        category: "Accessories",
        description: "Universal tablet stand with adjustable angles and stable base."
    },
    {
        id: "LED Desk Lamp",
        year: 2025,
        cost: 1299,
        img: "/images/lamp.jpeg",
        category: "Electronics",
        description: "Smart LED desk lamp with adjustable brightness and color temperature."
    },
    {
        id: "Car Charger",
        year: 2024,
        cost: 399,
        img: "/images/carcharger.jpeg",
        category: "Accessories",
        description: "Dual-port car charger with fast charging technology."
    },
    {
        id: "Smart Ring",
        year: 2025,
        cost: 6999,
        img: "/images/ring.jpeg",
        category: "Wearables",
        description: "Smart ring for fitness tracking, sleep monitoring, and notifications."
    },
    {
        id: "Portable SSD",
        year: 2024,
        cost: 4499,
        img: "/images/ssd.jpeg",
        category: "Electronics",
        description: "1TB portable SSD with high-speed data transfer and compact design."
    },
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
        <div className="container my-4">
          <h2 className="text-center mb-4">Products</h2>
          <div className="d-flex justify-content-center gap-3 mb-4 flex-wrap">
            <input
              type="text"
              className="form-control"
              placeholder="Search products..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              style={{maxWidth: '300px'}}
            />
            <select
              className="form-select"
              value={filter}
              onChange={e => setFilter(e.target.value)}
              style={{maxWidth: '200px'}}
            >
              {categories.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>
          
          {filteredProducts.length === 0 ? (
            <div className="alert alert-info text-center" role="alert">
              No products found.
            </div>
          ) : (
            <div className="row row-cols-1 row-cols-md-2 row-cols-lg-3 row-cols-xl-4 g-4">
              {filteredProducts.map((product) => {
                const quantity = cartItems.filter(item => item.id === product.id).length;
                return (
                  <div className="col" key={product.id}>
                    <div className="card h-100 shadow-sm" style={{cursor:'pointer'}} onClick={() => showProductDetails(product)}>
                      <img src={product.img} className="card-img-top" alt={product.id} style={{height: '250px', objectFit: 'cover'}} />
                      <div className="card-body d-flex flex-column">
                        <h5 className="card-title">{product.id}</h5>
                        <p className="card-text fw-bold text-success">₹{product.cost}</p>
                        <div className="mt-auto" onClick={e => e.stopPropagation()}>
                          {quantity === 0 ? (
                            <button className="btn btn-primary w-100" onClick={() => addcart(product)}>
                              Add To Cart
                            </button>
                          ) : (
                            <div className="btn-group w-100" role="group">
                              <button className="btn btn-outline-danger" onClick={() => removecart(product)}>-</button>
                              <button className="btn btn-outline-secondary" disabled>{quantity}</button>
                              <button className="btn btn-outline-success" onClick={() => addcart(product)}>+</button>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Product Details Page */}
      <div className={`page ${activePage === 'pdetails' ? 'active' : ''}`} id="pdetails">
        {selectedProduct && (
          <div className="container my-5">
            <div className="row justify-content-center">
              <div className="col-md-8">
                <div className="card shadow">
                  <div className="row g-0">
                    <div className="col-md-6">
                      <img src={selectedProduct.img} className="img-fluid rounded-start p-3" alt={selectedProduct.id} />
                    </div>
                    <div className="col-md-6">
                      <div className="card-body">
                        <h3 className="card-title">{selectedProduct.id}</h3>
                        <p className="card-text">{selectedProduct.description}</p>
                        <p className="card-text"><small className="text-muted">Category: {selectedProduct.category}</small></p>
                        <p className="card-text"><small className="text-muted">Year: {selectedProduct.year}</small></p>
                        <h4 className="text-success mb-3">₹{selectedProduct.cost}</h4>
                        <button className="btn btn-primary btn-lg w-100" onClick={() => addcart(selectedProduct)}>
                          Add to Cart
                        </button>
                        <button className="btn btn-secondary w-100 mt-2" onClick={() => setActivePage('p')}>
                          Back to Products
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Home Page */}
      <div id="home" className={`page ${activePage === 'home' ? 'active' : ''}`}>
        <div className="body">
          <div className="container">
            <div className="text-center py-5">
              <h1 className="display-3 fw-bold mb-3">Welcome To ShopMaster</h1>
              <p className="lead mb-4">Here You Can Buy Products In Unbeatable Prices</p>
              <button className="btn btn-primary btn-lg px-5" onClick={() => setActivePage('p')}>
                Shop Now
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Login Page */}
      <div id="login" className={`page ${activePage === 'login' ? 'active' : ''}`}>
        <div className="container my-5">
          <div className="row justify-content-center">
            <div className="col-md-6 col-lg-4">
              <div className="card shadow">
                <div className="card-body p-4">
                  <h2 className="card-title text-center mb-4">Login</h2>
                  <form>
                    <div className="mb-3">
                      <label htmlFor="username" className="form-label">Username</label>
                      <input type="text" className="form-control" id="username" name="username" required />
                    </div>
                    <div className="mb-3">
                      <label htmlFor="password" className="form-label">Password</label>
                      <input type="password" className="form-control" id="password" name="password" required />
                    </div>
                    <button type="submit" className="btn btn-primary w-100 mb-3">Login</button>
                    <div className="text-center">
                      <a href="#" className="text-decoration-none">Forgot Password?</a>
                      <span className="mx-2">|</span>
                      <a href="#" className="text-decoration-none">Sign Up</a>
                    </div>
                  </form>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Cart Page */}
      <div id="Cart" className={`page ${activePage === 'Cart' ? 'active' : ''}`}>
        <div className="container my-4">
          <div className="row justify-content-center">
            <div className="col-md-8">
              <div className="card shadow">
                <div className="card-body">
                  <h2 className="card-title mb-4">Your Cart</h2>
                  {cartItems.length === 0 ? (
                    <div className="alert alert-warning" role="alert">
                      Your cart is empty.
                    </div>
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
                          <ul className="list-group mb-3">
                            {groupedCart.map(item => (
                              <li key={item.id} className="list-group-item d-flex justify-content-between align-items-center">
                                <span>{item.id}{item.quantity > 1 ? ` × ${item.quantity}` : ''}</span>
                                <span className="badge bg-success rounded-pill fs-6">₹{item.cost * item.quantity}</span>
                              </li>
                            ))}
                          </ul>
                          <div className="d-flex justify-content-between align-items-center border-top pt-3">
                            <h4 className="mb-0">Total:</h4>
                            <h4 className="text-success mb-0">₹{totalPrice}</h4>
                          </div>
                          <button className="btn btn-primary w-100 mt-3 btn-lg">
                            Proceed to Checkout
                          </button>
                        </>
                      );
                    })()
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Dashboard Page */}
      <div id="dashboard" className={`page ${activePage === 'dashboard' ? 'active' : ''}`}>
        <div className="container my-5">
          <div className="text-center">
            <h2 className="mb-3">Dashboard</h2>
            <p className="lead">Welcome to your dashboard, {user}!</p>
          </div>
        </div>
      </div>
    </>
  );
}

export default App;