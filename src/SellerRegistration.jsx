import React, { useState, useEffect } from 'react';
import { registerSeller, getSeller } from './api';
import { getCurrentUser } from './cartService';
import Swal from 'sweetalert2';

const SellerRegistration = () => {
  const [currentUser, setCurrentUser] = useState(null);
  const [seller, setSeller] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    businessName: '',
    phone: '',
    address: ''
  });

  useEffect(() => {
    const user = getCurrentUser();
    setCurrentUser(user);

    if (user) {
      // Check if already registered
      getSeller(user.email).then(sellerData => {
        setSeller(sellerData);
        setLoading(false);
      }).catch(() => {
        setLoading(false);
      });
    } else {
      setLoading(false);
    }
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!currentUser) {
      Swal.fire({
        icon: 'error',
        title: 'Not Signed In',
        text: 'Please sign in to register as a seller'
      });
      return;
    }

    if (!formData.businessName.trim()) {
      Swal.fire({
        icon: 'error',
        title: 'Validation Error',
        text: 'Business name is required'
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
          <p><strong>Business Name:</strong> ${formData.businessName}</p>
          <p class="text-muted">Your account is pending approval. You'll be able to add products once approved by the admin.</p>
        `,
        confirmButtonText: 'Go to Dashboard'
      }).then(() => {
        window.location.href = '#/admin';
      });

      setSubmitting(false);
    } catch (error) {
      setSubmitting(false);
      Swal.fire({
        icon: 'error',
        title: 'Registration Failed',
        text: error.message || 'Failed to register. Please try again.'
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

  if (!currentUser) {
    return (
      <div className="container my-5">
        <div className="alert alert-warning text-center">
          <h4>🔒 Sign In Required</h4>
          <p>You need to sign in first to register as a seller.</p>
          <button className="btn btn-primary mt-3" onClick={() => window.location.href = '#/login'}>
            Sign In
          </button>
        </div>
      </div>
    );
  }

  if (seller) {
    return (
      <div className="container my-5">
        <div className="alert alert-info text-center">
          <h4>✅ Already Registered</h4>
          <p>You're already registered as a seller!</p>
          <div className="mt-3">
            <p><strong>Business Name:</strong> {seller.businessName}</p>
            <p><strong>Status:</strong> {seller.isApproved ? (
              <span className="badge bg-success">✓ Approved</span>
            ) : (
              <span className="badge bg-warning">⏳ Pending Approval</span>
            )}</p>
          </div>
          <button className="btn btn-primary mt-3" onClick={() => window.location.href = '#/admin'}>
            Go to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="container my-5">
      <div className="row justify-content-center">
        <div className="col-md-8 col-lg-6">
          <div className="card shadow">
            <div className="card-body p-5">
              <div className="text-center mb-4">
                <i className="bi bi-shop" style={{fontSize: '3rem', color: '#667eea'}}></i>
                <h2 className="mt-3">Register as Seller</h2>
                <p className="text-muted">Start selling on ShopMaster</p>
              </div>

              <div className="alert alert-info mb-4">
                <strong>📝 Registration Info:</strong>
                <ul className="mb-0 mt-2">
                  <li>Your account will be reviewed by admin</li>
                  <li>You can add products after approval</li>
                  <li>Manage your own inventory and orders</li>
                </ul>
              </div>

              <form onSubmit={handleSubmit}>
                <div className="mb-3">
                  <label className="form-label">Your Name</label>
                  <input
                    type="text"
                    className="form-control"
                    value={currentUser.name}
                    disabled
                  />
                </div>

                <div className="mb-3">
                  <label className="form-label">Email Address</label>
                  <input
                    type="email"
                    className="form-control"
                    value={currentUser.email}
                    disabled
                  />
                </div>

                <div className="mb-3">
                  <label className="form-label">Business Name *</label>
                  <input
                    type="text"
                    className="form-control"
                    value={formData.businessName}
                    onChange={(e) => setFormData({...formData, businessName: e.target.value})}
                    placeholder="e.g., Rohan's Electronics"
                    required
                  />
                  <small className="text-muted">This will be displayed on your products</small>
                </div>

                <div className="mb-3">
                  <label className="form-label">Phone Number (Optional)</label>
                  <input
                    type="tel"
                    className="form-control"
                    value={formData.phone}
                    onChange={(e) => setFormData({...formData, phone: e.target.value})}
                    placeholder="+91 XXXXX XXXXX"
                  />
                </div>

                <div className="mb-3">
                  <label className="form-label">Business Address (Optional)</label>
                  <textarea
                    className="form-control"
                    value={formData.address}
                    onChange={(e) => setFormData({...formData, address: e.target.value})}
                    placeholder="Enter your business address"
                    rows="3"
                  />
                </div>

                <button 
                  type="submit" 
                  className="btn btn-primary w-100 btn-lg"
                  disabled={submitting}
                >
                  {submitting ? (
                    <>
                      <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                      Registering...
                    </>
                  ) : (
                    <>
                      <i className="bi bi-check-circle"></i> Register as Seller
                    </>
                  )}
                </button>

                <div className="text-center mt-3">
                  <button 
                    type="button" 
                    className="btn btn-link"
                    onClick={() => window.location.href = '#/home'}
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SellerRegistration;