import React from 'react';
import {
  AppBar,
  Toolbar,
  Typography,
  Box,
  Button,
  Container,
} from '@mui/material';
import { Logout, Settings } from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

interface LayoutProps {
  children: React.ReactNode;
  title?: string;
}

const Layout: React.FC<LayoutProps> = ({ children, title = 'Recipe Manager' }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <Box sx={{ minHeight: '100vh', backgroundColor: 'background.default' }}>
      <AppBar position="sticky">
        <Toolbar>
          <Box
            sx={{
              flexGrow: 1,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center'
            }}
            onClick={() => navigate('/')}
          >
            <img
              src="/logo.png"
              alt="Recipe Manager"
              style={{
                height: '48px',
                objectFit: 'contain'
              }}
            />
          </Box>
          
          {user && (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Typography variant="body2">
                Welcome, {user.username}
              </Typography>
              
              <Button
                color="inherit"
                startIcon={<Settings />}
                onClick={() => navigate('/settings')}
              >
                Settings
              </Button>
              
              <Button
                color="inherit"
                startIcon={<Logout />}
                onClick={handleLogout}
              >
                Logout
              </Button>
            </Box>
          )}
        </Toolbar>
      </AppBar>

      <Container maxWidth={false} sx={{ width: '80%', py: 3 }}>
        {title && (
          <Typography
            variant="h4"
            component="h1"
            onClick={() => navigate('/')}
            sx={{ mb: 3, cursor: 'pointer' }}
          >
            {title}
          </Typography>
        )}
        {children}
      </Container>
    </Box>
  );
};

export default Layout;