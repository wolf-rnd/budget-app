import { apiClient } from './api';

// Mock data import (temporary)
// import userData from '../data/user.json'; // נוסיף קובץ זה

export interface User {
  id: string;
  email: string;
  name: string;
  createdAt: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  name: string;
}

export interface AuthResponse {
  user: User;
  token: string;
}

class AuthService {
  // POST /register - רישום משתמש חדש
  async register(data: RegisterRequest): Promise<AuthResponse> {
    // TODO: Replace with actual API call
    // return apiClient.post<AuthResponse>('/auth/register', data);
    
    // Mock implementation
    const mockUser: User = {
      id: Date.now().toString(),
      email: data.email,
      name: data.name,
      createdAt: new Date().toISOString()
    };
    
    const mockToken = 'mock-jwt-token-' + Date.now();
    apiClient.setToken(mockToken);
    
    return Promise.resolve({
      user: mockUser,
      token: mockToken
    });
  }

  // POST /login - התחברות משתמש
  async login(data: LoginRequest): Promise<AuthResponse> {
    // TODO: Replace with actual API call
    // return apiClient.post<AuthResponse>('/auth/login', data);
    
    // Mock implementation
    const mockUser: User = {
      id: '1',
      email: data.email,
      name: 'נעמי מסינג',
      createdAt: '2024-01-01T00:00:00.000Z'
    };
    
    const mockToken = 'mock-jwt-token-' + Date.now();
    apiClient.setToken(mockToken);
    
    return Promise.resolve({
      user: mockUser,
      token: mockToken
    });
  }

  // GET /me - קבלת פרטי המשתמש הנוכחי
  async getCurrentUser(): Promise<User> {
    // TODO: Replace with actual API call
    // return apiClient.get<User>('/auth/me');
    
    // Mock implementation
    return Promise.resolve({
      id: '1',
      email: 'naomi@example.com',
      name: 'נעמי מסינג',
      createdAt: '2024-01-01T00:00:00.000Z'
    });
  }

  // Logout (client-side only)
  logout(): void {
    apiClient.removeToken();
  }

  // Check if user is authenticated
  isAuthenticated(): boolean {
    return !!localStorage.getItem('authToken');
  }
}

export const authService = new AuthService();