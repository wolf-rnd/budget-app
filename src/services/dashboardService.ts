import { Fund, Income, Expense, Debt, Task } from '../types';
import { ENV } from '../config/env';

export interface DashboardSummary {
  total_income: number;
  total_expenses: number;
  total_budget: number;
  balance: number;
  total_debts: number;
  funds: Fund[];
  recent_expenses: Expense[];
  pending_tasks: Task[];
  titheRequired: number;
  titheGiven: number;
  titheRemaining: number;
}

class DashboardService {
  private baseURL = ENV.API_BASE_URL;

  // Helper method for making API calls
  private async apiCall<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const url = `${this.baseURL}${endpoint}`;
    const token = localStorage.getItem('authToken');
    
    const config: RequestInit = {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        'x-user-id': '11111111-1111-1111-1111-111111111111',
        ...(token && { 'Authorization': `Bearer ${token}` }),
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
      if (ENV.DEV_MODE) {
        console.error('API request failed:', error);
      }
      throw error;
    }
  }

  // GET /dashboard/summary - קבלת סיכום דשבורד
  async getDashboardSummary(budgetYearId?: string): Promise<DashboardSummary> {
    try {
      const params = budgetYearId ? `?budgetYearId=${budgetYearId}` : '';
      return await this.apiCall<DashboardSummary>(`/dashboard/summary${params}`);
    } catch (error) {
      if (ENV.DEV_MODE) {
        console.error('Failed to fetch dashboard summary:', error);
      }
      throw error;
    }
  }
}

export const dashboardService = new DashboardService();