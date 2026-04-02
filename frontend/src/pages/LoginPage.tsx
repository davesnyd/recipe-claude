import React, { useState } from 'react';
import {
  Box,
  Paper,
  Typography,
  Alert,
  CircularProgress,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import GoogleLoginButton from '../components/GoogleLoginButton';

const LoginPage: React.FC = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleGoogleSuccess = async (credentialResponse: any) => {
    setIsLoading(true);
    setError(null);

    try {
      await login(credentialResponse.credential);
      navigate('/');
    } catch (error: any) {
      setError(error.response?.data?.error || 'Login failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleError = () => {
    setError('Google login failed. Please try again.');
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'background.default',
        backgroundImage: 'linear-gradient(135deg, #F5F5DC 0%, #FEFEFE 100%)',
      }}
    >
      <Paper
        elevation={6}
        sx={{
          p: 6,
          maxWidth: 400,
          width: '100%',
          textAlign: 'center',
          backgroundColor: 'background.paper',
        }}
      >
        <Typography variant="h3" component="h1" sx={{ mb: 2 }}>
          Recipe Manager
        </Typography>
        
        <Typography variant="body1" sx={{ mb: 4, color: 'text.secondary' }}>
          Welcome! Please sign in to access your recipes.
        </Typography>

        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        {isLoading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 3 }}>
            <CircularProgress />
          </Box>
        ) : (
          <GoogleLoginButton
            onSuccess={handleGoogleSuccess}
            onError={handleGoogleError}
          />
        )}

        <Typography variant="caption" sx={{ mt: 3, display: 'block', color: 'text.secondary' }}>
          Sign in with your Google account to get started
        </Typography>
      </Paper>
    </Box>
  );
};

export default LoginPage;