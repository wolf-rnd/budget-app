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
    public code?: string,
    public endpoint?: string
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
  private notificationCallback?: (notification: any) => void;

  constructor() {
    this.baseURL = ENV.API_BASE_URL;
    this.timeout = ENV.API_TIMEOUT;
  }

  setNotificationCallback(callback: (notification: any) => void) {
    this.notificationCallback = callback;
  }

  private showNotification(
    type: 'error' | 'warning' | 'info' | 'success',
    title: string,
    message: string,
    status?: number,
    endpoint?: string
  ) {
    if (this.notificationCallback) {
      this.notificationCallback({
        type,
        title,
        message,
        status,
        endpoint,
        autoHide: type !== 'error', // Errors stay visible until manually closed
        duration: type === 'error' ? 0 : 6000
      });
    }
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
        let errorMessage = `שגיאת שרת: ${response.status}`;
        let serverMessage = '';
        
        try {
          const errorData = await response.json();
          serverMessage = errorData.message || errorData.error || '';
        } catch {
          // If we can't parse the error response, use status text
          serverMessage = response.statusText;
        }
        
        // Show notification for HTTP errors
        this.showNotification(
          'error',
          `שגיאה בקריאה לשרת`,
          serverMessage || errorMessage,
          response.status,
          endpoint
        );
        
        // Handle specific HTTP status codes with retry
        if (response.status >= 500 && attempt <= this.retryAttempts) {
          if (ENV.DEV_MODE) {
            console.warn(`Server error (${response.status}), retrying attempt ${attempt}/${this.retryAttempts}`);
          }
          await this.delay(this.retryDelay * attempt);
          return this.makeRequest(endpoint, options, attempt + 1);
        }
        
        throw new ApiError(
          serverMessage || errorMessage,
          response.status,
          'HTTP_ERROR',
          endpoint
        );
      }

      const result = await response.json();
      
      // Show success notification for write operations
      if (['POST', 'PUT', 'DELETE'].includes(options.method || 'GET')) {
        const operationNames = {
          'POST': 'נוצר',
          'PUT': 'עודכן', 
          'DELETE': 'נמחק'
        };
        
        this.showNotification(
          'success',
          'פעולה הושלמה בהצלחה',
          `הנתונים ${operationNames[options.method as keyof typeof operationNames]} בהצלחה`,
          response.status,
          endpoint
        );
      }
      
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
        const timeoutMessage = 'הבקשה לשרת לקחה יותר מדי זמן';
        
        this.showNotification(
          'error',
          'תם הזמן הקצוב',
          timeoutMessage,
          408,
          endpoint
        );
        
        if (attempt <= this.retryAttempts) {
          if (ENV.DEV_MODE) {
            console.warn(`Request timeout, retrying attempt ${attempt}/${this.retryAttempts}`);
          }
          await this.delay(this.retryDelay * attempt);
          return this.makeRequest(endpoint, options, attempt + 1);
        }
        throw new ApiError(timeoutMessage, 408, 'TIMEOUT', endpoint);
      }
      
      // Handle network errors
      let networkMessage = 'בעיית רשת - לא ניתן להתחבר לשרת';
      
      if (error.message.includes('socket hang up')) {
        networkMessage = 'השרת סגר את החיבור באופן בלתי צפוי';
      } else if (error.message.includes('fetch')) {
        networkMessage = 'לא ניתן להתחבר לשרת - בדוק את החיבור לאינטרנט';
      } else if (error.message.includes('network')) {
        networkMessage = 'בעיית רשת - אין חיבור לאינטרנט';
      }
      
      this.showNotification(
        'error',
        'בעיית חיבור',
        networkMessage,
        0,
        endpoint
      );
      
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
        networkMessage,
        0,
        'NETWORK_ERROR',
        endpoint
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