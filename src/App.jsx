export default App;
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

