import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User } from '../types';
import { authApi } from '../services/api';

interface AuthContextType {
  user: User | null;
  login: (idToken: string) => Promise<void>;
  logout: () => void;
  isLoading: boolean;
  updateUser: (userData: Partial<User>) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    console.log('AuthContext: useEffect starting');
    const token = localStorage.getItem('token');
    console.log('AuthContext: token from localStorage:', token ? 'exists' : 'not found');
    
    if (token) {
      console.log('AuthContext: calling getCurrentUser');
      getCurrentUser();
    } else {
      console.log('AuthContext: no token, setting isLoading to false');
      setIsLoading(false);
    }
  }, []);

  const getCurrentUser = async () => {
    console.log('AuthContext: getCurrentUser starting');
    try {
      console.log('AuthContext: calling authApi.getCurrentUser()');
      const response = await authApi.getCurrentUser();
      console.log('AuthContext: getCurrentUser success, user:', response.data);
      setUser(response.data);
    } catch (error) {
      console.log('AuthContext: getCurrentUser error:', error);
      localStorage.removeItem('token');
    } finally {
      console.log('AuthContext: getCurrentUser finally, setting isLoading to false');
      setIsLoading(false);
    }
  };

  const login = async (idToken: string) => {
    try {
      const response = await authApi.googleLogin(idToken);
      const { token, user } = response.data;
      
      localStorage.setItem('token', token);
      setUser(user);
    } catch (error) {
      console.error('Login failed:', error);
      throw error;
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
  };

  const updateUser = async (userData: Partial<User>) => {
    try {
      const response = await authApi.updateCurrentUser(userData);
      setUser(response.data);
    } catch (error) {
      console.error('Update user failed:', error);
      throw error;
    }
  };

  const value = {
    user,
    login,
    logout,
    isLoading,
    updateUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};