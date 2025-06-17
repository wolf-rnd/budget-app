import { Fund, Income, Expense, Debt, Task } from '../types';

export interface DashboardSummary {
  totalIncome: number;
  totalExpenses: number;
  totalBudget: number;
  balance: number;
  totalDebts: number;
  funds: Fund[];
  recentExpenses: Expense[];
  pendingTasks: Task[];
  titheRequired: number;
  titheGiven: number;
  titheRemaining: number;
}

class DashboardService {
  private baseURL = 'https://messing-family-budget-api.netlify.app/api';

  // Helper method for making API calls
  private async apiCall<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const url = `${this.baseURL}${endpoint}`;
    const token = localStorage.getItem('authToken');
    
    const config: RequestInit = {
      ...options,
      headers: {
        'Content-Type': 'application/json',
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
      console.error('API request failed:', error);
      throw error;
    }
  }

  // GET /dashboard/summary - קבלת סיכום דשבורד
  async getDashboardSummary(budgetYearId?: string): Promise<DashboardSummary> {
    try {
      const params = budgetYearId ? `?budgetYearId=${budgetYearId}` : '';
      return await this.apiCall<DashboardSummary>(`/dashboard/summary${params}`);
    } catch (error) {
      console.error('Failed to fetch dashboard summary:', error);
      throw error;
    }
  }
}

export const dashboardService = new DashboardService();