
import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import bcrypt from 'bcryptjs';

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
      const { data: users, error } = await supabase
        .from('users')
        .select('*')
        .eq('email', email)
        .limit(1);

      if (error) throw error;
      
      if (users && users.length > 0) {
        const user = users[0];
        const isValidPassword = await bcrypt.compare(password, user.password_hash);
        
        if (isValidPassword) {
          const userObj = {
            id: user.id,
            email: user.email,
            full_name: user.full_name
          };
          setUser(userObj);
          localStorage.setItem('user', JSON.stringify(userObj));
          return {};
        } else {
          return { error: 'Invalid email or password' };
        }
      } else {
        return { error: 'Invalid email or password' };
      }
    } catch (error: any) {
      return { error: error.message || 'Login failed' };
    }
  };

  const signup = async (email: string, password: string, fullName?: string) => {
    try {
      const hashedPassword = await bcrypt.hash(password, 10);
      
      const { data: newUser, error } = await supabase
        .from('users')
        .insert([{
          email,
          password_hash: hashedPassword,
          full_name: fullName || null
        }])
        .select()
        .single();

      if (error) throw error;
      
      if (newUser) {
        const userObj = {
          id: newUser.id,
          email: newUser.email,
          full_name: newUser.full_name
        };
        setUser(userObj);
        localStorage.setItem('user', JSON.stringify(userObj));
        return {};
      } else {
        return { error: 'Signup failed' };
      }
    } catch (error: any) {
      if (error.message.includes('duplicate key') || error.message.includes('unique constraint')) {
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
