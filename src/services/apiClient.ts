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
        endpoint
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

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.timeout);

    const config: RequestInit = {
      ...options,
      signal: controller.signal,
      headers: {
        'Content-Type': 'application/json',
        'x-user-id': '11111111-1111-1111-1111-111111111111',
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
          serverMessage = response.statusText;
        }

        this.showNotification(
          'error',
          `שגיאה בקריאה לשרת`,
          serverMessage || errorMessage,
          response.status,
          endpoint
        );

        throw new ApiError(
          serverMessage || errorMessage,
          response.status,
          'HTTP_ERROR',
          endpoint
        );
      }

      const result = await response.json();

      // הצגת נוטיפיקציית הצלחה רק לפעולות שינוי (לא לקריאה)
      if (['POST', 'PUT', 'DELETE'].includes(options.method || 'GET')) {
        this.showNotification(
          'success',
          'פעולה הושלמה בהצלחה',
          '', // ללא הודעה מפורטת בהצלחה
          response.status,
          endpoint
        );
      }

      return {
        data: result.data || result,
        success: true
      };

    } catch (error: unknown) {
      clearTimeout(timeoutId);

      if (error instanceof ApiError) {
        throw error;
      }

      if (error instanceof Error && error.name === 'AbortError') {
        const timeoutMessage = 'הבקשה לשרת לקחה יותר מדי זמן';

        this.showNotification(
          'error',
          'תם הזמן הקצוב',
          timeoutMessage,
          408,
          endpoint
        );

        throw new ApiError(timeoutMessage, 408, 'TIMEOUT', endpoint);
      }

      const message = error instanceof Error ? error.message : String(error);

      let networkMessage = 'בעיית רשת - לא ניתן להתחבר לשרת';

      if (message.includes('socket hang up')) {
        networkMessage = 'השרת סגר את החיבור באופן בלתי צפוי';
      } else if (message.includes('fetch')) {
        networkMessage = 'לא ניתן להתחבר לשרת - בדוק את החיבור לאינטרנט';
      } else if (message.includes('network')) {
        networkMessage = 'בעיית רשת - אין חיבור לאינטרנט';
      }

      this.showNotification(
        'error',
        'בעיית חיבור',
        networkMessage,
        0,
        endpoint
      );

      throw new ApiError(
        networkMessage,
        0,
        'NETWORK_ERROR',
        endpoint
      );
    }
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