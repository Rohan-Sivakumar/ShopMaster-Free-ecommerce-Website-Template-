import React, { useState, useEffect } from 'react';
import './GoogleAuth.css';

// OAuth Configuration
const GOOGLE_CLIENT_ID = '902043632684-87h6kimr4divhgqhuabu11l8713vc240.apps.googleusercontent.com';

// Microsoft OAuth Configuration
// Note: You'll need to register your app at https://portal.azure.com/
const MICROSOFT_CLIENT_ID = 'YOUR_MICROSOFT_CLIENT_ID'; // Replace with your Microsoft App ID
const MICROSOFT_REDIRECT_URI = window.location.origin; // Your app's URL

const Auth = ({ onSignInSuccess, onSignInFailure }) => {
  const [isSignedIn, setIsSignedIn] = useState(false);
  const [userInfo, setUserInfo] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    // Load Google Sign-In script
    const loadGoogleScript = () => {
      const script = document.createElement('script');
      script.src = 'https://accounts.google.com/gsi/client';
      script.async = true;
      script.defer = true;
      script.onload = initializeGoogleSignIn;
      document.body.appendChild(script);
    };

    loadGoogleScript();

    return () => {
      const script = document.querySelector('script[src="https://accounts.google.com/gsi/client"]');
      if (script) {
        document.body.removeChild(script);
      }
    };
  }, []);

  const initializeGoogleSignIn = () => {
    if (window.google) {
      window.google.accounts.id.initialize({
        client_id: GOOGLE_CLIENT_ID,
        callback: handleGoogleCredentialResponse,
        auto_select: false,
        cancel_on_tap_outside: true,
      });

      window.google.accounts.id.renderButton(
        document.getElementById('googleSignInButton'),
        {
          theme: 'outline',
          size: 'large',
          width: 250,
          text: 'signin_with',
          shape: 'rectangular',
        }
      );
    }
  };

  const handleGoogleCredentialResponse = (response) => {
    setIsLoading(true);
    
    try {
      const userObject = parseJwt(response.credential);
      
      const userData = {
        provider: 'google',
        email: userObject.email,
        name: userObject.name,
        picture: userObject.picture,
        sub: userObject.sub,
        loginTime: new Date().toISOString(),
      };

      setUserInfo(userData);
      setIsSignedIn(true);
      
      sessionStorage.setItem('authUser', JSON.stringify(userData));
      sessionStorage.setItem('authToken', response.credential);
      
      window.dispatchEvent(new Event('userChanged'));
      
      if (onSignInSuccess) {
        onSignInSuccess(userData);
      }
    } catch (error) {
      console.error('Error processing Google sign-in:', error);
      if (onSignInFailure) {
        onSignInFailure(error);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleMicrosoftSignIn = () => {
    setIsLoading(true);
    
    // Microsoft OAuth 2.0 authorization endpoint
    const authUrl = `https://login.microsoftonline.com/common/oauth2/v2.0/authorize`;
    const params = new URLSearchParams({
      client_id: MICROSOFT_CLIENT_ID,
      response_type: 'token id_token',
      redirect_uri: MICROSOFT_REDIRECT_URI,
      scope: 'openid profile email User.Read',
      response_mode: 'fragment',
      state: Math.random().toString(36).substring(7),
      nonce: Math.random().toString(36).substring(7),
    });

    // Redirect to Microsoft login
    window.location.href = `${authUrl}?${params.toString()}`;
  };

  // Handle Microsoft OAuth redirect callback
  useEffect(() => {
    const handleMicrosoftCallback = async () => {
      const hash = window.location.hash.substring(1);
      const params = new URLSearchParams(hash);
      const idToken = params.get('id_token');
      const accessToken = params.get('access_token');

      if (idToken && accessToken) {
        setIsLoading(true);
        
        try {
          // Parse the ID token to get user info
          const userObject = parseJwt(idToken);
          
          const userData = {
            provider: 'microsoft',
            email: userObject.email || userObject.preferred_username,
            name: userObject.name,
            picture: null, // Microsoft doesn't provide picture in ID token
            sub: userObject.sub,
            loginTime: new Date().toISOString(),
          };

          setUserInfo(userData);
          setIsSignedIn(true);
          
          sessionStorage.setItem('authUser', JSON.stringify(userData));
          sessionStorage.setItem('authToken', accessToken);
          
          window.dispatchEvent(new Event('userChanged'));
          
          // Clean up URL
          window.history.replaceState({}, document.title, window.location.pathname);
          
          if (onSignInSuccess) {
            onSignInSuccess(userData);
          }
        } catch (error) {
          console.error('Error processing Microsoft sign-in:', error);
          if (onSignInFailure) {
            onSignInFailure(error);
          }
        } finally {
          setIsLoading(false);
        }
      }
    };

    handleMicrosoftCallback();
  }, []);

  const parseJwt = (token) => {
    try {
      const base64Url = token.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(
        atob(base64)
          .split('')
          .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
          .join('')
      );
      return JSON.parse(jsonPayload);
    } catch (error) {
      console.error('Error parsing JWT:', error);
      return null;
    }
  };

  const handleSignOut = () => {
    if (window.google && userInfo?.provider === 'google') {
      window.google.accounts.id.disableAutoSelect();
    }
    
    setIsSignedIn(false);
    setUserInfo(null);
    
    sessionStorage.removeItem('authUser');
    sessionStorage.removeItem('authToken');
    
    window.dispatchEvent(new Event('userChanged'));
    window.location.reload();
  };

  // Check if user is already signed in
  useEffect(() => {
    const storedUser = sessionStorage.getItem('authUser');
    const storedToken = sessionStorage.getItem('authToken');
    
    if (storedUser && storedToken) {
      try {
        const userData = JSON.parse(storedUser);
        
        const loginTime = new Date(userData.loginTime);
        const currentTime = new Date();
        const timeDiff = (currentTime - loginTime) / (1000 * 60 * 60);
        
        if (timeDiff < 1) {
          setUserInfo(userData);
          setIsSignedIn(true);
        } else {
          sessionStorage.removeItem('authUser');
          sessionStorage.removeItem('authToken');
        }
      } catch (error) {
        console.error('Error loading stored user:', error);
        sessionStorage.removeItem('authUser');
        sessionStorage.removeItem('authToken');
      }
    }
  }, []);

  if (isLoading) {
    return (
      <div className="google-auth-loading">
        <div className="spinner"></div>
        <p>Signing you in...</p>
      </div>
    );
  }

  if (isSignedIn && userInfo) {
    return (
      <div className="google-auth-profile">
        {userInfo.picture && (
          <img src={userInfo.picture} alt="Profile" className="profile-picture" />
        )}
        {!userInfo.picture && (
          <div className="profile-picture" style={{
            backgroundColor: '#667eea',
            color: 'white',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '24px',
            fontWeight: 'bold'
          }}>
            {userInfo.name?.charAt(0).toUpperCase()}
          </div>
        )}
        <div className="profile-info">
          <h3>{userInfo.name}</h3>
          <p>{userInfo.email}</p>
          <small className="text-muted">
            Signed in with {userInfo.provider === 'google' ? 'Google' : 'Microsoft'}
          </small>
        </div>
        <button onClick={handleSignOut} className="sign-out-button">
          Sign Out
        </button>
      </div>
    );
  }

  return (
    <div className="google-auth-container">
      <div id="googleSignInButton"></div>
      
      <div style={{margin: '15px 0', textAlign: 'center', color: '#666'}}>
        <span>or</span>
      </div>
      
      <button
        onClick={handleMicrosoftSignIn}
        style={{
          width: '250px',
          padding: '10px 20px',
          backgroundColor: 'white',
          border: '1px solid #8C8C8C',
          borderRadius: '4px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '10px',
          cursor: 'pointer',
          fontSize: '14px',
          fontWeight: '500',
          transition: 'background-color 0.2s',
        }}
        onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f5f5f5'}
        onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'white'}
      >
        <svg width="21" height="21" viewBox="0 0 21 21" fill="none">
          <rect x="1" y="1" width="9" height="9" fill="#F25022"/>
          <rect x="11" y="1" width="9" height="9" fill="#7FBA00"/>
          <rect x="1" y="11" width="9" height="9" fill="#00A4EF"/>
          <rect x="11" y="11" width="9" height="9" fill="#FFB900"/>
        </svg>
        Sign in with Microsoft
      </button>
      
      <p className="google-auth-disclaimer">
        By signing in, you agree to our Terms of Service and Privacy Policy
      </p>
      <p className="google-auth-security">
        <small>
          🔒 Secure session - automatically expires when you close your browser
        </small>
      </p>
    </div>
  );
};

export default Auth;
