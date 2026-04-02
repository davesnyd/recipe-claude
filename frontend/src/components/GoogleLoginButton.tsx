import React from 'react';
import { Button } from '@mui/material';
import { Google as GoogleIcon } from '@mui/icons-material';

declare global {
  interface Window {
    google: any;
  }
}

interface GoogleLoginButtonProps {
  onSuccess: (credentialResponse: any) => void;
  onError: () => void;
}

const GoogleLoginButton: React.FC<GoogleLoginButtonProps> = ({ onSuccess, onError }) => {
  React.useEffect(() => {
    // Load Google Identity Services script
    const script = document.createElement('script');
    script.src = 'https://accounts.google.com/gsi/client';
    script.async = true;
    script.defer = true;
    script.onload = initializeGoogleSignIn;
    document.head.appendChild(script);

    return () => {
      document.head.removeChild(script);
    };
  }, []);

  const initializeGoogleSignIn = () => {
    if (window.google) {
      window.google.accounts.id.initialize({
        client_id: process.env.REACT_APP_GOOGLE_CLIENT_ID,
        callback: handleCredentialResponse,
        auto_select: false,
        cancel_on_tap_outside: false,
      });
      
      // Render the button instead of using prompt
      window.google.accounts.id.renderButton(
        document.getElementById('google-signin-button'),
        { 
          theme: 'outline', 
          size: 'large',
          width: '100%',
          text: 'signin_with',
        }
      );
    }
  };

  const handleCredentialResponse = (response: any) => {
    console.log('Google response:', response);
    if (response.credential) {
      onSuccess(response);
    } else {
      console.error('No credential received');
      onError();
    }
  };

  const handleSignIn = () => {
    // This function is no longer needed as we're using the rendered button
  };

  return (
    <div
      id="google-signin-button"
      style={{
        width: '100%',
        display: 'flex',
        justifyContent: 'center',
        padding: '8px 0',
      }}
    />
  );
};

export default GoogleLoginButton;