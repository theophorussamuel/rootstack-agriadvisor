import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import axios from 'axios';

interface User {
  id: number;
  email: string;
  role: 'farmer' | 'agronomist';
  name: string;
  location: string;
  landSize: number;
}

interface AuthContextType {
  user: User | null;
  signup: (userData: any) => Promise<{ success: boolean; message?: string }>;
  logout: () => void;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check for stored user data
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
    setLoading(false);
  }, []);

  const signup = async (userData: any): Promise<{ success: boolean; message?: string }> => {
    try {
      const response = await axios.post('http://localhost:3001/api/signup', userData);
      
      if (response.data.success) {
        setUser(response.data.user);
        localStorage.setItem('user', JSON.stringify(response.data.user));
        return { success: true };
      }
      return { success: false, message: response.data.message || 'Registration failed' };
    } catch (error) {
      console.error('Signup error:', error);
      if (axios.isAxiosError(error)) {
        return { success: false, message: error.response?.data?.message || 'Registration failed' };
      }
      return { success: false, message: 'Network error. Please try again.' };
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('user');
  };

  return (
    <AuthContext.Provider value={{ user, signup, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};