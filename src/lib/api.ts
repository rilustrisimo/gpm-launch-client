import axios from 'axios';
import { toast } from 'sonner';

// Create axios instance with base URL from environment variables
export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5003/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add request interceptor for auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    console.error('API Request error:', error);
    return Promise.reject(error);
  }
);

// Add response interceptor for error handling
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    console.error('API Response error:', error);
    
    // Extract the error message
    let errorMessage = 'Something went wrong. Please try again.';
    
    if (error.response) {
      // The request was made and the server responded with a status code
      // that falls out of the range of 2xx
      console.error('Error response data:', error.response.data);
      console.error('Error response status:', error.response.status);
      
      // Handle authentication errors
      if (error.response.status === 401) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        
        // Check if we're not already on the login page to avoid redirect loops
        if (!window.location.pathname.includes('/login')) {
          toast.error('Your session has expired. Please sign in again.');
          // Short delay before redirecting
          setTimeout(() => {
            window.location.href = '/login';
          }, 1000);
        }
      }
      
      // Get error message from response
      if (error.response.data && typeof error.response.data === 'object') {
        if (error.response.data.message) {
          errorMessage = error.response.data.message;
        } else if (error.response.data.errors && Array.isArray(error.response.data.errors)) {
          errorMessage = error.response.data.errors.map((e: any) => e.msg).join(', ');
        }
      }
    } else if (error.request) {
      // The request was made but no response was received
      console.error('Error request:', error.request);
      errorMessage = 'No response from server. Please check your connection.';
    } else {
      // Something happened in setting up the request that triggered an Error
      console.error('Error message:', error.message);
      errorMessage = error.message;
    }
    
    // Don't show toast for 401 errors (already handled above)
    if (error.response && error.response.status !== 401) {
      toast.error(errorMessage);
    }
    
    return Promise.reject(error);
  }
);

export default api; 