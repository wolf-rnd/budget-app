import { ENV } from '../config/env';
import { apiClient, ApiError } from './apiClient';
import { mockCategories } from './mockData';

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
    try {
      const response = await apiClient.get<Category[]>('/categories');
      return response.data;
    } catch (error) {
      if (ENV.DEV_MODE) {
        console.warn('Failed to fetch categories from API, using mock data:', error);
      }
      
      // Return mock data as fallback
      if (ENV.ENABLE_MOCK_DATA || error instanceof ApiError) {
        return mockCategories;
      }
      
      throw error;
    }
  }

  // GET /categories/fund/:fundId - קבלת קטגוריות לפי קופה
  async getCategoriesByFund(fundId: string): Promise<Category[]> {
    try {
      const response = await apiClient.get<Category[]>(`/categories/fund/${fundId}`);
      return response.data;
    } catch (error) {
      if (ENV.DEV_MODE) {
        console.warn(`Failed to fetch categories for fund ${fundId} from API:`, error);
      }
      
      if (ENV.ENABLE_MOCK_DATA || error instanceof ApiError) {
        return mockCategories.filter(cat => cat.fundId === fundId);
      }
      
      throw error;
    }
  }

  // GET /categories/:id - קבלת קטגוריה ספציפית
  async getCategoryById(id: string): Promise<Category | null> {
    try {
      const response = await apiClient.get<Category>(`/categories/${id}`);
      return response.data;
    } catch (error) {
      if (ENV.DEV_MODE) {
        console.warn(`Failed to fetch category ${id} from API:`, error);
      }
      
      if (ENV.ENABLE_MOCK_DATA || error instanceof ApiError) {
        return mockCategories.find(cat => cat.id === id) || null;
      }
      
      return null;
    }
  }

  // POST /categories - יצירת קטגוריה חדשה
  async createCategory(data: CreateCategoryRequest): Promise<Category> {
    try {
      const response = await apiClient.post<Category>('/categories', data);
      return response.data;
    } catch (error) {
      if (ENV.DEV_MODE) {
        console.error('Failed to create category:', error);
      }
      throw error;
    }
  }

  // PUT /categories/:id - עדכון קטגוריה
  async updateCategory(id: string, data: UpdateCategoryRequest): Promise<Category> {
    try {
      const response = await apiClient.put<Category>(`/categories/${id}`, data);
      return response.data;
    } catch (error) {
      if (ENV.DEV_MODE) {
        console.error(`Failed to update category ${id}:`, error);
      }
      throw error;
    }
  }

  // PUT /categories/:id/deactivate - השבתת קטגוריה
  async deactivateCategory(id: string): Promise<Category> {
    try {
      const response = await apiClient.put<Category>(`/categories/${id}/deactivate`);
      return response.data;
    } catch (error) {
      if (ENV.DEV_MODE) {
        console.error(`Failed to deactivate category ${id}:`, error);
      }
      throw error;
    }
  }

  // PUT /categories/:id/activate - הפעלת קטגוריה
  async activateCategory(id: string): Promise<Category> {
    try {
      const response = await apiClient.put<Category>(`/categories/${id}/activate`);
      return response.data;
    } catch (error) {
      if (ENV.DEV_MODE) {
        console.error(`Failed to activate category ${id}:`, error);
      }
      throw error;
    }
  }

  // DELETE /categories/:id - מחיקת קטגוריה
  async deleteCategory(id: string): Promise<void> {
    try {
      await apiClient.delete<void>(`/categories/${id}`);
    } catch (error) {
      if (ENV.DEV_MODE) {
        console.error(`Failed to delete category ${id}:`, error);
      }
      throw error;
    }
  }
}

export const categoriesService = new CategoriesService();