import { Fund } from '../types';
import { ENV } from '../config/env';
import { apiClient } from './apiClient';

export interface CreateFundRequest {
  name: string;
  type: 'monthly' | 'annual' | 'savings';
  level: 1 | 2 | 3;
  include_in_budget: boolean;
  categories: string[];
}

export interface UpdateFundRequest {
  name?: string;
  type?: 'monthly' | 'annual' | 'savings';
  level?: 1 | 2 | 3;
  include_in_budget?: boolean;
  categories?: string[];
}

export interface UpdateFundBudgetRequest {
  amount: number;
  amountGiven?: number;
  spent?: number;
}

class FundsService {
  // GET /funds - קבלת כל הקופות (עם אפשרות לסינון לפי שנת תקציב)
  async getAllFunds(budgetYearId?: string): Promise<Fund[]> {
    const params = budgetYearId ? `?budgetYearId=${budgetYearId}` : '';
    
    const response = await apiClient.get<Fund[]>(`/funds${params}`);
    return response.data;
  }

  // GET /funds/:id - קבלת קופה ספציפית
  async getFundById(id: string): Promise<Fund | null> {
    try {
      const response = await apiClient.get<Fund>(`/funds/${id}`);
      return response.data;
    } catch (error) {
      return null;
    }
  }

  // POST /funds - יצירת קופה חדשה
  async createFund(data: CreateFundRequest): Promise<Fund> {
    const response = await apiClient.post<Fund>('/funds', data);
    return response.data;
  }

  // PUT /funds/:id - עדכון קופה
  async updateFund(id: string, data: UpdateFundRequest): Promise<Fund> {
    const response = await apiClient.put<Fund>(`/funds/${id}`, data);
    return response.data;
  }

  // PUT /funds/:id/budget/:budgetYearId - עדכון תקציב קופה לשנה ספציפית
  async updateFundBudget(id: string, budgetYearId: string, data: UpdateFundBudgetRequest): Promise<Fund> {
    const response = await apiClient.put<Fund>(`/funds/${id}/budget/${budgetYearId}`, data);
    return response.data;
  }

  // PUT /funds/:id/deactivate - השבתת קופה
  async deactivateFund(id: string): Promise<Fund> {
    const response = await apiClient.put<Fund>(`/funds/${id}/deactivate`);
    return response.data;
  }

  // PUT /funds/:id/activate - הפעלת קופה
  async activateFund(id: string): Promise<Fund> {
    const response = await apiClient.put<Fund>(`/funds/${id}/activate`);
    return response.data;
  }

  // DELETE /funds/:id - מחיקת קופה
  async deleteFund(id: string): Promise<void> {
    await apiClient.delete<void>(`/funds/${id}`);
  }
}

export const fundsService = new FundsService();