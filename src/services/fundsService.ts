import { apiClient } from './api';
import { Fund } from '../types';

// Mock data import
import budgetData from '../data/budget.json';
import fundBudgetsData from '../data/fundBudgets.json';

export interface CreateFundRequest {
  name: string;
  type: 'monthly' | 'annual' | 'savings';
  level: 1 | 2 | 3;
  includeInBudget: boolean;
  categories: string[];
}

export interface UpdateFundRequest {
  name?: string;
  type?: 'monthly' | 'annual' | 'savings';
  level?: 1 | 2 | 3;
  includeInBudget?: boolean;
  categories?: string[];
}

export interface UpdateFundBudgetRequest {
  amount: number;
  amountGiven?: number;
  spent?: number;
}

class FundsService {
  // GET / - קבלת כל הקופות (עם אפשרות לסינון לפי שנת תקציב)
  async getAllFunds(budgetYearId?: string): Promise<Fund[]> {
    // TODO: Replace with actual API call
    // const params = budgetYearId ? `?budgetYearId=${budgetYearId}` : '';
    // return apiClient.get<Fund[]>(`/funds${params}`);
    
    // Mock implementation
    return Promise.resolve(budgetData.funds);
  }

  // GET /:id - קבלת קופה ספציפית
  async getFundById(id: string): Promise<Fund | null> {
    // TODO: Replace with actual API call
    // return apiClient.get<Fund>(`/funds/${id}`);
    
    // Mock implementation
    const fund = budgetData.funds.find(f => f.id === id);
    return Promise.resolve(fund || null);
  }

  // POST / - יצירת קופה חדשה
  async createFund(data: CreateFundRequest): Promise<Fund> {
    // TODO: Replace with actual API call
    // return apiClient.post<Fund>('/funds', data);
    
    // Mock implementation
    const newFund: Fund = {
      id: Date.now().toString(),
      amount: 0,
      ...data
    };
    
    return Promise.resolve(newFund);
  }

  // PUT /:id - עדכון קופה
  async updateFund(id: string, data: UpdateFundRequest): Promise<Fund> {
    // TODO: Replace with actual API call
    // return apiClient.put<Fund>(`/funds/${id}`, data);
    
    // Mock implementation
    const existingFund = budgetData.funds.find(f => f.id === id);
    if (!existingFund) {
      throw new Error('Fund not found');
    }
    
    const updatedFund: Fund = {
      ...existingFund,
      ...data
    };
    
    return Promise.resolve(updatedFund);
  }

  // PUT /:id/budget/:budgetYearId - עדכון תקציב קופה לשנה ספציפית
  async updateFundBudget(id: string, budgetYearId: string, data: UpdateFundBudgetRequest): Promise<Fund> {
    // TODO: Replace with actual API call
    // return apiClient.put<Fund>(`/funds/${id}/budget/${budgetYearId}`, data);
    
    // Mock implementation
    const existingFund = budgetData.funds.find(f => f.id === id);
    if (!existingFund) {
      throw new Error('Fund not found');
    }
    
    const updatedFund: Fund = {
      ...existingFund,
      amount: data.amount,
      amountGiven: data.amountGiven,
      spent: data.spent
    };
    
    return Promise.resolve(updatedFund);
  }

  // PUT /:id/deactivate - השבתת קופה
  async deactivateFund(id: string): Promise<Fund> {
    // TODO: Replace with actual API call
    // return apiClient.put<Fund>(`/funds/${id}/deactivate`);
    
    // Mock implementation
    const existingFund = budgetData.funds.find(f => f.id === id);
    if (!existingFund) {
      throw new Error('Fund not found');
    }
    
    // Note: Add isActive field to Fund type if needed
    return Promise.resolve(existingFund);
  }

  // PUT /:id/activate - הפעלת קופה
  async activateFund(id: string): Promise<Fund> {
    // TODO: Replace with actual API call
    // return apiClient.put<Fund>(`/funds/${id}/activate`);
    
    // Mock implementation
    const existingFund = budgetData.funds.find(f => f.id === id);
    if (!existingFund) {
      throw new Error('Fund not found');
    }
    
    return Promise.resolve(existingFund);
  }

  // DELETE /:id - מחיקת קופה
  async deleteFund(id: string): Promise<void> {
    // TODO: Replace with actual API call
    // return apiClient.delete<void>(`/funds/${id}`);
    
    // Mock implementation
    console.log(`Deleting fund with id: ${id}`);
    return Promise.resolve();
  }
}

export const fundsService = new FundsService();