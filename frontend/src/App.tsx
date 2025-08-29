import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { CircularProgress, Box } from '@mui/material';

import { AuthProvider, useAuth } from './contexts/AuthContext';
import theme from './theme';

// Pages
import LoginPage from './pages/LoginPage';
import HomePage from './pages/HomePage';
import RecipeViewPage from './pages/RecipeViewPage';
import RecipeEditPage from './pages/RecipeEditPage';
import TestPage from './pages/TestPage';

// Protected Route Component
const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  return user ? <>{children}</> : <Navigate to="/login" replace />;
};

// Public Route Component (redirect to home if authenticated)
const PublicRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  return user ? <Navigate to="/" replace /> : <>{children}</>;
};

const AppRoutes: React.FC = () => {
  return (
    <Router>
      <Routes>
        <Route
          path="/login"
          element={
            <PublicRoute>
              <LoginPage />
            </PublicRoute>
          }
        />
        <Route
          path="/"
          element={
            <ProtectedRoute>
              {(() => {
                console.log('App: / route matched, rendering HomePage');
                return <HomePage />;
              })()}
            </ProtectedRoute>
          }
        />
        <Route
          path="/test"
          element={<TestPage />}
        />
        <Route
          path="/recipe/new"
          element={
            <ProtectedRoute>
              {(() => {
                console.log('App: /recipe/new route matched, rendering RecipeEditPage');
                return <RecipeEditPage />;
              })()}
            </ProtectedRoute>
          }
        />
        <Route
          path="/recipe/:id"
          element={
            <ProtectedRoute>
              {(() => {
                console.log('App: /recipe/:id route matched, rendering RecipeViewPage');
                return <RecipeViewPage />;
              })()}
            </ProtectedRoute>
          }
        />
        <Route
          path="/recipe/:id/edit"
          element={
            <ProtectedRoute>
              {(() => {
                console.log('App: /recipe/:id/edit route matched, rendering RecipeEditPage');
                return <RecipeEditPage />;
              })()}
            </ProtectedRoute>
          }
        />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
};

const App: React.FC = () => {
  console.log('App: Component starting to render');
  
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </ThemeProvider>
  );
};

export default App;
