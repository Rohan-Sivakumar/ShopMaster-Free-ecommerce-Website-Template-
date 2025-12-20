import React, { useState } from 'react';
import '../styles/Auth.css';
import Swal from 'sweetalert2';

const LoginPage = ({ setIsLoggedIn, setUserRole }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [loginType, setLoginType] = useState('user'); // 'user' or 'admin'

  const handleLogin = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    // Simulate API call
    setTimeout(() => {
      if (!email || !password) {
        Swal.fire({
          icon: 'error',
          title: 'Validation Error',
          text: 'Please fill in all fields',
          confirmButtonColor: '#3085d6',
        });
        setIsLoading(false);
        return;
      }

      // Demo credentials
      const adminCredentials = { email: 'admin@shop.com', password: 'admin123' };
      const userCredentials = { email: 'user@shop.com', password: 'user123' };

      const correctCreds = loginType === 'admin' ? adminCredentials : userCredentials;

      if (email === correctCreds.email && password === correctCreds.password) {
        localStorage.setItem('userEmail', email);
        localStorage.setItem('userRole', loginType);
        setUserRole(loginType);
        setIsLoggedIn(true);

        Swal.fire({
          icon: 'success',
          title: `Welcome ${loginType === 'admin' ? 'Admin' : 'User'}!`,
          text: `Successfully logged in as ${email}`,
          confirmButtonColor: '#28a745',
        });
      } else {
        Swal.fire({
          icon: 'error',
          title: 'Login Failed',
          text: 'Invalid email or password',
          confirmButtonColor: '#dc3545',
        });
      }
      setIsLoading(false);
    }, 500);
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="auth-header">
          <h1>🛍️ ShopMaster</h1>
          <p>Login to Your Account</p>
        </div>

        <div className="login-type-toggle">
          <button
            className={`toggle-btn ${loginType === 'user' ? 'active' : ''}`}
            onClick={() => setLoginType('user')}
          >
            👤 User
          </button>
          <button
            className={`toggle-btn ${loginType === 'admin' ? 'active' : ''}`}
            onClick={() => setLoginType('admin')}
          >
            ⚙️ Admin
          </button>
        </div>

        <form onSubmit={handleLogin} className="auth-form">
          <div className="form-group">
            <label htmlFor="email">Email Address</label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder={loginType === 'admin' ? 'admin@shop.com' : 'user@shop.com'}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder={loginType === 'admin' ? 'admin123' : 'user123'}
              required
            />
          </div>

          <div className="demo-credentials">
            <p className="demo-label">Demo Credentials:</p>
            {loginType === 'admin' ? (
              <>
                <small>Email: admin@shop.com</small>
                <small>Password: admin123</small>
              </>
            ) : (
              <>
                <small>Email: user@shop.com</small>
                <small>Password: user123</small>
              </>
            )}
          </div>

          <button
            type="submit"
            className="auth-submit-btn"
            disabled={isLoading}
          >
            {isLoading ? 'Logging in...' : 'Login'}
          </button>
        </form>

        <div className="auth-footer">
          <p>Demo App - Use demo credentials above</p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
