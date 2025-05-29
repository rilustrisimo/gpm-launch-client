import { api } from '@/lib/api';
import { AuthUser, LoginCredentials, RegisterCredentials } from '@/hooks/useAuth';

interface AuthResponse {
  token: string;
  user: AuthUser;
  success: boolean;
  message: string;
}

export const authService = {
  login: async (credentials: LoginCredentials): Promise<AuthResponse> => {
    const response = await api.post<AuthResponse>('/auth/login', credentials);
    return response.data;
  },
  
  register: async (credentials: RegisterCredentials): Promise<AuthResponse> => {
    // Split the name into firstName and lastName
    const nameParts = credentials.name.split(' ');
    const firstName = nameParts[0];
    const lastName = nameParts.length > 1 ? nameParts.slice(1).join(' ') : '';
    
    const registerData = {
      firstName,
      lastName,
      email: credentials.email,
      password: credentials.password
    };
    
    const response = await api.post<AuthResponse>('/auth/register', registerData);
    return response.data;
  },
  
  me: async (): Promise<AuthUser> => {
    const response = await api.get<{ success: boolean; user: AuthUser }>('/auth/me');
    return response.data.user;
  }
}; 