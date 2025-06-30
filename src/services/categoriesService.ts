import { ENV } from '../config/env';
import { apiClient } from './apiClient';

export interface GetCategoryRequest {
  fund: string;
  color_class: string | null; // צבע HEX שמגיע מהשרת
  created_at: string;
  fund_id: string;
  funds: {
    name: string;
    type: string;
    color_class: string | null;
  };
  id: string;
  is_active: boolean;
  name: string;
  updated_at: string;
  user_id: string;
}

export interface CreateCategoryRequest {
  name: string;
  fund_id: string;
  color_class?: string | null; // צבע HEX אופציונלי
}

export interface UpdateCategoryRequest {
  name?: string;
  fund_id?: string;
  color_class?: string | null;
}

class CategoriesService {
  // GET /categories - קבלת כל הקטגוריות
  async getAllCategories(): Promise<GetCategoryRequest[]> {
    const response = await apiClient.get<GetCategoryRequest[]>('/categories');
    return response.data;
  }

  // GET /categories/fund/:fundId - קבלת קטגוריות לפי קופה
  async getCategoriesByFund(fundId: string): Promise<GetCategoryRequest[]> {
    const response = await apiClient.get<GetCategoryRequest[]>(`/categories/fund/${fundId}`);
    return response.data;
  }

  // GET /categories/:id - קבלת קטגוריה ספציפית
  async getCategoryById(id: string): Promise<GetCategoryRequest | null> {
    try {
      const response = await apiClient.get<GetCategoryRequest>(`/categories/${id}`);
      return response.data;
    } catch (error) {
      return null;
    }
  }

  // POST /categories - יצירת קטגוריה חדשה
  async createCategory(data: CreateCategoryRequest): Promise<GetCategoryRequest> {
    const response = await apiClient.post<GetCategoryRequest>('/categories', data);
    return response.data;
  }

  // PUT /categories/:id - עדכון קטגוריה
  async updateCategory(id: string, data: UpdateCategoryRequest): Promise<GetCategoryRequest> {
    const response = await apiClient.put<GetCategoryRequest>(`/categories/${id}`, data);
    return response.data;
  }

  // PUT /categories/:id/deactivate - השבתת קטגוריה
  async deactivateCategory(id: string): Promise<GetCategoryRequest> {
    const response = await apiClient.put<GetCategoryRequest>(`/categories/${id}/deactivate`);
    return response.data;
  }

  // PUT /categories/:id/activate - הפעלת קטגוריה
  async activateCategory(id: string): Promise<GetCategoryRequest> {
    const response = await apiClient.put<GetCategoryRequest>(`/categories/${id}/activate`);
    return response.data;
  }

  // DELETE /categories/:id - מחיקת קטגוריה
  async deleteCategory(id: string): Promise<void> {
    await apiClient.delete<void>(`/categories/${id}`);
  }
}

export const categoriesService = new CategoriesService();