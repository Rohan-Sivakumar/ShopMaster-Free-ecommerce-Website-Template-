import React, { useState, useEffect } from 'react';
import { registerSeller, getSeller } from './api';
import { getCurrentUser } from './cartService';
import Swal from 'sweetalert2';
import './SellerRegister.css';

const SellerRegister = ({ onNavigate }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [existingSeller, setExistingSeller] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    businessName: '',
    phone: '',
    address: ''
  });

  useEffect(() => {
    const loadUser = async () => {
      const user = getCurrentUser();
      if (!user) {
        Swal.fire({
          icon: 'warning',
          title: 'Please Sign In',
          text: 'You need to sign in first to register as a seller',
          confirmButtonText: 'OK'
        }).then(() => {
          onNavigate('login');
        });
        return;
      }

      setCurrentUser(user);

      // Check if already registered
      const seller = await getSeller(user.email);
      if (seller) {
        setExistingSeller(seller);
      }

      setLoading(false);
    };

    loadUser();
  }, [onNavigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!currentUser) {
      Swal.fire({
        icon: 'error',
        title: 'Not Signed In',
        text: 'Please sign in first'
      });
      return;
    }

    // Validation
    if (!formData.businessName || !formData.phone) {
      Swal.fire({
        icon: 'error',
        title: 'Validation Error',
        text: 'Please fill in all required fields'
      });
      return;
    }

    try {
      setSubmitting(true);

      const sellerData = {
        email: currentUser.email,
        name: currentUser.name,
        businessName: formData.businessName,
        phone: formData.phone,
        address: formData.address
      };

      await registerSeller(sellerData);

      Swal.fire({
        icon: 'success',
        title: 'Registration Successful!',
        html: `
          <p>Your seller account has been registered successfully!</p>
          <p class="text-muted">Your account is pending approval. You'll be able to add products once approved by the admin.</p>
        `,
        confirmButtonText: 'Go to Dashboard'
      }).then(() => {
        onNavigate('admin');
      });

      setSubmitting(false);
    } catch (error) {
      setSubmitting(false);
      Swal.fire({
        icon: 'error',
        title: 'Registration Failed',
        text: error.message || 'An error occurred during registration. Please try again.'
      });
    }
  };

  if (loading) {
    return (
      <div className="container my-5 text-center">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  if (existingSeller) {
    return (
      <div className="container my-5">
        <div className="row justify-content-center">
          <div className="col-md-8">
            <div className="card shadow">
              <div className="card-body text-center p-5">
                {existingSeller.isApproved ? (
                  <>
                    <i className="bi bi-check-circle-fill text-success" style={{fontSize: '4rem'}}></i>
                    <h3 className="mt-3">✓ You're Already a Seller!</h3>
                    <p className="text-muted">Your seller account is active and approved.</p>
                    <div className="mt-4">
                      <p><strong>Business Name:</strong> {existingSeller.businessName}</p>
                      <p><strong>Email:</strong> {existingSeller.email}</p>
                      <p><strong>Phone:</strong> {existingSeller.phone}</p>
                      {existingSeller.address && <p><strong>Address:</strong> {existingSeller.address}</p>}
                    </div>
                    <button 
                      className="btn btn-primary btn-lg mt-4"
                      onClick={() => onNavigate('admin')}
                    >
                      Go to Seller Dashboard
                    </button>
                  </>
                ) : (
                  <>
                    <i className="bi bi-clock-history text-warning" style={{fontSize: '4rem'}}></i>
                    <h3 className="mt-3">⏳ Registration Pending</h3>
                    <p className="text-muted">Your seller account is under review. You'll receive approval soon!</p>
                    <div className="mt-4">
                      <p><strong>Business Name:</strong> {existingSeller.businessName}</p>
                      <p><strong>Email:</strong> {existingSeller.email}</p>
                      <p><strong>Phone:</strong> {existingSeller.phone}</p>
                      {existingSeller.address && <p><strong>Address:</strong> {existingSeller.address}</p>}
                      <p className="text-muted mt-3">Registered on: {new Date(existingSeller.createdAt).toLocaleString()}</p>
                    </div>
                    <button 
                      className="btn btn-secondary btn-lg mt-4"
                      onClick={() => onNavigate('home')}
                    >
                      Back to Home
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="seller-register">
      <div className="container my-5">
        <div className="row justify-content-center">
          <div className="col-md-8">
            <div className="card shadow-lg">
              <div className="card-body p-5">
                <div className="text-center mb-4">
                  <i className="bi bi-shop" style={{fontSize: '3rem', color: '#667eea'}}></i>
                  <h2 className="mt-3">Become a Seller</h2>
                  <p className="text-muted">Join our marketplace and start selling your products</p>
                </div>

                <form onSubmit={handleSubmit}>
                  <div className="mb-4">
                    <label className="form-label fw-bold">Your Name</label>
                    <input
                      type="text"
                      className="form-control"
                      value={currentUser?.name || ''}
                      disabled
                    />
                    <small className="text-muted">From your signed-in account</small>
                  </div>

                  <div className="mb-4">
                    <label className="form-label fw-bold">Email Address</label>
                    <input
                      type="email"
                      className="form-control"
                      value={currentUser?.email || ''}
                      disabled
                    />
                    <small className="text-muted">Your seller account email</small>
                  </div>

                  <div className="mb-4">
                    <label className="form-label fw-bold">Business Name *</label>
                    <input
                      type="text"
                      className="form-control"
                      value={formData.businessName}
                      onChange={(e) => setFormData({...formData, businessName: e.target.value})}
                      placeholder="e.g., Tech Electronics Store"
                      required
                    />
                    <small className="text-muted">The name customers will see on your products</small>
                  </div>

                  <div className="mb-4">
                    <label className="form-label fw-bold">Phone Number *</label>
                    <input
                      type="tel"
                      className="form-control"
                      value={formData.phone}
                      onChange={(e) => setFormData({...formData, phone: e.target.value})}
                      placeholder="+91 1234567890"
                      required
                    />
                    <small className="text-muted">For order notifications and support</small>
                  </div>

                  <div className="mb-4">
                    <label className="form-label fw-bold">Business Address (Optional)</label>
                    <textarea
                      className="form-control"
                      value={formData.address}
                      onChange={(e) => setFormData({...formData, address: e.target.value})}
                      placeholder="Street, City, State, PIN Code"
                      rows="3"
                    />
                    <small className="text-muted">Your business location</small>
                  </div>

                  <div className="alert alert-info">
                    <i className="bi bi-info-circle"></i>
                    <strong> Note:</strong> Your seller account will be reviewed by the admin before approval. Once approved, you can start adding and selling products.
                  </div>

                  <button 
                    type="submit" 
                    className="btn btn-primary btn-lg w-100 mt-3"
                    disabled={submitting}
                  >
                    {submitting ? (
                      <>
                        <span className="spinner-border spinner-border-sm me-2"></span>
                        Registering...
                      </>
                    ) : (
                      <>
                        <i className="bi bi-check-circle"></i> Register as Seller
                      </>
                    )}
                  </button>

                  <button 
                    type="button" 
                    className="btn btn-outline-secondary w-100 mt-2"
                    onClick={() => onNavigate('home')}
                  >
                    Cancel
                  </button>
                </form>

                <div className="mt-4 pt-4 border-top">
                  <h5>Benefits of Selling on ShopMaster:</h5>
                  <ul className="list-unstyled mt-3">
                    <li className="mb-2">
                      <i className="bi bi-check-circle-fill text-success me-2"></i>
                      Reach thousands of customers
                    </li>
                    <li className="mb-2">
                      <i className="bi bi-check-circle-fill text-success me-2"></i>
                      Easy product management dashboard
                    </li>
                    <li className="mb-2">
                      <i className="bi bi-check-circle-fill text-success me-2"></i>
                      Real-time order tracking
                    </li>
                    <li className="mb-2">
                      <i className="bi bi-check-circle-fill text-success me-2"></i>
                      Cloud-based inventory sync
                    </li>
                    <li className="mb-2">
                      <i className="bi bi-check-circle-fill text-success me-2"></i>
                      Seller analytics and insights
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SellerRegister;