import { apiClient } from './api';
import { Debt } from '../types';

// Mock data import
import debtsData from '../data/debts.json';

export interface CreateDebtRequest {
  description: string;
  amount: number;
  note?: string;
  type: 'owed_to_me' | 'i_owe';
  isPaid?: boolean;
}

export interface UpdateDebtRequest {
  description?: string;
  amount?: number;
  note?: string;
  type?: 'owed_to_me' | 'i_owe';
  isPaid?: boolean;
}

export interface DebtFilters {
  type?: 'owed_to_me' | 'i_owe';
  isPaid?: boolean;
  search?: string;
  page?: number;
  limit?: number;
}

export interface DebtSummary {
  totalDebtsIOwe: number;
  totalDebtsOwedToMe: number;
  netDebtPosition: number;
  paidDebts: number;
  unpaidDebts: number;
  recentDebts: Debt[];
}

class DebtsService {
  // GET / - קבלת כל החובות (עם פילטרים)
  async getAllDebts(filters?: DebtFilters): Promise<Debt[]> {
    // TODO: Replace with actual API call
    // const params = new URLSearchParams();
    // if (filters?.type) params.append('type', filters.type);
    // if (filters?.isPaid !== undefined) params.append('isPaid', filters.isPaid.toString());
    // if (filters?.search) params.append('search', filters.search);
    // if (filters?.page) params.append('page', filters.page.toString());
    // if (filters?.limit) params.append('limit', filters.limit.toString());
    // return apiClient.get<Debt[]>(`/debts?${params.toString()}`);
    
    // Mock implementation
    let filteredDebts = debtsData.debts;
    
    if (filters?.type) {
      filteredDebts = filteredDebts.filter(debt => debt.type === filters.type);
    }
    if (filters?.search) {
      filteredDebts = filteredDebts.filter(debt => 
        debt.description.toLowerCase().includes(filters.search!.toLowerCase())
      );
    }
    
    return Promise.resolve(filteredDebts);
  }

  // GET /summary - קבלת סיכום חובות
  async getDebtSummary(): Promise<DebtSummary> {
    // TODO: Replace with actual API call
    // return apiClient.get<DebtSummary>('/debts/summary');
    
    // Mock implementation
    const totalDebtsIOwe = debtsData.debts
      .filter(debt => debt.type === 'i_owe' || !debt.type)
      .reduce((sum, debt) => sum + debt.amount, 0);
    
    const totalDebtsOwedToMe = debtsData.debts
      .filter(debt => debt.type === 'owed_to_me')
      .reduce((sum, debt) => sum + debt.amount, 0);
    
    return Promise.resolve({
      totalDebtsIOwe,
      totalDebtsOwedToMe,
      netDebtPosition: totalDebtsOwedToMe - totalDebtsIOwe,
      paidDebts: 0,
      unpaidDebts: debtsData.debts.length,
      recentDebts: debtsData.debts.slice(0, 5)
    });
  }

  // GET /:id - קבלת חוב ספציפי
  async getDebtById(id: string): Promise<Debt | null> {
    // TODO: Replace with actual API call
    // return apiClient.get<Debt>(`/debts/${id}`);
    
    // Mock implementation
    const debt = debtsData.debts.find(d => d.id === id);
    return Promise.resolve(debt || null);
  }

  // POST / - יצירת חוב חדש
  async createDebt(data: CreateDebtRequest): Promise<Debt> {
    // TODO: Replace with actual API call
    // return apiClient.post<Debt>('/debts', data);
    
    // Mock implementation
    const newDebt: Debt = {
      id: Date.now().toString(),
      description: data.description,
      amount: data.amount,
      note: data.note || '',
      type: data.type
    };
    
    return Promise.resolve(newDebt);
  }

  // PUT /:id - עדכון חוב
  async updateDebt(id: string, data: UpdateDebtRequest): Promise<Debt> {
    // TODO: Replace with actual API call
    // return apiClient.put<Debt>(`/debts/${id}`, data);
    
    // Mock implementation
    const existingDebt = debtsData.debts.find(d => d.id === id);
    if (!existingDebt) {
      throw new Error('Debt not found');
    }
    
    const updatedDebt: Debt = {
      ...existingDebt,
      ...data
    };
    
    return Promise.resolve(updatedDebt);
  }

  // PUT /:id/pay - סימון חוב כשולם
  async markDebtAsPaid(id: string): Promise<Debt> {
    // TODO: Replace with actual API call
    // return apiClient.put<Debt>(`/debts/${id}/pay`);
    
    // Mock implementation
    const existingDebt = debtsData.debts.find(d => d.id === id);
    if (!existingDebt) {
      throw new Error('Debt not found');
    }
    
    const paidDebt: Debt = {
      ...existingDebt,
      // Note: Add isPaid field to Debt type if needed
    };
    
    return Promise.resolve(paidDebt);
  }

  // PUT /:id/unpay - ביטול סימון שולם
  async markDebtAsUnpaid(id: string): Promise<Debt> {
    // TODO: Replace with actual API call
    // return apiClient.put<Debt>(`/debts/${id}/unpay`);
    
    // Mock implementation
    const existingDebt = debtsData.debts.find(d => d.id === id);
    if (!existingDebt) {
      throw new Error('Debt not found');
    }
    
    return Promise.resolve(existingDebt);
  }

  // DELETE /:id - מחיקת חוב
  async deleteDebt(id: string): Promise<void> {
    // TODO: Replace with actual API call
    // return apiClient.delete<void>(`/debts/${id}`);
    
    // Mock implementation
    console.log(`Deleting debt with id: ${id}`);
    return Promise.resolve();
  }
}

export const debtsService = new DebtsService();