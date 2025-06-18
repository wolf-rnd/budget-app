import { ENV } from '../config/env';

export interface ApiResponse<T> {
  data: T;
  success: boolean;
  error?: string;
}

export class ApiError extends Error {
  constructor(
    message: string,
    public status?: number,
    public code?: string
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

export class ApiClient {
  private baseURL: string;
  private timeout: number;
  private retryAttempts: number = 2;
  private retryDelay: number = 1000;

  constructor() {
    this.baseURL = ENV.API_BASE_URL;
    this.timeout = ENV.API_TIMEOUT;
  }

  private async makeRequest<T>(
    endpoint: string,
    options: RequestInit = {},
    attempt: number = 1
  ): Promise<ApiResponse<T>> {
    const url = `${this.baseURL}${endpoint}`;
    const token = localStorage.getItem('authToken');
    
    // Create abort controller for timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.timeout);

    const config: RequestInit = {
      ...options,
      signal: controller.signal,
      headers: {
        'Content-Type': 'application/json',
        'x-user-id': this.generateUserId(),
        ...(token && { 'Authorization': `Bearer ${token}` }),
        ...options.headers,
      },
    };

    try {
      const response = await fetch(url, config);
      clearTimeout(timeoutId);
      
      if (!response.ok) {
        // Handle specific HTTP status codes
        if (response.status >= 500 && attempt <= this.retryAttempts) {
          if (ENV.DEV_MODE) {
            console.warn(`Server error (${response.status}), retrying attempt ${attempt}/${this.retryAttempts}`);
          }
          await this.delay(this.retryDelay * attempt);
          return this.makeRequest(endpoint, options, attempt + 1);
        }
        
        throw new ApiError(
          `HTTP error! status: ${response.status}`,
          response.status
        );
      }

      const result = await response.json();
      return {
        data: result.data || result,
        success: true
      };
    } catch (error) {
      clearTimeout(timeoutId);
      
      if (error instanceof ApiError) {
        throw error;
      }
      
      if (error.name === 'AbortError') {
        if (attempt <= this.retryAttempts) {
          if (ENV.DEV_MODE) {
            console.warn(`Request timeout, retrying attempt ${attempt}/${this.retryAttempts}`);
          }
          await this.delay(this.retryDelay * attempt);
          return this.makeRequest(endpoint, options, attempt + 1);
        }
        throw new ApiError('Request timeout after retries', 408, 'TIMEOUT');
      }
      
      // Handle network errors with retry
      if (attempt <= this.retryAttempts && (
        error.message.includes('fetch') || 
        error.message.includes('network') ||
        error.message.includes('socket hang up')
      )) {
        if (ENV.DEV_MODE) {
          console.warn(`Network error, retrying attempt ${attempt}/${this.retryAttempts}:`, error.message);
        }
        await this.delay(this.retryDelay * attempt);
        return this.makeRequest(endpoint, options, attempt + 1);
      }
      
      throw new ApiError(
        error.message || 'Network error occurred',
        0,
        'NETWORK_ERROR'
      );
    }
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  private generateUserId(): string {
    // Try to get user ID from localStorage, or generate a consistent one
    let userId = localStorage.getItem('userId');
    if (!userId) {
      // Generate a more realistic UUID-like string
      userId = 'user-' + Math.random().toString(36).substr(2, 9) + '-' + Date.now().toString(36);
      localStorage.setItem('userId', userId);
    }
    return userId;
  }

  async get<T>(endpoint: string): Promise<ApiResponse<T>> {
    return this.makeRequest<T>(endpoint, { method: 'GET' });
  }

  async post<T>(endpoint: string, data?: any): Promise<ApiResponse<T>> {
    return this.makeRequest<T>(endpoint, {
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  async put<T>(endpoint: string, data?: any): Promise<ApiResponse<T>> {
    return this.makeRequest<T>(endpoint, {
      method: 'PUT',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  async delete<T>(endpoint: string): Promise<ApiResponse<T>> {
    return this.makeRequest<T>(endpoint, { method: 'DELETE' });
  }
}

export const apiClient = new ApiClient();