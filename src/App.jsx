import React, { useState, useEffect, useMemo, useCallback } from "react";
import Navigation from "./Navigation";
import GoogleAuth from "./GoogleAuth";
import "./App.css";
import { getCart, saveCart, addToCart, removeFromCart, getCurrentUser } from "./cartService";
import Swal from 'sweetalert2';

const initialProducts = [
    {
        id: "LBK1 BORING BAR EXTENSION (LENGTH 60)",
        year: 2025,
        cost: 1464,
        img: "https://cdn.shopify.com/s/files/1/0558/6413/1539/products/LBK1_2_720x.jpg",
        category: "BORING TOOLS",
        description: "LBK1-LBK1-60L boring bar extension with 60mm length for precision boring operations. Ships within 24 hours."
    },
    {
        id: "FINE BORING BAR INSERTS",
        year: 2025,
        cost: 1234,
        img: "https://cdn.shopify.com/s/files/1/0558/6413/1539/products/TPGT080204L_2_720x.jpg",
        category: "INSERTS",
        description: "TPGT080204L-UP15 fine boring bar inserts for precision boring operations. Ships within 24 hours."
    },
    {
        id: "BT40 LOCKING DEVICE TOOL BOY",
        year: 2025,
        cost: 1386,
        img: "https://cdn.shopify.com/s/files/1/0558/6413/1539/products/BT40_LOCKING_720x.jpg",
        category: "TOOL HOLDER",
        description: "BT40 LOCKING DEVICE tool holder for secure tool holding and positioning. Ships within 14 days."
    },
    {
        id: "SC ENDMILL 45HRC ALUMINIUM DIA1*3*D4*50L*3F",
        year: 2025,
        cost: 94,
        img: "https://cdn.shopify.com/s/files/1/0558/6413/1539/products/SC-ENDMILL_720x.jpg",
        category: "SC ENDMILL CUTTER",
        description: "SC endmill 45HRC aluminum DIA1*3*D4*50L*3F for precision milling operations. Ships within 24 hours."
    },
    {
        id: "ROUGH BORING HEAD",
        year: 2025,
        cost: 2365,
        img: "https://cdn.shopify.com/s/files/1/0558/6413/1539/products/TWE2026-C_720x.jpg",
        category: "BORING TOOLS",
        description: "TWE2026-C rough boring head for heavy-duty boring and facing operations. Ships within 24 hours."
    },
    {
        id: "TURNING INSERT CNMG120408-PM UPT35",
        year: 2025,
        cost: 1211,
        img: "https://cdn.shopify.com/s/files/1/0558/6413/1539/products/CNMG120408_720x.jpg",
        category: "INSERTS",
        description: "CNMG120408-PM UPT35 turning insert for precision lathe operations and finishing. Ships within 24 hours."
    },
    {
        id: "TURNING INSERT CCMT09T304-UPT25",
        year: 2025,
        cost: 934,
        img: "https://cdn.shopify.com/s/files/1/0558/6413/1539/products/CCMT09T304_720x.jpg",
        category: "INSERTS",
        description: "CCMT09T304-UPT25 turning insert for steel and cast iron cutting. Ships within 24 hours."
    },
    {
        id: "TURNING INSERT CNMG120404-PM UPT35",
        year: 2025,
        cost: 1211,
        img: "https://cdn.shopify.com/s/files/1/0558/6413/1539/products/CNMG120404_720x.jpg",
        category: "INSERTS",
        description: "CNMG120404-PM UPT35 turning insert for general purpose lathe operations. Ships within 14 days."
    },
    {
        id: "TURNING INSERT TNMG160408-PM UPT35",
        year: 2025,
        cost: 1130,
        img: "https://cdn.shopify.com/s/files/1/0558/6413/1539/products/TNMG160408_720x.jpg",
        category: "INSERTS",
        description: "TNMG160408-PM UPT35 turning insert for medium cutting operations. Ships within 24 hours."
    },
    {
        id: "TURNING INSERT TNMG160404-PM UPT35",
        year: 2025,
        cost: 1130,
        img: "https://cdn.shopify.com/s/files/1/0558/6413/1539/products/TNMG160404_720x.jpg",
        category: "INSERTS",
        description: "TNMG160404-PM UPT35 turning insert for precision finishing operations. Ships within 24 hours."
    },
    {
        id: "TURNING INSERT CCMT09T308-UPT25",
        year: 2025,
        cost: 934,
        img: "https://cdn.shopify.com/s/files/1/0558/6413/1539/products/CCMT09T308_720x.jpg",
        category: "INSERTS",
        description: "CCMT09T308-UPT25 turning insert for heavy-duty steel cutting. Ships within 24 hours."
    },
    {
        id: "SC ENDMILL 45HRC ALUMINIUM DIA4*12*D4*50L*3F",
        year: 2025,
        cost: 94,
        img: "https://cdn.shopify.com/s/files/1/0558/6413/1539/products/SC-ENDMILL_720x.jpg",
        category: "SC ENDMILL CUTTER",
        description: "SC endmill 45HRC aluminum DIA4*12*D4*50L*3F for versatile milling operations. Ships within 24 hours."
    },
    {
        id: "SC ENDMILL 45HRC ALUMINIUM DIA5*15*D5*50L*3F",
        year: 2025,
        cost: 170,
        img: "https://cdn.shopify.com/s/files/1/0558/6413/1539/products/SC-ENDMILL_720x.jpg",
        category: "SC ENDMILL CUTTER",
        description: "SC endmill 45HRC aluminum DIA5*15*D5*50L*3F for heavy-duty milling operations. Ships within 24 hours."
    },
    {
        id: "SC ENDMILL 45HRC ALUMINIUM DIA3*9*D4*50L*3F",
        year: 2025,
        cost: 94,
        img: "https://cdn.shopify.com/s/files/1/0558/6413/1539/products/SC-ENDMILL_720x.jpg",
        category: "SC ENDMILL CUTTER",
        description: "SC endmill 45HRC aluminum DIA3*9*D4*50L*3F for precision cutting operations. Ships within 24 hours."
    },
    {
        id: "SC ENDMILL 45HRC ALUMINIUM DIA2*6*D4*50L*3F",
        year: 2025,
        cost: 94,
        img: "https://cdn.shopify.com/s/files/1/0558/6413/1539/products/SC-ENDMILL_720x.jpg",
        category: "SC ENDMILL CUTTER",
        description: "SC endmill 45HRC aluminum DIA2*6*D4*50L*3F for versatile milling operations. Ships within 24 hours."
    },
    {
        id: "SC ENDMILL 45HRC ALUMINIUM DIA1.5*4.5*D4*50L*3F",
        year: 2025,
        cost: 94,
        img: "https://cdn.shopify.com/s/files/1/0558/6413/1539/products/SC-ENDMILL_720x.jpg",
        category: "SC ENDMILL CUTTER",
        description: "SC endmill 45HRC aluminum DIA1.5*4.5*D4*50L*3F for fine milling operations. Ships within 24 hours."
    },
    {
        id: "BT30 ER COLLET HOLDERS BT30-ER11A-100",
        year: 2025,
        cost: 917,
        img: "https://cdn.shopify.com/s/files/1/0558/6413/1539/products/BT30-ER11A-100_720x.jpg",
        category: "VMC TOOL HOLDER",
        description: "BT30-ER11A-100 ER collet holder for VMC operations with 100mm length. Ships within 24 hours."
    },
    {
        id: "BT30 ER COLLET HOLDERS BT30-ER16A-100",
        year: 2025,
        cost: 917,
        img: "https://cdn.shopify.com/s/files/1/0558/6413/1539/products/BT30-ER16A-100_720x.jpg",
        category: "VMC TOOL HOLDER",
        description: "BT30-ER16A-100 ER collet holder for VMC operations with extended capacity. Ships within 24 hours."
    },
    {
        id: "BT30 ER COLLET HOLDERS BT30-ER20A-70",
        year: 2025,
        cost: 917,
        img: "https://cdn.shopify.com/s/files/1/0558/6413/1539/products/BT30-ER20A-70_720x.jpg",
        category: "VMC TOOL HOLDER",
        description: "BT30-ER20A-70 ER collet holder for VMC with 70mm length. Ships within 24 hours."
    },
    {
        id: "BT30 ER COLLET HOLDERS BT30-ER20A-100",
        year: 2025,
        cost: 917,
        img: "https://cdn.shopify.com/s/files/1/0558/6413/1539/products/BT30-ER20A-100_720x.jpg",
        category: "VMC TOOL HOLDER",
        description: "BT30-ER20A-100 ER collet holder for VMC operations with 100mm length. Ships within 24 hours."
    },
    {
        id: "BT30 ER COLLET HOLDERS BT30-ER11A-70",
        year: 2025,
        cost: 917,
        img: "https://cdn.shopify.com/s/files/1/0558/6413/1539/products/BT30-ER11A-70_720x.jpg",
        category: "VMC TOOL HOLDER",
        description: "BT30-ER11A-70 ER collet holder for VMC with 70mm length. Ships within 24 hours."
    },
    {
        id: "BT30 ER COLLET HOLDERS BT30-ER16A-70",
        year: 2025,
        cost: 917,
        img: "https://cdn.shopify.com/s/files/1/0558/6413/1539/products/BT30-ER16A-70_720x.jpg",
        category: "VMC TOOL HOLDER",
        description: "BT30-ER16A-70 ER collet holder for VMC with 70mm length. Ships within 24 hours."
    },
    {
        id: "SC ISO THREAD MILL RTMS 08080L20 1.5 ISO",
        year: 2025,
        cost: 2911,
        img: "https://cdn.shopify.com/s/files/1/0558/6413/1539/products/RTMS-08080L20_720x.jpg",
        category: "SC THREAD MILL",
        description: "RTMS 08080L20 SC ISO thread mill 1.5 ISO for large diameter threading. Ships within 24 hours."
    },
    {
        id: "SC ISO THREAD MILL RTMS 10100L24 1.75 ISO",
        year: 2025,
        cost: 4152,
        img: "https://cdn.shopify.com/s/files/1/0558/6413/1539/products/RTMS-10100L24_720x.jpg",
        category: "SC THREAD MILL",
        description: "RTMS 10100L24 SC ISO thread mill 1.75 ISO for extra large diameter threads. Ships within 24 hours."
    },
    {
        id: "SC ISO THREAD MILL RTMS 06048L12 1.0 ISO",
        year: 2025,
        cost: 1703,
        img: "https://cdn.shopify.com/s/files/1/0558/6413/1539/products/RTMS-06048L12_720x.jpg",
        category: "SC THREAD MILL",
        description: "RTMS 06048L12 SC ISO thread mill 1.0 ISO for metric thread applications. Ships within 24 hours."
    },
    {
        id: "SC ISO THREAD MILL RTMS 06060L16 1.25 ISO",
        year: 2025,
        cost: 1703,
        img: "https://cdn.shopify.com/s/files/1/0558/6413/1539/products/RTMS-06060L16_720x.jpg",
        category: "SC THREAD MILL",
        description: "RTMS 06060L16 SC ISO thread mill 1.25 ISO for medium diameter threading. Ships within 24 hours."
    },
    {
        id: "SC ISO THREAD MILL RTMS 04027L8 0.6 ISO",
        year: 2025,
        cost: 1303,
        img: "https://cdn.shopify.com/s/files/1/0558/6413/1539/products/RTMS-04027L8_720x.jpg",
        category: "SC THREAD MILL",
        description: "RTMS 04027L8 SC ISO thread mill 0.6 ISO for precision thread cutting. Ships within 14 days."
    },
    {
        id: "SC ISO THREAD MILL RTMS 04015L6 0.4 ISO",
        year: 2025,
        cost: 1303,
        img: "https://cdn.shopify.com/s/files/1/0558/6413/1539/products/RTMS-04015L6_720x.jpg",
        category: "SC THREAD MILL",
        description: "RTMS 04015L6 SC ISO thread mill 0.4 ISO for fine thread applications. Ships within 24 hours."
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
          <h2 className="text-center mb-4">Shop By Category</h2>
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
              <p className="lead mb-4">Industrial Machining Tools at Unbeatable Prices</p>
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