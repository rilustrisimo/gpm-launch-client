import { useState, useEffect } from 'react';
import { useMutation } from '@tanstack/react-query';
import { toast } from 'sonner';
import { authService } from '@/services/auth';

export interface AuthUser {
  id: number;
  name?: string;
  firstName?: string;
  lastName?: string;
  email: string;
  role: string;
  createdAt: string;
  updatedAt: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterCredentials {
  name: string;
  email: string;
  password: string;
}

interface AuthResponse {
  token: string;
  user: AuthUser;
  success: boolean;
  message: string;
}

export const useAuth = () => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);
  
  // Initialize auth state from localStorage
  useEffect(() => {
    const initAuth = async () => {
      const storedToken = localStorage.getItem('token');
      const storedUser = localStorage.getItem('user');
      
      if (storedToken && storedUser) {
        setToken(storedToken);
        try {
          const parsedUser = JSON.parse(storedUser);
          setUser(parsedUser);
          setIsAuthenticated(true);
          
          // Optionally verify token validity with the server
          try {
            await authService.me();
          } catch (error) {
            console.error('Token validation failed:', error);
            // Clear invalid auth data
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            setToken(null);
            setUser(null);
            setIsAuthenticated(false);
          }
        } catch (error) {
          console.error('Failed to parse user from localStorage:', error);
          // Clear invalid data
          localStorage.removeItem('token');
          localStorage.removeItem('user');
        }
      }
      setIsInitialized(true);
    };
    
    initAuth();
  }, []);

  // Login mutation
  const loginMutation = useMutation<AuthResponse, Error, LoginCredentials>({
    mutationFn: (credentials: LoginCredentials) => authService.login(credentials),
    onSuccess: (data) => {
      if (data.success) {
        localStorage.setItem('token', data.token);
        
        // Format the user object to ensure name property exists
        const formattedUser = {
          ...data.user,
          name: data.user.name || `${data.user.firstName || ''} ${data.user.lastName || ''}`.trim()
        };
        
        localStorage.setItem('user', JSON.stringify(formattedUser));
        setToken(data.token);
        setUser(formattedUser);
        setIsAuthenticated(true);
        toast.success(data.message || 'Successfully logged in');
      } else {
        toast.error(data.message || 'Login failed');
        throw new Error(data.message || 'Login failed');
      }
    },
    onError: (error: any) => {
      console.error('Login error:', error);
      const errorMsg = error?.response?.data?.message || error.message || 'Login failed. Please try again.';
      toast.error(errorMsg);
    }
  });

  // Register mutation
  const registerMutation = useMutation<AuthResponse, Error, RegisterCredentials>({
    mutationFn: (credentials: RegisterCredentials) => authService.register(credentials),
    onSuccess: (data) => {
      if (data.success) {
        localStorage.setItem('token', data.token);
        
        // Format the user object to ensure name property exists
        const formattedUser = {
          ...data.user,
          name: data.user.name || `${data.user.firstName || ''} ${data.user.lastName || ''}`.trim()
        };
        
        localStorage.setItem('user', JSON.stringify(formattedUser));
        setToken(data.token);
        setUser(formattedUser);
        setIsAuthenticated(true);
        toast.success(data.message || 'Account created successfully');
      } else {
        toast.error(data.message || 'Registration failed');
        throw new Error(data.message || 'Registration failed');
      }
    },
    onError: (error: any) => {
      console.error('Registration error:', error);
      const errorMsg = error?.response?.data?.message || error.message || 'Registration failed. Please try again.';
      toast.error(errorMsg);
    }
  });

  // Logout function
  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setToken(null);
    setUser(null);
    setIsAuthenticated(false);
    toast.success('Successfully logged out');
  };

  return {
    user,
    token,
    isAuthenticated,
    isInitialized,
    login: loginMutation.mutateAsync,
    register: registerMutation.mutateAsync,
    logout,
    isLoading: loginMutation.isPending || registerMutation.isPending
  };
}; 