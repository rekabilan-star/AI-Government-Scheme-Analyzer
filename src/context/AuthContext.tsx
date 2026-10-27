import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, UserProfile } from '../types/index.js';
import { authApi } from '../services/api.js';

interface AuthContextType {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  isAdmin: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  register: (name: string, email: string, password: string, profile?: Partial<UserProfile>) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  updateProfile: (profile: Partial<UserProfile>, name?: string) => Promise<{ success: boolean; error?: string }>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(() => localStorage.getItem('token'));
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const fetchCurrentUser = async () => {
    const savedToken = localStorage.getItem('token');
    if (!savedToken) {
      setUser(null);
      setIsLoading(false);
      return;
    }
    try {
      const response = await authApi.getMe();
      setUser(response.data.user);
    } catch (err) {
      console.warn('Session expired or invalid token:', err);
      localStorage.removeItem('token');
      setToken(null);
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCurrentUser();
  }, []);

  const login = async (email: string, password: string) => {
    try {
      const response = await authApi.login({ email, password });
      const { token: newToken, user: loggedUser } = response.data;
      localStorage.setItem('token', newToken);
      setToken(newToken);
      setUser(loggedUser);
      return { success: true };
    } catch (err: any) {
      const msg = err.response?.data?.error || 'Invalid credentials. Please try again.';
      return { success: false, error: msg };
    }
  };

  const register = async (name: string, email: string, password: string, profile?: Partial<UserProfile>) => {
    try {
      const response = await authApi.register({ name, email, password, profile });
      const { token: newToken, user: newUser } = response.data;
      localStorage.setItem('token', newToken);
      setToken(newToken);
      setUser(newUser);
      return { success: true };
    } catch (err: any) {
      const msg = err.response?.data?.error || 'Registration failed. Please try again.';
      return { success: false, error: msg };
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    setToken(null);
    setUser(null);
  };

  const updateProfile = async (profileUpdates: Partial<UserProfile>, name?: string) => {
    try {
      const response = await authApi.updateProfile({ profile: profileUpdates, name });
      setUser(response.data.user);
      return { success: true };
    } catch (err: any) {
      const msg = err.response?.data?.error || 'Failed to update profile.';
      return { success: false, error: msg };
    }
  };

  const refreshUser = async () => {
    await fetchCurrentUser();
  };

  const isAdmin = user?.role === 'admin';

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isLoading,
        isAdmin,
        login,
        register,
        logout,
        updateProfile,
        refreshUser
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
