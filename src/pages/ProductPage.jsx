import React, { useState } from 'react';
import '../styles/ProductPage.css';
import Swal from 'sweetalert2';

const ProductPage = ({ productId }) => {
  const [quantity, setQuantity] = useState(1);
  const [selectedSize, setSelectedSize] = useState('M');
  const [selectedColor, setSelectedColor] = useState('black');

  // Sample product data
  const product = {
    id: productId || 1,
    name: 'Premium Wireless Headphones',
    price: 1299,
    originalPrice: 1999,
    rating: 4.5,
    reviews: 342,
    stock: 15,
    image: './src/assets/headphone.jpeg',
    description:
      'High-quality wireless headphones with noise cancellation, 30-hour battery life, and premium sound quality.',
    features: [
      '✓ Active Noise Cancellation',
      '✓ 30-Hour Battery Life',
      '✓ Premium Sound Quality',
      '✓ Bluetooth 5.0',
      '✓ Foldable Design',
      '✓ Built-in Microphone',
    ],
    sizes: ['S', 'M', 'L', 'XL'],
    colors: [
      { name: 'black', hex: '#000000' },
      { name: 'silver', hex: '#C0C0C0' },
      { name: 'gold', hex: '#FFD700' },
      { name: 'rose', hex: '#F64A8A' },
    ],
    inStock: true,
  };

  const handleAddToCart = () => {
    if user=='anonymous'{
      Swal.fire({
      icon: 'success',
      title: 'Proceeding to Checkout',
      text:'Login to add to cart'
      confirmButtonColor: '#007bff',
    });
    else{
      Swal.fire({
      icon: 'success',
      title: 'Proceeding to Checkout',
      text:'product added to cart'
      confirmButtonColor: '#007bff',
    });
    }
  }
  };



  const discount = Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100);

  return (
    <div className="product-page">
      <div className="product-container">
        {/* Left Section - Product Image */}
        <div className="product-image-section">
          <div className="product-image-wrapper">
            <img
              src={product.image}
              alt={product.name}
              className="product-main-image"
              onError={(e) => {
                e.target.src = 'https://via.placeholder.com/500?text=Product+Image';
              }}
            />
            {discount > 0 && <div className="discount-badge">{discount}% OFF</div>}
            {product.inStock && <div className="stock-badge">In Stock</div>}
          </div>
          <div className="product-thumbnails">
            <img
              src={product.image}
              alt="thumbnail 1"
              className="thumbnail active"
              onError={(e) => (e.target.src = 'https://via.placeholder.com/80?text=Thumb')}
            />
            <img
              src={product.image}
              alt="thumbnail 2"
              className="thumbnail"
              onError={(e) => (e.target.src = 'https://via.placeholder.com/80?text=Thumb')}
            />
            <img
              src={product.image}
              alt="thumbnail 3"
              className="thumbnail"
              onError={(e) => (e.target.src = 'https://via.placeholder.com/80?text=Thumb')}
            />
          </div>
        </div>

        {/* Right Section - Product Details */}
        <div className="product-details-section">
          {/* Title and Rating */}
          <div className="product-header">
            <h1 className="product-title">{product.name}</h1>
            <div className="rating-section">
              <div className="stars">
                {'★'.repeat(Math.floor(product.rating))}
                {product.rating % 1 !== 0 && '½'}
              </div>
              <span className="rating-value">{product.rating}</span>
              <span className="review-count">({product.reviews} reviews)</span>
            </div>
          </div>

          {/* Price Section */}
          <div className="price-section">
            <div className="price-display">
              <span className="current-price">₹{product.price.toLocaleString()}</span>
              <span className="original-price">₹{product.originalPrice.toLocaleString()}</span>
              <span className="discount-percent">{discount}% OFF</span>
            </div>
            <p className="description">{product.description}</p>
          </div>

          {/* Options */}
          <div className="product-options">
            {/* Color Selection */}
            <div className="option-group">
              <label>Color:</label>
              <div className="color-options">
                {product.colors.map((color) => (
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

            {/* Size Selection */}
            <div className="option-group">
              <label>Size:</label>
              <div className="size-options">
                {product.sizes.map((size) => (
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
                  max={product.stock}
                />
                <button
                  className="qty-btn"
                  onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
                >
                  +
                </button>
              </div>
              <small>Only {product.stock} available</small>
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
          <div className="features-section">
            <h3>Key Features:</h3>
            <ul className="features-list">
              {product.features.map((feature, idx) => (
                <li key={idx}>{feature}</li>
              ))}
            </ul>
          </div>

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

      {/* Related Products Section */}
      <div className="related-products">
        <h2>You Might Also Like</h2>
        <div className="products-grid">
          {[1, 2, 3, 4].map((id) => (
            <div key={id} className="product-card">
              <div className="product-card-image">
                <img
                  src={`https://images.unsplash.com/photo-150574${id}28-5e560c06d30e?w=300&q=80`}
                  alt={`Related product ${id}`}
                  onError={(e) => {
                    e.target.src = 'https://via.placeholder.com/300?text=Product';
                  }}
                />
              </div>
              <div className="product-card-info">
                <h4>Related Product {id}</h4>
                <p className="price">₹{(999 + id * 100).toLocaleString()}</p>
                <button className="card-btn">View Details</button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ProductPage;
