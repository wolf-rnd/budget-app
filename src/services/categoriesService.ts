import { ENV } from '../config/env';

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

  // GET /categories - קבלת כל הקטגוריות
  async getAllCategories(): Promise<Category[]> {
    try {
      const response = await this.apiCall<Category[]>('/categories');
      return response.data;
    } catch (error) {
      if (ENV.DEV_MODE) {
        console.error('Failed to fetch categories:', error);
      }
      throw error;
    }
  }

  // GET /categories/fund/:fundId - קבלת קטגוריות לפי קופה
  async getCategoriesByFund(fundId: string): Promise<Category[]> {
    try {
      return await this.apiCall<Category[]>(`/categories/fund/${fundId}`);
    } catch (error) {
      if (ENV.DEV_MODE) {
        console.error(`Failed to fetch categories for fund ${fundId}:`, error);
      }
      throw error;
    }
  }

  // GET /categories/:id - קבלת קטגוריה ספציפית
  async getCategoryById(id: string): Promise<Category | null> {
    try {
      return await this.apiCall<Category>(`/categories/${id}`);
    } catch (error) {
      if (ENV.DEV_MODE) {
        console.error(`Failed to fetch category ${id}:`, error);
      }
      return null;
    }
  }

  // POST /categories - יצירת קטגוריה חדשה
  async createCategory(data: CreateCategoryRequest): Promise<Category> {
    try {
      return await this.apiCall<Category>('/categories', {
        method: 'POST',
        body: JSON.stringify(data),
      });
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
      return await this.apiCall<Category>(`/categories/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data),
      });
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
      return await this.apiCall<Category>(`/categories/${id}/deactivate`, {
        method: 'PUT',
      });
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
      return await this.apiCall<Category>(`/categories/${id}/activate`, {
        method: 'PUT',
      });
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
      await this.apiCall<void>(`/categories/${id}`, {
        method: 'DELETE',
      });
    } catch (error) {
      if (ENV.DEV_MODE) {
        console.error(`Failed to delete category ${id}:`, error);
      }
      throw error;
    }
  }
}

export const categoriesService = new CategoriesService();