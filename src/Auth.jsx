import React, { useState, useEffect, useRef } from 'react';
import './GoogleAuth.css';

// OAuth Configuration
const GOOGLE_CLIENT_ID = '902043632684-87h6kimr4divhgqhuabu11l8713vc240.apps.googleusercontent.com';

// Microsoft OAuth Configuration
const MICROSOFT_CLIENT_ID = '0ad4fe15-57b7-4e64-8189-2840b19c05f5';
const MICROSOFT_REDIRECT_URI = window.location.origin;

const Auth = ({ onSignInSuccess, onSignInFailure }) => {
  const [isSignedIn, setIsSignedIn] = useState(false);
  const [userInfo, setUserInfo] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const hasProcessedCallback = useRef(false);

  useEffect(() => {
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
    }
  };

  const handleGoogleSignInClick = () => {
    setIsGoogleLoading(true);
    setIsLoading(true);
    
    if (window.google) {
      window.google.accounts.id.prompt((notification) => {
        if (notification.isNotDisplayed() || notification.isSkippedMoment()) {
          setIsGoogleLoading(false);
          setIsLoading(false);
        }
      });
    }
  };

  const handleGoogleCredentialResponse = (response) => {
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
      setIsGoogleLoading(false);
      setIsLoading(false);
    }
  };

  // Generate PKCE code verifier and challenge
  const generateCodeVerifier = () => {
    const array = new Uint8Array(32);
    crypto.getRandomValues(array);
    return base64URLEncode(array);
  };

  const base64URLEncode = (buffer) => {
    return btoa(String.fromCharCode.apply(null, buffer))
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=/g, '');
  };

  const sha256 = async (plain) => {
    const encoder = new TextEncoder();
    const data = encoder.encode(plain);
    return await crypto.subtle.digest('SHA-256', data);
  };

  const base64URLEncodeFromBuffer = (buffer) => {
    return base64URLEncode(new Uint8Array(buffer));
  };

  const handleMicrosoftSignIn = async () => {
    setIsLoading(true);
    
    try {
      // Generate PKCE parameters
      const codeVerifier = generateCodeVerifier();
      const codeChallenge = base64URLEncodeFromBuffer(await sha256(codeVerifier));
      
      // Store code verifier for later use
      sessionStorage.setItem('pkce_code_verifier', codeVerifier);
      
      const authUrl = `https://login.microsoftonline.com/common/oauth2/v2.0/authorize`;
      const params = new URLSearchParams({
        client_id: MICROSOFT_CLIENT_ID,
        response_type: 'code',
        redirect_uri: MICROSOFT_REDIRECT_URI,
        scope: 'openid profile email User.Read',
        response_mode: 'query',
        state: Math.random().toString(36).substring(7),
        code_challenge: codeChallenge,
        code_challenge_method: 'S256',
      });

      window.location.href = `${authUrl}?${params.toString()}`;
    } catch (error) {
      console.error('Error initiating Microsoft sign-in:', error);
      setIsLoading(false);
      if (onSignInFailure) {
        onSignInFailure(error);
      }
    }
  };

  useEffect(() => {
    // Use ref to absolutely prevent duplicate execution
    if (hasProcessedCallback.current) {
      return;
    }

    const handleMicrosoftCallback = async () => {
      const urlParams = new URLSearchParams(window.location.search);
      const code = urlParams.get('code');
      const error = urlParams.get('error');

      // If no code or error, this is not a callback from Microsoft
      if (!code && !error) {
        return;
      }

      // Mark as processed immediately
      hasProcessedCallback.current = true;

      if (error) {
        console.error('Microsoft auth error:', error, urlParams.get('error_description'));
        setIsLoading(false);
        window.history.replaceState({}, document.title, window.location.pathname);
        if (onSignInFailure) {
          onSignInFailure(new Error(urlParams.get('error_description')));
        }
        return;
      }

      if (code) {
        setIsLoading(true);
        
        try {
          const codeVerifier = sessionStorage.getItem('pkce_code_verifier');
          
          if (!codeVerifier) {
            throw new Error('Code verifier not found');
          }

          // Exchange code for tokens
          const tokenUrl = 'https://login.microsoftonline.com/common/oauth2/v2.0/token';
          const tokenParams = new URLSearchParams({
            client_id: MICROSOFT_CLIENT_ID,
            scope: 'openid profile email User.Read',
            code: code,
            redirect_uri: MICROSOFT_REDIRECT_URI,
            grant_type: 'authorization_code',
            code_verifier: codeVerifier,
          });

          const tokenResponse = await fetch(tokenUrl, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: tokenParams.toString(),
          });

          if (!tokenResponse.ok) {
            const errorData = await tokenResponse.json();
            throw new Error(errorData.error_description || 'Token exchange failed');
          }

          const tokens = await tokenResponse.json();
          const userObject = parseJwt(tokens.id_token);
          
          const userData = {
            provider: 'microsoft',
            email: userObject.email || userObject.preferred_username,
            name: userObject.name,
            picture: null,
            sub: userObject.sub,
            loginTime: new Date().toISOString(),
          };

          setUserInfo(userData);
          setIsSignedIn(true);
          
          sessionStorage.setItem('authUser', JSON.stringify(userData));
          sessionStorage.setItem('authToken', tokens.access_token);
          sessionStorage.removeItem('pkce_code_verifier');
          
          window.dispatchEvent(new Event('userChanged'));
          
          // Clean up URL
          window.history.replaceState({}, document.title, window.location.pathname);
          
          // Only call onSignInSuccess after everything is set
          if (onSignInSuccess) {
            onSignInSuccess(userData);
          }
        } catch (error) {
          console.error('Error processing Microsoft sign-in:', error);
          sessionStorage.removeItem('pkce_code_verifier');
          window.history.replaceState({}, document.title, window.location.pathname);
          if (onSignInFailure) {
            onSignInFailure(error);
          }
        } finally {
          setIsLoading(false);
        }
      }
    };

    handleMicrosoftCallback();
  }, []); // Empty dependency array - only run once on mount

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
    hasProcessedCallback.current = false;
    
    sessionStorage.removeItem('authUser');
    sessionStorage.removeItem('authToken');
    sessionStorage.removeItem('pkce_code_verifier');
    
    window.dispatchEvent(new Event('userChanged'));
    window.location.reload();
  };

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

  if (isLoading && !isSignedIn) {
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
      {/* Custom Google Sign-In Button with Loading Spinner */}
      <button
        onClick={handleGoogleSignInClick}
        disabled={isGoogleLoading}
        style={{
          width: '250px',
          padding: '10px 20px',
          backgroundColor: 'white',
          border: '1px solid #dadce0',
          borderRadius: '4px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '10px',
          cursor: isGoogleLoading ? 'not-allowed' : 'pointer',
          fontSize: '14px',
          fontWeight: '500',
          transition: 'background-color 0.2s, box-shadow 0.2s',
          boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
          position: 'relative',
          opacity: isGoogleLoading ? 0.7 : 1
        }}
        onMouseEnter={(e) => !isGoogleLoading && (e.currentTarget.style.backgroundColor = '#f8f9fa')}
        onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'white')}
      >
        {isGoogleLoading ? (
          <div style={{
            width: '18px',
            height: '18px',
            border: '3px solid #f3f3f3',
            borderTop: '3px solid #4285f4',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite'
          }}></div>
        ) : (
          <svg width="18" height="18" viewBox="0 0 18 18">
            <path fill="#4285F4" d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.716v2.259h2.908c1.702-1.567 2.684-3.874 2.684-6.615z"/>
            <path fill="#34A853" d="M9 18c2.43 0 4.467-.806 5.956-2.184l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332C2.438 15.983 5.482 18 9 18z"/>
            <path fill="#FBBC05" d="M3.964 10.706c-.18-.54-.282-1.117-.282-1.706 0-.593.102-1.17.282-1.706V4.958H.957C.347 6.173 0 7.548 0 9c0 1.452.348 2.827.957 4.042l3.007-2.336z"/>
            <path fill="#EA4335" d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0 5.482 0 2.438 2.017.957 4.958L3.964 7.29C4.672 5.163 6.656 3.58 9 3.58z"/>
          </svg>
        )}
        <span>{isGoogleLoading ? 'Signing in...' : 'Sign in with Google'}</span>
      </button>
      
      <div style={{margin: '15px 0', textAlign: 'center', color: '#666'}}>
        <span>or</span>
      </div>
      
      <button
        onClick={handleMicrosoftSignIn}
        disabled={isLoading}
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
          cursor: isLoading ? 'not-allowed' : 'pointer',
          fontSize: '14px',
          fontWeight: '500',
          transition: 'background-color 0.2s',
          opacity: isLoading ? 0.7 : 1
        }}
        onMouseEnter={(e) => !isLoading && (e.currentTarget.style.backgroundColor = '#f5f5f5')}
        onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'white')}
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
      
      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

export default Auth;
