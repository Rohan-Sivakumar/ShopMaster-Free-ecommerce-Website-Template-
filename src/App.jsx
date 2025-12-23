import React, { useState, useEffect, useMemo, useCallback } from "react";
import Navigation from "./Navigation";
import GoogleAuth from "./GoogleAuth";
import "./App.css";
import { getCart, saveCart, addToCart, removeFromCart, getCurrentUser } from "./cartService";
import Swal from 'sweetalert2';

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
];

// Memoized Product Card Component
const ProductCard = React.memo(({ product, quantity, onShowDetails, onAddCart, onRemoveCart }) => {
  return (
    <div className="col">
      <div className="card h-100 shadow-sm" style={{cursor:'pointer'}} onClick={() => onShowDetails(product)}>
        <img 
          src={product.img} 
          className="card-img-top" 
          alt={product.id} 
          style={{height: '250px', objectFit: 'cover'}} 
          loading="lazy"
        />
        <div className="card-body d-flex flex-column">
          <h5 className="card-title">{product.id}</h5>
          <p className="card-text fw-bold text-success">₹{product.cost}</p>
          <div className="mt-auto" onClick={e => e.stopPropagation()}>
            {quantity === 0 ? (
              <button className="btn btn-primary w-100" onClick={() => onAddCart(product)}>
                Add To Cart
              </button>
            ) : (
              <div className="btn-group w-100" role="group">
                <button className="btn btn-outline-danger" onClick={() => onRemoveCart(product)}>-</button>
                <button className="btn btn-outline-secondary" disabled>{quantity}</button>
                <button className="btn btn-outline-success" onClick={() => onAddCart(product)}>+</button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
});

ProductCard.displayName = 'ProductCard';

function App() {
  const [products] = useState(initialProducts);
  const [activePage, setActivePage] = useState('home');
  const [currentUser, setCurrentUser] = useState(null);
  const [cartItems, setCartItems] = useState([]);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("All");
  const [selectedProduct, setSelectedProduct] = useState(null);

  // Load user and cart on mount
  useEffect(() => {
    const user = getCurrentUser();
    if (user) {
      setCurrentUser(user);
      const savedCart = getCart(user.email);
      setCartItems(savedCart);
    }
  }, []);

  // Memoize categories
  const categories = useMemo(() => 
    ["All", ...Array.from(new Set(products.map(p => p.category)))],
    [products]
  );

  const handlePageChange = useCallback((pageId) => {
    setActivePage(pageId);
    setSelectedProduct(null);
  }, []);

  // Memoize filtered products
  const filteredProducts = useMemo(() => {
    return products.filter(product => {
      const matchesSearch = product.id.toLowerCase().includes(search.toLowerCase());
      const matchesFilter = filter === "All" || product.category === filter;
      return matchesSearch && matchesFilter;
    });
  }, [products, search, filter]);

  const showProductDetails = useCallback((product) => {
    setSelectedProduct(product);
    setActivePage("pdetails");
  }, []);

  // Handle add to cart
  const handleAddToCart = useCallback((product) => {
    if (!currentUser) {
      Swal.fire({
        icon: 'warning',
        title: 'Please Sign In',
        text: 'You need to sign in with Google to add items to your cart',
        confirmButtonText: 'Sign In',
      }).then((result) => {
        if (result.isConfirmed) {
          setActivePage('login');
        }
      });
      return;
    }

    const updatedCart = addToCart(currentUser.email, product, cartItems);
    setCartItems(updatedCart);
    
    Swal.fire({
      icon: 'success',
      title: 'Added to Cart!',
      text: `${product.id} added to your cart`,
      timer: 1500,
      showConfirmButton: false,
      toast: true,
      position: 'top-end'
    });
  }, [currentUser, cartItems]);

  // Handle remove from cart
  const handleRemoveFromCart = useCallback((product) => {
    if (!currentUser) return;

    const updatedCart = removeFromCart(currentUser.email, product, cartItems);
    setCartItems(updatedCart);
  }, [currentUser, cartItems]);

  // Google Sign-In success handler
  const handleGoogleSignInSuccess = useCallback((userData) => {
    setCurrentUser(userData);
    
    // Load user's cart
    const savedCart = getCart(userData.email);
    setCartItems(savedCart);
    
    Swal.fire({
      icon: 'success',
      title: 'Welcome!',
      text: `Successfully signed in as ${userData.name}`,
      timer: 2000,
      showConfirmButton: false
    });
    
    setTimeout(() => {
      setActivePage('dashboard');
    }, 2000);
  }, []);

  // Google Sign-In failure handler
  const handleGoogleSignInFailure = useCallback((error) => {
    Swal.fire({
      icon: 'error',
      title: 'Sign In Failed',
      text: 'There was an error signing in with Google. Please try again.',
    });
  }, []);

  // Handle sign out
  const handleSignOut = useCallback(() => {
    setCurrentUser(null);
    setCartItems([]);
    setActivePage('home');
  }, []);

  return (
    <>
      <Navigation activePage={activePage} onPageChange={handlePageChange} cartCount={cartItems.length} />

      {/* Home Page - Professional Bootstrap Landing Page */}
      <div id="home" className={`page ${activePage === 'home' ? 'active' : ''}`}>
        {/* Hero Section */}
        <section style={{
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          color: 'white',
          padding: '100px 20px',
          textAlign: 'center'
        }}>
          <div className="container">
            <h1 className="display-3 fw-bold mb-4">Welcome to ShopMaster</h1>
            <p className="lead mb-5">Discover premium electronics, wearables, and accessories at unbeatable prices</p>
            <button 
              className="btn btn-light btn-lg px-5 me-3" 
              onClick={() => setActivePage('p')}
              style={{fontWeight: 'bold'}}
            >
              Shop Now
            </button>
            {!currentUser && (
              <button 
                className="btn btn-outline-light btn-lg px-5"
                onClick={() => setActivePage('login')}
                style={{fontWeight: 'bold'}}
              >
                Sign In
              </button>
            )}
          </div>
        </section>

        {/* Features Section */}
        <section style={{padding: '80px 20px', backgroundColor: '#f8f9fa'}}>
          <div className="container">
            <h2 className="text-center mb-5 fw-bold">Why Shop With Us?</h2>
            <div className="row g-4">
              <div className="col-md-4">
                <div className="text-center">
                  <div style={{
                    width: '80px',
                    height: '80px',
                    backgroundColor: '#667eea',
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    margin: '0 auto 20px',
                    color: 'white',
                    fontSize: '40px'
                  }}>🚚</div>
                  <h4>Fast Shipping</h4>
                  <p>Ships within 24 hours for most products</p>
                </div>
              </div>
              <div className="col-md-4">
                <div className="text-center">
                  <div style={{
                    width: '80px',
                    height: '80px',
                    backgroundColor: '#764ba2',
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    margin: '0 auto 20px',
                    color: 'white',
                    fontSize: '40px'
                  }}>💰</div>
                  <h4>Best Prices</h4>
                  <p>Unbeatable prices on premium products</p>
                </div>
              </div>
              <div className="col-md-4">
                <div className="text-center">
                  <div style={{
                    width: '80px',
                    height: '80px',
                    backgroundColor: '#667eea',
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    margin: '0 auto 20px',
                    color: 'white',
                    fontSize: '40px'
                  }}>🔒</div>
                  <h4>Secure Payment</h4>
                  <p>Google Sign-In for safe and secure transactions</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Categories Section */}
        <section style={{padding: '80px 20px'}}>
          <div className="container">
            <h2 className="text-center mb-5 fw-bold">Shop By Category</h2>
            <div className="row g-4">
              <div className="col-md-4">
                <div 
                  className="card shadow-lg" 
                  style={{cursor: 'pointer', transition: 'transform 0.3s', height: '100%'}}
                  onClick={() => {
                    setFilter('Electronics');
                    setActivePage('p');
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-10px)'}
                  onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
                >
                  <div style={{
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    color: 'white',
                    padding: '50px 20px',
                    textAlign: 'center',
                    fontSize: '60px'
                  }}>📱</div>
                  <div className="card-body text-center">
                    <h5 className="card-title">Electronics</h5>
                    <p className="card-text">Premium tech gadgets and devices</p>
                  </div>
                </div>
              </div>
              <div className="col-md-4">
                <div 
                  className="card shadow-lg" 
                  style={{cursor: 'pointer', transition: 'transform 0.3s', height: '100%'}}
                  onClick={() => {
                    setFilter('Wearables');
                    setActivePage('p');
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-10px)'}
                  onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
                >
                  <div style={{
                    background: 'linear-gradient(135deg, #764ba2 0%, #667eea 100%)',
                    color: 'white',
                    padding: '50px 20px',
                    textAlign: 'center',
                    fontSize: '60px'
                  }}>⌚</div>
                  <div className="card-body text-center">
                    <h5 className="card-title">Wearables</h5>
                    <p className="card-text">Smartwatches and fitness trackers</p>
                  </div>
                </div>
              </div>
              <div className="col-md-4">
                <div 
                  className="card shadow-lg" 
                  style={{cursor: 'pointer', transition: 'transform 0.3s', height: '100%'}}
                  onClick={() => {
                    setFilter('Accessories');
                    setActivePage('p');
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-10px)'}
                  onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
                >
                  <div style={{
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    color: 'white',
                    padding: '50px 20px',
                    textAlign: 'center',
                    fontSize: '60px'
                  }}>🎒</div>
                  <div className="card-body text-center">
                    <h5 className="card-title">Accessories</h5>
                    <p className="card-text">Cases, cables, and more</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section style={{
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          color: 'white',
          padding: '60px 20px',
          textAlign: 'center'
        }}>
          <div className="container">
            <h2 className="fw-bold mb-4">Ready to Shop?</h2>
            <p className="lead mb-4">Browse our collection of premium products at unbeatable prices</p>
            <button 
              className="btn btn-light btn-lg px-5"
              onClick={() => setActivePage('p')}
              style={{fontWeight: 'bold'}}
            >
              Browse Products
            </button>
          </div>
        </section>
      </div>

      {/* Product Page */}
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
                  <ProductCard
                    key={product.id}
                    product={product}
                    quantity={quantity}
                    onShowDetails={showProductDetails}
                    onAddCart={handleAddToCart}
                    onRemoveCart={handleRemoveFromCart}
                  />
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
                      <img src={selectedProduct.img} className="img-fluid rounded-start p-3" alt={selectedProduct.id} loading="lazy" />
                    </div>
                    <div className="col-md-6">
                      <div className="card-body">
                        <h3 className="card-title">{selectedProduct.id}</h3>
                        <p className="card-text">{selectedProduct.description}</p>
                        <p className="card-text"><small className="text-muted">Category: {selectedProduct.category}</small></p>
                        <p className="card-text"><small className="text-muted">Year: {selectedProduct.year}</small></p>
                        <h4 className="text-success mb-3">₹{selectedProduct.cost}</h4>
                        <button className="btn btn-primary btn-lg w-100" onClick={() => handleAddToCart(selectedProduct)}>
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

      {/* Login Page - Google Only */}
      <div id="login" className={`page ${activePage === 'login' ? 'active' : ''}`}>
        <div className="container my-5">
          <div className="row justify-content-center">
            <div className="col-md-6 col-lg-5">
              <div className="card shadow">
                <div className="card-body p-5 text-center">
                  <h2 className="card-title mb-3">Sign In to ShopMaster</h2>
                  <p className="text-muted mb-4">Sign in with your Google account to start shopping</p>
                  
                  {/* Google Sign-In Only */}
                  <div className="d-flex justify-content-center mb-4">
                    <GoogleAuth 
                      onSignInSuccess={handleGoogleSignInSuccess}
                      onSignInFailure={handleGoogleSignInFailure}
                    />
                  </div>
                  
                  <div className="mt-4">
                    <p className="small text-muted">
                      <i className="bi bi-shield-check"></i> Secure sign-in with Google
                    </p>
                    <p className="small text-muted">
                      Your cart and preferences are saved automatically
                    </p>
                  </div>
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
                  {!currentUser ? (
                    <div className="alert alert-info text-center" role="alert">
                      Please <a href="#" onClick={() => setActivePage('login')} className="alert-link">sign in with Google</a> to view your cart.
                    </div>
                  ) : cartItems.length === 0 ? (
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
            {currentUser ? (
              <>
                <p className="lead">Welcome, {currentUser.name}!</p>
                <p className="text-muted">{currentUser.email}</p>
                <div className="mt-4">
                  <p>Cart Items: <strong>{cartItems.length}</strong></p>
                  <button className="btn btn-primary me-2" onClick={() => setActivePage('p')}>Shop Now</button>
                  <button className="btn btn-secondary me-2" onClick={() => setActivePage('Cart')}>View Cart</button>
                </div>
              </>
            ) : (
              <p className="lead">Please sign in to view your dashboard</p>
            )}
            <div className="mt-4">
              <GoogleAuth 
                onSignInSuccess={handleGoogleSignInSuccess}
                onSignInFailure={handleGoogleSignInFailure}
              />
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default App;