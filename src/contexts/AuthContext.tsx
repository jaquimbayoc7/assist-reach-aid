import React, { createContext, useContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiService } from '@/services/api';
import type { User as ApiUser } from '@/services/api';

interface User {
  id: number;
  email: string;
  name: string;
  role: 'admin' | 'médico';
}

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('authToken');
    const storedUser = localStorage.getItem('user');
    if (token && storedUser) {
      setUser(JSON.parse(storedUser));
      apiService.setToken(token);
    }
    setIsLoading(false);
  }, []);

  const login = async (email: string, password: string) => {
    try {
      const response = await apiService.login({ username: email, password });
      apiService.setToken(response.access_token);
      
      // Decode token to get user info (simple parsing, in production use a proper JWT library)
      const tokenPayload = JSON.parse(atob(response.access_token.split('.')[1]));
      
      const userData: User = {
        id: 0, // Will be populated when we fetch user details
        email: tokenPayload.sub,
        name: tokenPayload.sub.split('@')[0],
        role: tokenPayload.role || 'médico',
      };
      
      localStorage.setItem('user', JSON.stringify(userData));
      setUser(userData);
      navigate('/dashboard');
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  };

  const logout = () => {
    apiService.clearToken();
    localStorage.removeItem('authToken');
    localStorage.removeItem('user');
    setUser(null);
    navigate('/login');
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};
