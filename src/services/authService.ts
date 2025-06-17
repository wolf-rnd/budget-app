import { User } from '../types';

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
  private baseURL = 'https://messing-family-budget-api.netlify.app/api';

  // Helper method for making API calls
  private async apiCall<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const url = `${this.baseURL}${endpoint}`;
    
    const config: RequestInit = {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
    };

    try {
      const response = await fetch(url, config);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('API request failed:', error);
      throw error;
    }
  }

  // POST /auth/register - רישום משתמש חדש
  async register(data: RegisterRequest): Promise<AuthResponse> {
    try {
      return await this.apiCall<AuthResponse>('/auth/register', {
        method: 'POST',
        body: JSON.stringify(data),
      });
    } catch (error) {
      console.error('Failed to register:', error);
      throw error;
    }
  }

  // POST /auth/login - התחברות משתמש
  async login(data: LoginRequest): Promise<AuthResponse> {
    try {
      const response = await this.apiCall<AuthResponse>('/auth/login', {
        method: 'POST',
        body: JSON.stringify(data),
      });
      
      // שמירת הטוקן ב-localStorage
      if (response.token) {
        localStorage.setItem('authToken', response.token);
      }
      
      return response;
    } catch (error) {
      console.error('Failed to login:', error);
      throw error;
    }
  }

  // GET /auth/me - קבלת פרטי המשתמש הנוכחי
  async getCurrentUser(): Promise<User> {
    try {
      const token = localStorage.getItem('authToken');
      return await this.apiCall<User>('/auth/me', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
    } catch (error) {
      console.error('Failed to get current user:', error);
      throw error;
    }
  }

  // Logout (client-side only)
  logout(): void {
    localStorage.removeItem('authToken');
  }

  // Check if user is authenticated
  isAuthenticated(): boolean {
    return !!localStorage.getItem('authToken');
  }

  // Get auth token
  getToken(): string | null {
    return localStorage.getItem('authToken');
  }
}

export const authService = new AuthService();