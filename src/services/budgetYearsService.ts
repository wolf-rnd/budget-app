import { apiClient } from './api';

// Mock data import
import budgetYearsData from '../data/budgetYears.json';

export interface BudgetYear {
  id: string;
  name: string;
  startDate: string;
  endDate: string;
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateBudgetYearRequest {
  name: string;
  startDate: string;
  endDate: string;
}

export interface UpdateBudgetYearRequest {
  name?: string;
  startDate?: string;
  endDate?: string;
}

class BudgetYearsService {
  // GET / - קבלת כל שנות התקציב
  async getAllBudgetYears(): Promise<BudgetYear[]> {
    // TODO: Replace with actual API call
    // return apiClient.get<BudgetYear[]>('/budget-years');
    
    // Mock implementation
    return Promise.resolve(budgetYearsData.budgetYears);
  }

  // GET /active - קבלת שנת התקציב הפעילה
  async getActiveBudgetYear(): Promise<BudgetYear | null> {
    // TODO: Replace with actual API call
    // return apiClient.get<BudgetYear>('/budget-years/active');
    
    // Mock implementation
    const activeBudgetYear = budgetYearsData.budgetYears.find(year => year.isActive);
    return Promise.resolve(activeBudgetYear || null);
  }

  // GET /:id - קבלת שנת תקציב ספציפית
  async getBudgetYearById(id: string): Promise<BudgetYear | null> {
    // TODO: Replace with actual API call
    // return apiClient.get<BudgetYear>(`/budget-years/${id}`);
    
    // Mock implementation
    const budgetYear = budgetYearsData.budgetYears.find(year => year.id === id);
    return Promise.resolve(budgetYear || null);
  }

  // POST / - יצירת שנת תקציב חדשה
  async createBudgetYear(data: CreateBudgetYearRequest): Promise<BudgetYear> {
    // TODO: Replace with actual API call
    // return apiClient.post<BudgetYear>('/budget-years', data);
    
    // Mock implementation
    const newBudgetYear: BudgetYear = {
      id: Date.now().toString(),
      ...data,
      isActive: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    return Promise.resolve(newBudgetYear);
  }

  // PUT /:id - עדכון שנת תקציב
  async updateBudgetYear(id: string, data: UpdateBudgetYearRequest): Promise<BudgetYear> {
    // TODO: Replace with actual API call
    // return apiClient.put<BudgetYear>(`/budget-years/${id}`, data);
    
    // Mock implementation
    const existingBudgetYear = budgetYearsData.budgetYears.find(year => year.id === id);
    if (!existingBudgetYear) {
      throw new Error('Budget year not found');
    }
    
    const updatedBudgetYear: BudgetYear = {
      ...existingBudgetYear,
      ...data,
      updatedAt: new Date().toISOString()
    };
    
    return Promise.resolve(updatedBudgetYear);
  }

  // PUT /:id/activate - הפעלת שנת תקציב
  async activateBudgetYear(id: string): Promise<BudgetYear> {
    // TODO: Replace with actual API call
    // return apiClient.put<BudgetYear>(`/budget-years/${id}/activate`);
    
    // Mock implementation
    const existingBudgetYear = budgetYearsData.budgetYears.find(year => year.id === id);
    if (!existingBudgetYear) {
      throw new Error('Budget year not found');
    }
    
    const activatedBudgetYear: BudgetYear = {
      ...existingBudgetYear,
      isActive: true,
      updatedAt: new Date().toISOString()
    };
    
    return Promise.resolve(activatedBudgetYear);
  }

  // DELETE /:id - מחיקת שנת תקציב
  async deleteBudgetYear(id: string): Promise<void> {
    // TODO: Replace with actual API call
    // return apiClient.delete<void>(`/budget-years/${id}`);
    
    // Mock implementation
    console.log(`Deleting budget year with id: ${id}`);
    return Promise.resolve();
  }
}

export const budgetYearsService = new BudgetYearsService();