import { ENV } from '../config/env';
import { apiClient } from './apiClient';

export interface Category {
  id?: string;
  name: string;
  fund: string;
  fundId?: string;
  isActive?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateCategoryRequest {
  name: string;
  fundId: string;
}

export interface UpdateCategoryRequest {
  name?: string;
  fundId?: string;
}

class CategoriesService {
  // GET /categories - קבלת כל הקטגוריות
  async getAllCategories(): Promise<Category[]> {
    const response = await apiClient.get<Category[]>('/categories');
    return response.data;
  }

  // GET /categories/fund/:fundId - קבלת קטגוריות לפי קופה
  async getCategoriesByFund(fundId: string): Promise<Category[]> {
    const response = await apiClient.get<Category[]>(`/categories/fund/${fundId}`);
    return response.data;
  }

  // GET /categories/:id - קבלת קטגוריה ספציפית
  async getCategoryById(id: string): Promise<Category | null> {
    try {
      const response = await apiClient.get<Category>(`/categories/${id}`);
      return response.data;
    } catch (error) {
      return null;
    }
  }

  // POST /categories - יצירת קטגוריה חדשה
  async createCategory(data: CreateCategoryRequest): Promise<Category> {
    const response = await apiClient.post<Category>('/categories', data);
    return response.data;
  }

  // PUT /categories/:id - עדכון קטגוריה
  async updateCategory(id: string, data: UpdateCategoryRequest): Promise<Category> {
    const response = await apiClient.put<Category>(`/categories/${id}`, data);
    return response.data;
  }

  // PUT /categories/:id/deactivate - השבתת קטגוריה
  async deactivateCategory(id: string): Promise<Category> {
    const response = await apiClient.put<Category>(`/categories/${id}/deactivate`);
    return response.data;
  }

  // PUT /categories/:id/activate - הפעלת קטגוריה
  async activateCategory(id: string): Promise<Category> {
    const response = await apiClient.put<Category>(`/categories/${id}/activate`);
    return response.data;
  }

  // DELETE /categories/:id - מחיקת קטגוריה
  async deleteCategory(id: string): Promise<void> {
    await apiClient.delete<void>(`/categories/${id}`);
  }
}

export const categoriesService = new CategoriesService();