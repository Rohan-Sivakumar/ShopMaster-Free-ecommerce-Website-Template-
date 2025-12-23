import React, { useState, useEffect, useMemo, useCallback } from "react";
import Navigation from "./Navigation";
import GoogleAuth from "./GoogleAuth";
import "./App.css";
import { getCart, saveCart, addToCart, removeFromCart, getCurrentUser } from "./cartService";
import Swal from 'sweetalert2';

const initialProducts = [
    {
        id: "LBK1 Boring Bar Extension",
        year: 2025,
        cost: 1464,
        img: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop",
        category: "Boring Tools",
        description: "LBK1 boring bar extension with 60mm length for precision boring operations."
    },
    {
        id: "Fine Boring Bar Inserts",
        year: 2025,
        cost: 1234,
        img: "https://images.unsplash.com/photo-1581092918056-0c4c3acd3789?w=400&h=400&fit=crop",
        category: "Inserts",
        description: "TPGT080204L-UP15 fine boring bar inserts for precision finishing operations."
    },
    {
        id: "BT40 Locking Device",
        year: 2025,
        cost: 1386,
        img: "https://images.unsplash.com/photo-1565043666747-69f6646db940?w=400&h=400&fit=crop",
        category: "Tool Holders",
        description: "BT40 locking device tool boy for secure tool holding and positioning."
    },
    {
        id: "SC Endmill 45HRC",
        year: 2025,
        cost: 94,
        img: "https://images.unsplash.com/photo-1513694203232-fe5acdc3fb15?w=400&h=400&fit=crop",
        category: "End Mills",
        description: "SC endmill 45HRC aluminum cutting tool Dia1*3*D4*50L*3F for CNC operations."
    },
    {
        id: "Rough Boring Head",
        year: 2025,
        cost: 2365,
        img: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=400&h=400&fit=crop",
        category: "Boring Tools",
        description: "TWE2026-C rough boring head for heavy-duty boring and facing operations."
    },
    {
        id: "CNMG Turning Insert",
        year: 2025,
        cost: 1211,
        img: "https://images.unsplash.com/photo-1581092949020-9f2f036e4db5?w=400&h=400&fit=crop",
        category: "Inserts",
        description: "CNMG120408-PM UPT35 turning insert for precision lathe operations and finishing."
    },
    {
        id: "CCMT Turning Insert",
        year: 2025,
        cost: 934,
        img: "https://images.unsplash.com/photo-1581092162392-8c6d87de0d6d?w=400&h=400&fit=crop",
        category: "Inserts",
        description: "CCMT09T304-UPT25 turning insert for steel and cast iron cutting."
    },
    {
        id: "TNMG Turning Insert Medium",
        year: 2025,
        cost: 1130,
        img: "https://images.unsplash.com/photo-1581092916550-e323be2ae537?w=400&h=400&fit=crop",
        category: "Inserts",
        description: "TNMG160408-PM UPT35 medium turning insert for general purpose machining."
    },
    {
        id: "SC Endmill Aluminum Large",
        year: 2025,
        cost: 94,
        img: "https://images.unsplash.com/photo-1581092921274-35c56e76ed44?w=400&h=400&fit=crop",
        category: "End Mills",
        description: "SC endmill 45HRC aluminum Dia4*12*D4*50L*3F for high-speed cutting operations."
    },
    {
        id: "BT30 ER Collet Holder",
        year: 2025,
        cost: 917,
        img: "https://images.unsplash.com/photo-1581092952906-bf84d6372b3d?w=400&h=400&fit=crop",
        category: "Tool Holders",
        description: "BT30-ER11A-100 ER collet holder for VMC operations with 100mm length."
    },
    {
        id: "SC ISO Thread Mill Small",
        year: 2025,
        cost: 1303,
        img: "https://images.unsplash.com/photo-1581092934975-be2f3117e4c6?w=400&h=400&fit=crop",
        category: "Thread Mills",
        description: "RTMS 04027L8 SC ISO thread mill 0.6 ISO for precision thread cutting."
    },
    {
        id: "SC ISO Thread Mill Medium",
        year: 2025,
        cost: 1703,
        img: "https://images.unsplash.com/photo-1581092162245-8ca2bcba21f1?w=400&h=400&fit=crop",
        category: "Thread Mills",
        description: "RTMS 06048L12 SC ISO thread mill 1.0 ISO for metric thread applications."
    },
    {
        id: "SC ISO Thread Mill Large",
        year: 2025,
        cost: 2911,
        img: "https://images.unsplash.com/photo-1581092165334-a9d8a2d36f6d?w=400&h=400&fit=crop",
        category: "Thread Mills",
        description: "RTMS 08080L20 SC ISO thread mill 1.5 ISO for large diameter threading."
    },
    {
        id: "SC Endmill Medium",
        year: 2025,
        cost: 94,
        img: "https://images.unsplash.com/photo-1581092916550-e323be2ae537?w=400&h=400&fit=crop",
        category: "End Mills",
        description: "SC endmill 45HRC aluminum Dia2*6*D4*50L*3F for versatile milling operations."
    },
    {
        id: "BT30 ER16 Collet Holder",
        year: 2025,
        cost: 917,
        img: "https://images.unsplash.com/photo-1581092952906-bf84d6372b3d?w=400&h=400&fit=crop",
        category: "Tool Holders",
        description: "BT30-ER16A-100 ER collet holder for VMC with extended holding capacity."
    },
    {
        id: "TNMG Turning Insert Finish",
        year: 2025,
        cost: 1130,
        img: "https://images.unsplash.com/photo-1581092146274-40eb08e78f54?w=400&h=400&fit=crop",
        category: "Inserts",
        description: "TNMG160404-PM UPT35 finishing turning insert for smooth surface finishes."
    },
    {
        id: "SC Endmill Large Dia",
        year: 2025,
        cost: 170,
        img: "https://images.unsplash.com/photo-1581092162245-8ca2bcba21f1?w=400&h=400&fit=crop",
        category: "End Mills",
        description: "SC endmill 45HRC aluminum Dia5*15*D5*50L*3F for heavy-duty milling."
    },
    {
        id: "SC ISO Thread Mill Large Dia",
        year: 2025,
        cost: 4152,
        img: "https://images.unsplash.com/photo-1581092934975-be2f3117e4c6?w=400&h=400&fit=crop",
        category: "Thread Mills",
        description: "RTMS 10100L24 SC ISO thread mill 1.75 ISO for large diameter threads."
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

      {/* Product Page */}
      <div id="p" className={`page ${activePage === 'p' ? 'active' : ''}`}>
        <div className="container my-4">
          <h2 className="text-center mb-4">Industrial Tools & Machining Products</h2>
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

      {/* Home Page */}
      <div id="home" className={`page ${activePage === 'home' ? 'active' : ''}`}>
        <div className="body">
          <div className="container">
            <div className="text-center py-5">
              <h1 className="display-3 fw-bold mb-3">Welcome To ShopMaster</h1>
              <p className="lead mb-4">Industrial Tools & Machining Products at Unbeatable Prices</p>
              <button className="btn btn-primary btn-lg px-5" onClick={() => setActivePage('p')}>
                Shop Now
              </button>
            </div>
          </div>
        </div>
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