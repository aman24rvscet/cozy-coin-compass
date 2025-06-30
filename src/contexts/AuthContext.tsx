
import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface User {
  id: string;
  email: string;
  full_name?: string;
}

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<{ error?: string }>;
  signup: (email: string, password: string, fullName?: string) => Promise<{ error?: string }>;
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

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAuth = () => {
      const savedUser = localStorage.getItem('user');
      if (savedUser) {
        setUser(JSON.parse(savedUser));
      }
      setLoading(false);
    };

    checkAuth();
  }, []);

  const login = async (email: string, password: string) => {
    try {
      const { data, error } = await supabase.rpc('login_user', {
        user_email: email,
        user_password: password
      });

      if (error) throw error;
      
      if (data && data.length > 0) {
        const userData = data[0];
        const userObj = {
          id: userData.id,
          email: userData.email,
          full_name: userData.full_name
        };
        setUser(userObj);
        localStorage.setItem('user', JSON.stringify(userObj));
        return {};
      } else {
        return { error: 'Invalid email or password' };
      }
    } catch (error: any) {
      return { error: error.message || 'Login failed' };
    }
  };

  const signup = async (email: string, password: string, fullName?: string) => {
    try {
      const { data, error } = await supabase.rpc('signup_user', {
        user_email: email,
        user_password: password,
        user_full_name: fullName || null
      });

      if (error) throw error;
      
      if (data && data.length > 0) {
        const userData = data[0];
        const userObj = {
          id: userData.id,
          email: userData.email,
          full_name: userData.full_name
        };
        setUser(userObj);
        localStorage.setItem('user', JSON.stringify(userObj));
        return {};
      } else {
        return { error: 'Signup failed' };
      }
    } catch (error: any) {
      if (error.message.includes('duplicate key')) {
        return { error: 'Email already exists' };
      }
      return { error: error.message || 'Signup failed' };
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('user');
  };

  const value = {
    user,
    login,
    signup,
    logout,
    loading
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
