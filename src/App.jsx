import React, { useState, useEffect, useMemo, useCallback } from "react";
import Navigation from "./Navigation";
import Auth from "./Auth";
import AdminPanel from "./AdminPanel";
import SellerRegister from "./SellerRegister";
import "./App.css";
import { getCart, saveCart, addToCart, removeFromCart, getCurrentUser } from "./cartService";
import { trackView, createOrder, getProducts } from "./api";
import Swal from 'sweetalert2';

const ADMIN_EMAIL = 'rohan.sivaa@gmail.com';

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
          {product.sellerBusinessName && (
            <p className="card-text">
              <small className="text-muted">
                <i className="bi bi-shop"></i> Sold by: {product.sellerBusinessName}
              </small>
            </p>
          )}
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
  const [products, setProducts] = useState([]);
  const [productsLoading, setProductsLoading] = useState(true);
  const [activePage, setActivePage] = useState('home');
  const [currentUser, setCurrentUser] = useState(null);
  const [cartItems, setCartItems] = useState([]);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("All");
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);

  // Load products from MongoDB
  const loadProducts = useCallback(async () => {
    try {
      setProductsLoading(true);
      const productsData = await getProducts();
      setProducts(productsData);
      console.log('✅ Products loaded from MongoDB:', productsData.length);
      setProductsLoading(false);
    } catch (error) {
      console.error('Error loading products:', error);
      setProductsLoading(false);
    }
  }, []);

  // Load user and cart on mount + simulate loading
  useEffect(() => {
    const user = getCurrentUser();
    if (user) {
      setCurrentUser(user);
      setIsAdmin(user.email === ADMIN_EMAIL);
      const savedCart = getCart(user.email);
      setCartItems(savedCart);
    }
    
    // Load products from MongoDB
    loadProducts();
    
    // Track page view to MongoDB (with localStorage fallback)
    trackView();
    
    // Simulate loading delay
    const loadingTimer = setTimeout(() => {
      setIsLoading(false);
    }, 2000);

    return () => clearTimeout(loadingTimer);
  }, [loadProducts]);

  // Listen for user changes
  useEffect(() => {
    const handleUserChange = () => {
      const user = getCurrentUser();
      setCurrentUser(user);
      setIsAdmin(user ? user.email === ADMIN_EMAIL : false);
      if (user) {
        const savedCart = getCart(user.email);
        setCartItems(savedCart);
      } else {
        setCartItems([]);
      }
    };

    window.addEventListener('userChanged', handleUserChange);
    return () => window.removeEventListener('userChanged', handleUserChange);
  }, []);

  // Listen for product updates from admin panel
  useEffect(() => {
    const handleProductsUpdate = (event) => {
      console.log('🔄 Products updated event received');
      if (event.detail) {
        setProducts(event.detail);
      } else {
        loadProducts();
      }
    };

    window.addEventListener('productsUpdated', handleProductsUpdate);
    return () => window.removeEventListener('productsUpdated', handleProductsUpdate);
  }, [loadProducts]);

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
        text: 'You need to sign in to add items to your cart',
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

  // Handle checkout - Track order to MongoDB
  const handleCheckout = useCallback(async () => {
    if (!currentUser || cartItems.length === 0) return;

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

    // Save order to MongoDB (with localStorage fallback)
    try {
      const orderData = {
        user: currentUser.email,
        userName: currentUser.name,
        items: cartItems.length,
        total: totalPrice,
        products: groupedCart.map(item => ({
          name: item.id,
          quantity: item.quantity,
          price: item.cost,
          sellerEmail: item.sellerEmail,
          sellerName: item.sellerBusinessName
        }))
      };

      await createOrder(orderData);
      console.log('✅ Order saved to MongoDB!');

      // Show success message
      Swal.fire({
        icon: 'success',
        title: 'Order Placed!',
        html: `Your order of <strong>₹${totalPrice}</strong> has been placed successfully!<br><small class="text-muted">Synced across all devices ☁️</small>`,
        confirmButtonText: 'OK'
      }).then(() => {
        // Clear cart
        setCartItems([]);
        saveCart(currentUser.email, []);
        setActivePage('home');
      });
    } catch (error) {
      console.error('Error saving order:', error);
      Swal.fire({
        icon: 'warning',
        title: 'Order Placed (Local Only)',
        text: `Your order of ₹${totalPrice} has been saved locally. Backend server may be offline.`,
        confirmButtonText: 'OK'
      }).then(() => {
        setCartItems([]);
        saveCart(currentUser.email, []);
        setActivePage('home');
      });
    }
  }, [currentUser, cartItems]);

  // Sign-In success handler
  const handleSignInSuccess = useCallback((userData) => {
    setCurrentUser(userData);
    setIsAdmin(userData.email === ADMIN_EMAIL);
    
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
  }, []);

  // Sign-In failure handler
  const handleSignInFailure = useCallback((error) => {
    Swal.fire({
      icon: 'error',
      title: 'Sign In Failed',
      text: 'There was an error signing in. Please try again.',
    });
  }, []);

  // Handle sign out
  const handleSignOut = useCallback(() => {
    Swal.fire({
      title: 'Sign Out?',
      text: 'Are you sure you want to sign out?',
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: 'Yes, sign out',
      cancelButtonText: 'Cancel'
    }).then((result) => {
      if (result.isConfirmed) {
        sessionStorage.removeItem('authUser');
        sessionStorage.removeItem('authToken');
        
        setCurrentUser(null);
        setCartItems([]);
        setIsAdmin(false);
        
        window.dispatchEvent(new Event('userChanged'));
        
        Swal.fire({
          icon: 'success',
          title: 'Signed Out',
          text: 'You have been signed out successfully',
          timer: 1500,
          showConfirmButton: false
        });
        
        setTimeout(() => {
          setActivePage('home');
        }, 1500);
      }
    });
  }, []);

  // Loading Screen
  if (isLoading) {
    return (
      <div style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        height: '100vh',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 9999
      }}>
        <div style={{
          animation: 'fadeInScale 0.8s ease-out',
          textAlign: 'center'
        }}>
          <h1 style={{
            color: 'white',
            fontSize: '3.5rem',
            fontWeight: 'bold',
            marginBottom: '30px',
            animation: 'pulse 2s ease-in-out infinite'
          }}>ShopMaster</h1>
          
          <div style={{
            width: '60px',
            height: '60px',
            border: '6px solid rgba(255, 255, 255, 0.3)',
            borderTop: '6px solid white',
            borderRadius: '50%',
            margin: '0 auto',
            animation: 'spin 1s linear infinite'
          }}></div>
          
          <p style={{
            color: 'rgba(255, 255, 255, 0.9)',
            marginTop: '30px',
            fontSize: '1.2rem',
            animation: 'pulse 2s ease-in-out infinite'
          }}>Loading amazing deals...</p>
          
          <div style={{
            marginTop: '40px',
            padding: '15px 30px',
            background: 'rgba(255, 255, 255, 0.15)',
            borderRadius: '10px',
            backdropFilter: 'blur(10px)',
            border: '1px solid rgba(255, 255, 255, 0.3)'
          }}>
            <p style={{
              color: 'white',
              fontSize: '0.9rem',
              margin: 0,
              fontWeight: '500'
            }}>⚠️ This is a development website</p>
          </div>
        </div>
        
        <style>{`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
          
          @keyframes pulse {
            0%, 100% { opacity: 1; }
            50% { opacity: 0.7; }
          }
          
          @keyframes fadeInScale {
            0% {
              opacity: 0;
              transform: scale(0.8);
            }
            100% {
              opacity: 1;
              transform: scale(1);
            }
          }
        `}</style>
      </div>
    );
  }

  return (
    <>
      <Navigation activePage={activePage} onPageChange={handlePageChange} cartCount={cartItems.length} isAdmin={isAdmin} />

      {/* Seller Registration Page */}
      <div id="seller-register" className={`page ${activePage === 'seller-register' ? 'active' : ''}`}>
        <SellerRegister onNavigate={handlePageChange} />
      </div>

      {/* Admin/Seller Panel */}
      <div id="admin" className={`page ${activePage === 'admin' ? 'active' : ''}`}>
        <AdminPanel />
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
          
          {productsLoading ? (
            <div className="text-center py-5">
              <div className="spinner-border text-primary" role="status">
                <span className="visually-hidden">Loading products...</span>
              </div>
              <p className="mt-3 text-muted">Loading products from MongoDB...</p>
            </div>
          ) : filteredProducts.length === 0 ? (
            <div className="alert alert-info text-center" role="alert">
              {products.length === 0 ? (
                <>
                  <i className="bi bi-box-seam" style={{fontSize: '3rem', display: 'block', marginBottom: '1rem'}}></i>
                  <h5>No products available</h5>
                  <p className="mb-0">{isAdmin ? 'Go to Seller Dashboard to add products.' : 'Please check back later.'}</p>
                </>
              ) : (
                'No products found matching your search.'
              )}
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
                        {selectedProduct.sellerBusinessName && (
                          <p className="card-text">
                            <small className="text-muted">
                              <i className="bi bi-shop"></i> Sold by: <strong>{selectedProduct.sellerBusinessName}</strong>
                            </small>
                          </p>
                        )}
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

      {/* Home Page */}
      <div id="home" className={`page ${activePage === 'home' ? 'active' : ''}`}>
        <div className="body">
          <div className="container">
            <div className="text-center py-5">
              <h1 className="display-3 fw-bold mb-3">Welcome To ShopMaster</h1>
              <p className="lead mb-4">Multi-Seller Marketplace - Shop from Multiple Sellers</p>
              <div className="d-flex justify-content-center gap-3 flex-wrap">
                <button className="btn btn-primary btn-lg px-5" onClick={() => setActivePage('p')}>
                  Shop Now
                </button>
                {currentUser && (
                  <button className="btn btn-outline-light btn-lg px-5" onClick={() => setActivePage('seller-register')}>
                    Become a Seller
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Login Page */}
      <div id="login" className={`page ${activePage === 'login' ? 'active' : ''}`}>
        <div className="container my-5">
          <div className="row justify-content-center">
            <div className="col-md-6 col-lg-5">
              <div className="card shadow">
                <div className="card-body p-5 text-center">
                  <h2 className="card-title mb-3">Sign In to ShopMaster</h2>
                  <p className="text-muted mb-4">Choose your preferred sign-in method</p>
                  
                  <div className="d-flex justify-content-center mb-4">
                    <Auth 
                      onSignInSuccess={handleSignInSuccess}
                      onSignInFailure={handleSignInFailure}
                    />
                  </div>
                  
                  <div className="mt-4">
                    <p className="small text-muted">
                      <i className="bi bi-shield-check"></i> Secure sign-in with Google or Microsoft
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
                      Please <a href="#" onClick={() => setActivePage('login')} className="alert-link">sign in</a> to view your cart.
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
                                <div>
                                  <span>{item.id}{item.quantity > 1 ? ` × ${item.quantity}` : ''}</span>
                                  {item.sellerBusinessName && (
                                    <div>
                                      <small className="text-muted">
                                        <i className="bi bi-shop"></i> {item.sellerBusinessName}
                                      </small>
                                    </div>
                                  )}
                                </div>
                                <span className="badge bg-success rounded-pill fs-6">₹{item.cost * item.quantity}</span>
                              </li>
                            ))}
                          </ul>
                          <div className="d-flex justify-content-between align-items-center border-top pt-3">
                            <h4 className="mb-0">Total:</h4>
                            <h4 className="text-success mb-0">₹{totalPrice}</h4>
                          </div>
                          <button className="btn btn-primary w-100 mt-3 btn-lg" onClick={handleCheckout}>
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
                  <button className="btn btn-info me-2" onClick={() => setActivePage('seller-register')}>
                    <i className="bi bi-shop"></i> Become a Seller
                  </button>
                  {isAdmin && (
                    <button className="btn btn-warning me-2" onClick={() => setActivePage('admin')}>
                      🔑 Admin Panel
                    </button>
                  )}
                  <button className="btn btn-danger" onClick={handleSignOut}>Sign Out</button>
                </div>
              </>
            ) : (
              <>
                <p className="lead">Please sign in to view your dashboard</p>
                <div className="mt-4">
                  <Auth 
                    onSignInSuccess={handleSignInSuccess}
                    onSignInFailure={handleSignInFailure}
                  />
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </>
  );
}

export default App;