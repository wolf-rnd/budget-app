import { apiClient } from './api';

// Mock data import
import categoriesData from '../data/categories.json';

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
  // GET / - קבלת כל הקטגוריות
  async getAllCategories(): Promise<Category[]> {
    // TODO: Replace with actual API call
    // return apiClient.get<Category[]>('/categories');
    
    // Mock implementation
    return Promise.resolve(categoriesData.categories);
  }

  // GET /fund/:fundId - קבלת קטגוריות לפי קופה
  async getCategoriesByFund(fundId: string): Promise<Category[]> {
    // TODO: Replace with actual API call
    // return apiClient.get<Category[]>(`/categories/fund/${fundId}`);
    
    // Mock implementation
    const categories = categoriesData.categories.filter(cat => cat.fund === fundId);
    return Promise.resolve(categories);
  }

  // GET /:id - קבלת קטגוריה ספציפית
  async getCategoryById(id: string): Promise<Category | null> {
    // TODO: Replace with actual API call
    // return apiClient.get<Category>(`/categories/${id}`);
    
    // Mock implementation
    const category = categoriesData.categories.find(cat => cat.id === id);
    return Promise.resolve(category || null);
  }

  // POST / - יצירת קטגוריה חדשה
  async createCategory(data: CreateCategoryRequest): Promise<Category> {
    // TODO: Replace with actual API call
    // return apiClient.post<Category>('/categories', data);
    
    // Mock implementation
    const newCategory: Category = {
      id: Date.now().toString(),
      name: data.name,
      fund: data.fundId,
      fundId: data.fundId,
      isActive: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    return Promise.resolve(newCategory);
  }

  // PUT /:id - עדכון קטגוריה
  async updateCategory(id: string, data: UpdateCategoryRequest): Promise<Category> {
    // TODO: Replace with actual API call
    // return apiClient.put<Category>(`/categories/${id}`, data);
    
    // Mock implementation
    const existingCategory = categoriesData.categories.find(cat => cat.id === id);
    if (!existingCategory) {
      throw new Error('Category not found');
    }
    
    const updatedCategory: Category = {
      ...existingCategory,
      ...data,
      updatedAt: new Date().toISOString()
    };
    
    return Promise.resolve(updatedCategory);
  }

  // PUT /:id/deactivate - השבתת קטגוריה
  async deactivateCategory(id: string): Promise<Category> {
    // TODO: Replace with actual API call
    // return apiClient.put<Category>(`/categories/${id}/deactivate`);
    
    // Mock implementation
    const existingCategory = categoriesData.categories.find(cat => cat.id === id);
    if (!existingCategory) {
      throw new Error('Category not found');
    }
    
    const deactivatedCategory: Category = {
      ...existingCategory,
      isActive: false,
      updatedAt: new Date().toISOString()
    };
    
    return Promise.resolve(deactivatedCategory);
  }

  // PUT /:id/activate - הפעלת קטגוריה
  async activateCategory(id: string): Promise<Category> {
    // TODO: Replace with actual API call
    // return apiClient.put<Category>(`/categories/${id}/activate`);
    
    // Mock implementation
    const existingCategory = categoriesData.categories.find(cat => cat.id === id);
    if (!existingCategory) {
      throw new Error('Category not found');
    }
    
    const activatedCategory: Category = {
      ...existingCategory,
      isActive: true,
      updatedAt: new Date().toISOString()
    };
    
    return Promise.resolve(activatedCategory);
  }

  // DELETE /:id - מחיקת קטגוריה
  async deleteCategory(id: string): Promise<void> {
    // TODO: Replace with actual API call
    // return apiClient.delete<void>(`/categories/${id}`);
    
    // Mock implementation
    console.log(`Deleting category with id: ${id}`);
    return Promise.resolve();
  }
}

export const categoriesService = new CategoriesService();