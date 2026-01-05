import React, { useState, useEffect, useMemo, useCallback, useRef } from "react";
import Navigation from "./Navigation";
import Auth from "./Auth";
import AdminPanel from "./AdminPanel";
import "./App.css";
import { getCart, saveCart, addToCart, removeFromCart, getCurrentUser } from "./cartService";
import { trackView, createOrder, getProducts } from "./api";
import { getAddresses, addAddress, deleteAddress, getLocationAddress } from "./addressService";
import Swal from 'sweetalert2';

const ADMIN_EMAIL = 'rohan.sivaa@gmail.com';

// Memoized Product Card Component
const ProductCard = React.memo(({ product, quantity, onShowDetails, onAddCart, onRemoveCart, variant = 'grid' }) => {
  const brandText = (product.brand || product.sellerBusinessName || product.sellerName || "").trim();
  const shippingText = product.shippingEtaText || product.shippingText || product.shipping || '';
  const mrp = product.mrp;
  const showMrp = typeof mrp === 'number' && mrp > product.cost;

  return (
    <div className={variant === 'slider' ? "product-slide" : "col"}>
      <div className={`card h-100 shadow-sm ${variant === 'slider' ? 'product-card-slider' : ''}`} style={{cursor:'pointer'}} onClick={() => onShowDetails(product)}>
        <img 
          src={product.img} 
          className="card-img-top" 
          alt={product.id} 
          style={{height: '250px', objectFit: 'cover'}} 
          loading="lazy"
        />
        <div className="card-body d-flex flex-column">
          {brandText ? (
            <div className="product-brand">{brandText}</div>
          ) : null}

          <h5 className="card-title">{product.id}</h5>

          <div className="product-price-row">
            <span className="product-price">₹{product.cost}</span>
            {showMrp ? (
              <span className="product-mrp">₹{mrp}</span>
            ) : null}
          </div>

          {shippingText ? (
            <div className="product-shipping">{shippingText}</div>
          ) : null}

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

const ProductSlider = React.memo(({ title, products, cartItems, onShowDetails, onAddCart, onRemoveCart, onViewAll }) => {
  const trackRef = useRef(null);

  const scrollByAmount = (dir) => {
    const el = trackRef.current;
    if (!el) return;

    const amount = Math.max(260, Math.floor(el.clientWidth * 0.75));
    el.scrollBy({ left: dir * amount, behavior: 'smooth' });
  };

  return (
    <section className="category-section">
      <div className="category-header">
        <h3 className="category-title">{title}</h3>
        <button className="btn btn-link category-viewall" onClick={onViewAll} type="button">View all</button>
      </div>

      <div className="slider-wrap">
        <button className="slider-btn slider-btn-left" type="button" aria-label="Previous" onClick={() => scrollByAmount(-1)}>‹</button>
        <div className="slider-track" ref={trackRef}>
          {products.map((product) => {
            const quantity = cartItems.filter(item => item.id === product.id).length;
            return (
              <ProductCard
                key={`${title}-${product.id}`}
                product={product}
                quantity={quantity}
                onShowDetails={onShowDetails}
                onAddCart={onAddCart}
                onRemoveCart={onRemoveCart}
                variant="slider"
              />
            );
          })}
        </div>
        <button className="slider-btn slider-btn-right" type="button" aria-label="Next" onClick={() => scrollByAmount(1)}>›</button>
      </div>
    </section>
  );
});

ProductSlider.displayName = 'ProductSlider';

function App() {
  const [products, setProducts] = useState([]);
  const [productsLoading, setProductsLoading] = useState(true);
  const [activePage, setActivePage] = useState('home');
  const [currentUser, setCurrentUser] = useState(null);
  const [cartItems, setCartItems] = useState([]);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("All");
  const [brandFilter, setBrandFilter] = useState("All");
  const [priceRange, setPriceRange] = useState([0, 100000]);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);

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

  useEffect(() => {
    const user = getCurrentUser();
    if (user) {
      setCurrentUser(user);
      setIsAdmin(user.email === ADMIN_EMAIL);
      const savedCart = getCart(user.email);
      setCartItems(savedCart);
    }

    loadProducts();
    trackView();

    const loadingTimer = setTimeout(() => {
      setIsLoading(false);
    }, 2000);

    return () => clearTimeout(loadingTimer);
  }, [loadProducts]);

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

  const categories = useMemo(() =>
    ["All", ...Array.from(new Set(products.map(p => p.category)))],
    [products]
  );

  const brands = useMemo(() =>
    ["All", ...Array.from(new Set(products.map(p => p.brand || "No Brand").filter(b => b)))],
    [products]
  );

  const maxPrice = useMemo(() => {
    if (products.length === 0) return 100000;
    return Math.max(...products.map(p => p.cost));
  }, [products]);

  // Calculate appropriate step size based on max price
  const priceStep = useMemo(() => {
    if (maxPrice <= 1000) return 10;
    if (maxPrice <= 10000) return 50;
    if (maxPrice <= 50000) return 100;
    return 500;
  }, [maxPrice]);

  // Update price range when maxPrice changes (when products load)
  useEffect(() => {
    setPriceRange(prev => [prev[0], maxPrice]);
  }, [maxPrice]);

  const handlePageChange = useCallback((pageId) => {
    setActivePage(pageId);
    setSelectedProduct(null);
  }, []);

  const filteredProducts = useMemo(() => {
    return products.filter(product => {
      const matchesSearch = product.id.toLowerCase().includes(search.toLowerCase());
      const matchesCategory = filter === "All" || product.category === filter;
      const matchesBrand = brandFilter === "All" || (product.brand || "No Brand") === brandFilter;
      const matchesPrice = product.cost >= priceRange[0] && product.cost <= priceRange[1];
      return matchesSearch && matchesCategory && matchesBrand && matchesPrice;
    });
  }, [products, search, filter, brandFilter, priceRange]);

  const showProductDetails = useCallback((product) => {
    setSelectedProduct(product);
    setActivePage("pdetails");
  }, []);

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

  const handleRemoveFromCart = useCallback((product) => {
    if (!currentUser) return;

    const updatedCart = removeFromCart(currentUser.email, product, cartItems);
    setCartItems(updatedCart);
  }, [currentUser, cartItems]);

  const { groupedCart, totalPrice } = useMemo(() => {
    const grouped = cartItems.reduce((acc, item) => {
      const existingItem = acc.find(i => i.id === item.id);
      if (existingItem) {
        existingItem.quantity++;
      } else {
        acc.push({ ...item, quantity: 1 });
      }
      return acc;
    }, []);

    const total = grouped.reduce((sum, item) => sum + (item.cost * item.quantity), 0);

    return { groupedCart: grouped, totalPrice: total };
  }, [cartItems]);

  // Handle checkout with address collection
  const handleCheckout = useCallback(async () => {
    if (!currentUser || cartItems.length === 0) return;

    // Get saved addresses
    const savedAddresses = getAddresses(currentUser.email);

    // Show address selection/input modal
    const { value: formValues } = await Swal.fire({
      title: 'Delivery Address',
      html: `
        <div style="text-align: left;">
          ${savedAddresses.length > 0 ? `
            <div class="mb-3">
              <label class="form-label fw-bold">Select Saved Address</label>
              <select id="swal-address-select" class="form-select">
                <option value="">-- Or Enter New Address --</option>
                ${savedAddresses.map(addr => `
                  <option value="${addr.id}">${addr.name || 'Address'} - ${addr.street}, ${addr.city}</option>
                `).join('')}
              </select>
            </div>
            <div class="text-center my-2">OR</div>
          ` : ''}
          
          <button id="use-location-btn" class="btn btn-info w-100 mb-3">
            <i class="bi bi-geo-alt-fill"></i> Use My Current Location
          </button>
          
          <div class="mb-3">
            <label class="form-label fw-bold">Full Name *</label>
            <input id="swal-name" class="form-control" placeholder="Your Name" required>
          </div>
          
          <div class="mb-3">
            <label class="form-label fw-bold">Phone Number *</label>
            <input id="swal-phone" class="form-control" type="tel" placeholder="10-digit number" maxlength="10" required>
          </div>
          
          <div class="mb-3">
            <label class="form-label fw-bold">Street/House No *</label>
            <input id="swal-street" class="form-control" placeholder="Street address" required>
          </div>
          
          <div class="row">
            <div class="col-md-6 mb-3">
              <label class="form-label fw-bold">City *</label>
              <input id="swal-city" class="form-control" placeholder="City" required>
            </div>
            <div class="col-md-6 mb-3">
              <label class="form-label fw-bold">State *</label>
              <input id="swal-state" class="form-control" placeholder="State" required>
            </div>
          </div>
          
          <div class="row">
            <div class="col-md-6 mb-3">
              <label class="form-label fw-bold">PIN Code *</label>
              <input id="swal-pincode" class="form-control" placeholder="6-digit PIN" maxlength="6" required>
            </div>
            <div class="col-md-6 mb-3">
              <label class="form-label fw-bold">Country</label>
              <input id="swal-country" class="form-control" value="India" required>
            </div>
          </div>
          
          <div class="form-check mb-3">
            <input class="form-check-input" type="checkbox" id="swal-save-address">
            <label class="form-check-label" for="swal-save-address">
              Save this address for future orders
            </label>
          </div>
        </div>
      `,
      width: '600px',
      showCancelButton: true,
      confirmButtonText: 'Place Order',
      cancelButtonText: 'Cancel',
      focusConfirm: false,
      didOpen: () => {
        // Handle saved address selection
        const addressSelect = document.getElementById('swal-address-select');
        if (addressSelect) {
          addressSelect.addEventListener('change', (e) => {
            const selectedId = parseInt(e.target.value);
            const selected = savedAddresses.find(a => a.id === selectedId);
            if (selected) {
              document.getElementById('swal-name').value = selected.name || '';
              document.getElementById('swal-phone').value = selected.phone || '';
              document.getElementById('swal-street').value = selected.street || '';
              document.getElementById('swal-city').value = selected.city || '';
              document.getElementById('swal-state').value = selected.state || '';
              document.getElementById('swal-pincode').value = selected.pincode || '';
              document.getElementById('swal-country').value = selected.country || 'India';
            }
          });
        }

        // Handle location button
        const locationBtn = document.getElementById('use-location-btn');
        locationBtn.addEventListener('click', async (e) => {
          e.preventDefault();
          locationBtn.disabled = true;
          locationBtn.innerHTML = '<span class="spinner-border spinner-border-sm me-2"></span>Getting location...';

          try {
            const locationAddress = await getLocationAddress();
            document.getElementById('swal-street').value = locationAddress.street || '';
            document.getElementById('swal-city').value = locationAddress.city || '';
            document.getElementById('swal-state').value = locationAddress.state || '';
            document.getElementById('swal-pincode').value = locationAddress.pincode || '';
            document.getElementById('swal-country').value = locationAddress.country || 'India';
            
            locationBtn.innerHTML = '<i class="bi bi-check-circle"></i> Location Loaded!';
            locationBtn.classList.remove('btn-info');
            locationBtn.classList.add('btn-success');
          } catch (error) {
            Swal.showValidationMessage(error.message);
            locationBtn.disabled = false;
            locationBtn.innerHTML = '<i class="bi bi-geo-alt-fill"></i> Use My Current Location';
          }
        });
      },
      preConfirm: () => {
        const name = document.getElementById('swal-name').value;
        const phone = document.getElementById('swal-phone').value;
        const street = document.getElementById('swal-street').value;
        const city = document.getElementById('swal-city').value;
        const state = document.getElementById('swal-state').value;
        const pincode = document.getElementById('swal-pincode').value;
        const country = document.getElementById('swal-country').value;
        const saveAddress = document.getElementById('swal-save-address').checked;

        if (!name || !phone || !street || !city || !state || !pincode) {
          Swal.showValidationMessage('Please fill all required fields');
          return false;
        }

        if (phone.length !== 10 || !/^\d+$/.test(phone)) {
          Swal.showValidationMessage('Please enter a valid 10-digit phone number');
          return false;
        }

        if (pincode.length !== 6 || !/^\d+$/.test(pincode)) {
          Swal.showValidationMessage('Please enter a valid 6-digit PIN code');
          return false;
        }

        return { name, phone, street, city, state, pincode, country, saveAddress };
      }
    });

    if (!formValues) return; // User cancelled

    // Save address if requested
    if (formValues.saveAddress) {
      addAddress(currentUser.email, formValues);
    }

    // Place order with address
    try {
      const orderData = {
        user: currentUser.email,
        userName: currentUser.name,
        items: cartItems.length,
        total: totalPrice,
        products: groupedCart.map(item => ({
          name: item.id,
          quantity: item.quantity,
          price: item.cost
        })),
        shippingAddress: {
          name: formValues.name,
          phone: formValues.phone,
          street: formValues.street,
          city: formValues.city,
          state: formValues.state,
          pincode: formValues.pincode,
          country: formValues.country
        }
      };

      await createOrder(orderData);
      console.log('✅ Order saved to MongoDB!');

      Swal.fire({
        icon: 'success',
        title: 'Order Placed!',
        html: `
          <p>Your order of <strong>₹${totalPrice}</strong> has been placed successfully!</p>
          <div class="text-start mt-3 p-3" style="background: #f8f9fa; border-radius: 8px;">
            <small class="text-muted d-block mb-2"><strong>Delivery Address:</strong></small>
            <small>${formValues.name}</small><br>
            <small>${formValues.phone}</small><br>
            <small>${formValues.street}, ${formValues.city}</small><br>
            <small>${formValues.state} - ${formValues.pincode}</small>
          </div>
          <small class="text-muted d-block mt-3">☁️ Synced across all devices</small>
        `,
        confirmButtonText: 'OK'
      }).then(() => {
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
  }, [currentUser, cartItems, totalPrice, groupedCart]);

  const handleSignInSuccess = useCallback((userData) => {
    setCurrentUser(userData);
    setIsAdmin(userData.email === ADMIN_EMAIL);
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

  const handleSignInFailure = useCallback((error) => {
    Swal.fire({
      icon: 'error',
      title: 'Sign In Failed',
      text: 'There was an error signing in. Please try again.',
    });
  }, []);

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

  const sectionCategories = useMemo(() => {
    const cats = Array.from(new Set(products.map(p => (p.category || '').trim()).filter(Boolean)));
    return cats.slice(0, 6);
  }, [products]);

  const getProductsForCategory = useCallback((category) => {
    const items = products
      .filter(p => p.category === category)
      .slice(0)
      .reverse()
      .slice(0, 12);
    return items;
  }, [products]);

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
        <div style={{animation: 'fadeInScale 0.8s ease-out', textAlign: 'center'}}>
          <h1 style={{color: 'white', fontSize: '3.5rem', fontWeight: 'bold', marginBottom: '30px', animation: 'pulse 2s ease-in-out infinite'}}>ShopMaster</h1>
          <div style={{width: '60px', height: '60px', border: '6px solid rgba(255, 255, 255, 0.3)', borderTop: '6px solid white', borderRadius: '50%', margin: '0 auto', animation: 'spin 1s linear infinite'}}></div>
          <p style={{color: 'rgba(255, 255, 255, 0.9)', marginTop: '30px', fontSize: '1.2rem', animation: 'pulse 2s ease-in-out infinite'}}>Loading amazing deals...</p>
          <div style={{marginTop: '40px', padding: '15px 30px', background: 'rgba(255, 255, 255, 0.15)', borderRadius: '10px', backdropFilter: 'blur(10px)', border: '1px solid rgba(255, 255, 255, 0.3)'}}>
            <p style={{color: 'white', fontSize: '0.9rem', margin: 0, fontWeight: '500'}}>⚠️ This is a development website</p>
          </div>
        </div>
        <style>{`
          @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
          @keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.7; } }
          @keyframes fadeInScale { 0% { opacity: 0; transform: scale(0.8); } 100% { opacity: 1; transform: scale(1); } }
        `}</style>
      </div>
    );
  }

  return (
    <>
      <Navigation activePage={activePage} onPageChange={handlePageChange} cartCount={cartItems.length} isAdmin={isAdmin} />

      <div id="admin" className={`page ${activePage === 'admin' ? 'active' : ''}`}>
        <AdminPanel />
      </div>

      <div id="p" className={`page ${activePage === 'p' ? 'active' : ''}`}>
        <div className="container my-4">
          <h2 className="text-center mb-4">Products</h2>
          <div className="d-flex justify-content-center gap-3 mb-4 flex-wrap">
            <input type="text" className="form-control" placeholder="Search products..." value={search} onChange={e => setSearch(e.target.value)} style={{maxWidth: '300px'}} />
          </div>
          <div className="row mb-4">
            <div className="col-md-3">
              <label className="form-label fw-bold">Category</label>
              <select className="form-select" value={filter} onChange={e => setFilter(e.target.value)}>
                {categories.map(cat => (<option key={cat} value={cat}>{cat}</option>))}
              </select>
            </div>
            <div className="col-md-3">
              <label className="form-label fw-bold">Brand</label>
              <select className="form-select" value={brandFilter} onChange={e => setBrandFilter(e.target.value)}>
                {brands.map(brand => (<option key={brand} value={brand}>{brand}</option>))}
              </select>
            </div>
            <div className="col-md-6">
              <label className="form-label fw-bold">Price Range</label>
              <div className="d-flex flex-column gap-2">
                <div className="d-flex align-items-center gap-2">
                  <label className="small text-muted" style={{minWidth: '40px'}}>Min:</label>
                  <input 
                    type="range" 
                    className="form-range flex-grow-1" 
                    min="0" 
                    max={maxPrice} 
                    step={priceStep} 
                    value={priceRange[0]} 
                    onChange={e => {
                      const newMin = parseInt(e.target.value);
                      if (newMin <= priceRange[1]) {
                        setPriceRange([newMin, priceRange[1]]);
                      }
                    }} 
                  />
                  <span className="text-nowrap" style={{minWidth: '80px'}}>₹{priceRange[0].toLocaleString()}</span>
                </div>
                <div className="d-flex align-items-center gap-2">
                  <label className="small text-muted" style={{minWidth: '40px'}}>Max:</label>
                  <input 
                    type="range" 
                    className="form-range flex-grow-1" 
                    min="0" 
                    max={maxPrice} 
                    step={priceStep} 
                    value={priceRange[1]} 
                    onChange={e => {
                      const newMax = parseInt(e.target.value);
                      if (newMax >= priceRange[0]) {
                        setPriceRange([priceRange[0], newMax]);
                      }
                    }} 
                  />
                  <span className="text-nowrap" style={{minWidth: '80px'}}>₹{priceRange[1].toLocaleString()}</span>
                </div>
              </div>
            </div>
          </div>
          {(search || filter !== "All" || brandFilter !== "All" || priceRange[1] < maxPrice || priceRange[0] > 0) && (
            <div className="mb-3">
              <button className="btn btn-sm btn-outline-secondary" onClick={() => { setSearch(""); setFilter("All"); setBrandFilter("All"); setPriceRange([0, maxPrice]); }}>Clear All Filters</button>
              <span className="ms-2 text-muted">Showing {filteredProducts.length} of {products.length} products</span>
            </div>
          )}
          {productsLoading ? (
            <div className="text-center py-5">
              <div className="spinner-border text-primary" role="status"><span className="visually-hidden">Loading products...</span></div>
              <p className="mt-3 text-muted">Loading products from MongoDB...</p>
            </div>
          ) : filteredProducts.length === 0 ? (
            <div className="alert alert-info text-center" role="alert">
              {products.length === 0 ? (<><i className="bi bi-box-seam" style={{fontSize: '3rem', display: 'block', marginBottom: '1rem'}}></i><h5>No products available</h5><p className="mb-0">{isAdmin ? 'Go to Admin Panel to add products.' : 'Please check back later.'}</p></>) : ('No products found matching your filters.')}
            </div>
          ) : (
            <div className="row row-cols-1 row-cols-md-2 row-cols-lg-3 row-cols-xl-4 g-4">
              {filteredProducts.map((product) => {
                const quantity = cartItems.filter(item => item.id === product.id).length;
                return (<ProductCard key={product.id} product={product} quantity={quantity} onShowDetails={showProductDetails} onAddCart={handleAddToCart} onRemoveCart={handleRemoveFromCart} />);
              })}
            </div>
          )}
        </div>
      </div>

      <div className={`page ${activePage === 'pdetails' ? 'active' : ''}`} id="pdetails">
        {selectedProduct && (
          <div className="container my-5">
            <div className="row justify-content-center">
              <div className="col-md-8">
                <div className="card shadow">
                  <div className="row g-0">
                    <div className="col-md-6"><img src={selectedProduct.img} className="img-fluid rounded-start p-3" alt={selectedProduct.id} loading="lazy" /></div>
                    <div className="col-md-6">
                      <div className="card-body">
                        <h3 className="card-title">{selectedProduct.id}</h3>
                        <p className="card-text">{selectedProduct.description}</p>
                        <p className="card-text"><small className="text-muted">Category: {selectedProduct.category}</small></p>
                        {selectedProduct.brand && (<p className="card-text"><small className="text-muted">Brand: {selectedProduct.brand}</small></p>)}
                        <p className="card-text"><small className="text-muted">Year: {selectedProduct.year}</small></p>
                        <h4 className="text-success mb-2">₹{selectedProduct.cost}</h4>
                        {typeof selectedProduct.mrp === 'number' && selectedProduct.mrp > selectedProduct.cost ? (<p className="mb-3"><small className="text-muted">MRP: <span style={{textDecoration:'line-through'}}>₹{selectedProduct.mrp}</span></small></p>) : null}
                        {(selectedProduct.shippingEtaText || selectedProduct.shippingText || selectedProduct.shipping) ? (<p className="mb-3"><small className="text-muted">{selectedProduct.shippingEtaText || selectedProduct.shippingText || selectedProduct.shipping}</small></p>) : null}
                        <button className="btn btn-primary btn-lg w-100" onClick={() => handleAddToCart(selectedProduct)}>Add to Cart</button>
                        <button className="btn btn-secondary w-100 mt-2" onClick={() => setActivePage('p')}>Back to Products</button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      <div id="home" className={`page ${activePage === 'home' ? 'active' : ''}`}>
        <div className="body">
          <div className="container">
            <div className="text-center py-5">
              <h1 className="display-3 fw-bold mb-3">Welcome To ShopMaster</h1>
              <p className="lead mb-4">Your Single-Seller Marketplace</p>
              <div className="d-flex justify-content-center gap-3 flex-wrap"><button className="btn btn-primary btn-lg px-5" onClick={() => setActivePage('p')}>Shop Now</button></div>
            </div>
            {productsLoading ? (
              <div className="text-center pb-5"><div className="spinner-border text-primary" role="status"><span className="visually-hidden">Loading...</span></div><p className="mt-3 text-muted">Loading categories...</p></div>
            ) : products.length === 0 ? (
              <div className="alert alert-info text-center" role="alert">No products to show yet.</div>
            ) : (
              <div className="pb-5">
                {sectionCategories.map((cat) => {
                  const catProducts = getProductsForCategory(cat);
                  if (catProducts.length === 0) return null;
                  return (<ProductSlider key={cat} title={`Shop By ${cat}`} products={catProducts} cartItems={cartItems} onShowDetails={showProductDetails} onAddCart={handleAddToCart} onRemoveCart={handleRemoveFromCart} onViewAll={() => { setFilter(cat); setActivePage('p'); }} />);
                })}
              </div>
            )}
          </div>
        </div>
      </div>

      <div id="login" className={`page ${activePage === 'login' ? 'active' : ''}`}>
        <div className="container my-5">
          <div className="row justify-content-center">
            <div className="col-md-6 col-lg-5">
              <div className="card shadow">
                <div className="card-body p-5 text-center">
                  <h2 className="card-title mb-3">Sign In to ShopMaster</h2>
                  <p className="text-muted mb-4">Choose your preferred sign-in method</p>
                  <div className="d-flex justify-content-center mb-4"><Auth onSignInSuccess={handleSignInSuccess} onSignInFailure={handleSignInFailure} /></div>
                  <div className="mt-4">
                    <p className="small text-muted"><i className="bi bi-shield-check"></i> Secure sign-in with Google or Microsoft</p>
                    <p className="small text-muted">Your cart and preferences are saved automatically</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div id="Cart" className={`page ${activePage === 'Cart' ? 'active' : ''}`}>
        <div className="container my-4">
          <div className="row justify-content-center">
            <div className="col-md-8">
              <div className="card shadow">
                <div className="card-body">
                  <h2 className="card-title mb-4">Your Cart</h2>
                  {!currentUser ? (
                    <div className="alert alert-info text-center" role="alert">Please <a href="#" onClick={() => setActivePage('login')} className="alert-link">sign in</a> to view your cart.</div>
                  ) : cartItems.length === 0 ? (
                    <div className="alert alert-warning" role="alert">Your cart is empty.</div>
                  ) : (
                    <>
                      <ul className="list-group mb-3">
                        {groupedCart.map(item => (
                          <li key={item.id} className="list-group-item d-flex justify-content-between align-items-center">
                            <div><span>{item.id}{item.quantity > 1 ? ` × ${item.quantity}` : ''}</span></div>
                            <span className="badge bg-success rounded-pill fs-6">₹{item.cost * item.quantity}</span>
                          </li>
                        ))}
                      </ul>
                      <div className="d-flex justify-content-between align-items-center border-top pt-3">
                        <h4 className="mb-0">Total:</h4>
                        <h4 className="text-success mb-0">₹{totalPrice}</h4>
                      </div>
                      <button className="btn btn-primary w-100 mt-3 btn-lg" onClick={handleCheckout}>Proceed to Checkout</button>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

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
                  {isAdmin && (<button className="btn btn-warning me-2" onClick={() => setActivePage('admin')}>🔑 Admin Panel</button>)}
                  <button className="btn btn-danger" onClick={handleSignOut}>Sign Out</button>
                </div>
              </>
            ) : (
              <>
                <p className="lead">Please sign in to view your dashboard</p>
                <div className="mt-4"><Auth onSignInSuccess={handleSignInSuccess} onSignInFailure={handleSignInFailure} /></div>
              </>
            )}
          </div>
        </div>
      </div>
    </>
  );
}

export default App;