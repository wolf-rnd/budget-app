import { apiClient } from './api';
import { Task } from '../types';

export interface CreateTaskRequest {
  description: string;
  important?: boolean;
  completed?: boolean;
}

export interface UpdateTaskRequest {
  description?: string;
  important?: boolean;
  completed?: boolean;
}

export interface TaskFilters {
  completed?: boolean;
  important?: boolean;
  search?: string;
  page?: number;
  limit?: number;
}

export interface TaskSummary {
  totalTasks: number;
  completedTasks: number;
  pendingTasks: number;
  importantTasks: number;
  completionRate: number;
  recentTasks: Task[];
}

class TasksService {
  private baseURL = 'https://messing-family-budget-api.netlify.app/api';

  // Helper method for making API calls
  private async apiCall<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const url = `${this.baseURL}${endpoint}`;
    
    const config: RequestInit = {
      ...options,
      headers: {
        'Content-Type': 'application/json',
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

  // GET /tasks - קבלת כל המשימות (עם פילטרים)
  async getAllTasks(filters?: TaskFilters): Promise<Task[]> {
    try {
      const params = new URLSearchParams();
      
      if (filters?.completed !== undefined) {
        params.append('completed', filters.completed.toString());
      }
      if (filters?.important !== undefined) {
        params.append('important', filters.important.toString());
      }
      if (filters?.search) {
        params.append('search', filters.search);
      }
      if (filters?.page) {
        params.append('page', filters.page.toString());
      }
      if (filters?.limit) {
        params.append('limit', filters.limit.toString());
      }

      const queryString = params.toString();
      const endpoint = queryString ? `/tasks?${queryString}` : '/tasks';
      
      return await this.apiCall<Task[]>(endpoint);
    } catch (error) {
      console.error('Failed to fetch tasks:', error);
      throw error;
    }
  }

  // GET /tasks/summary - קבלת סיכום משימות
  async getTaskSummary(): Promise<TaskSummary> {
    try {
      return await this.apiCall<TaskSummary>('/tasks/summary');
    } catch (error) {
      console.error('Failed to fetch task summary:', error);
      throw error;
    }
  }

  // GET /tasks/:id - קבלת משימה ספציפית
  async getTaskById(id: string): Promise<Task | null> {
    try {
      return await this.apiCall<Task>(`/tasks/${id}`);
    } catch (error) {
      console.error(`Failed to fetch task ${id}:`, error);
      return null;
    }
  }

  // POST /tasks - יצירת משימה חדשה
  async createTask(data: CreateTaskRequest): Promise<Task> {
    try {
      return await this.apiCall<Task>('/tasks', {
        method: 'POST',
        body: JSON.stringify(data),
      });
    } catch (error) {
      console.error('Failed to create task:', error);
      throw error;
    }
  }

  // PUT /tasks/:id - עדכון משימה
  async updateTask(id: string, data: UpdateTaskRequest): Promise<Task> {
    try {
      return await this.apiCall<Task>(`/tasks/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data),
      });
    } catch (error) {
      console.error(`Failed to update task ${id}:`, error);
      throw error;
    }
  }

  // PUT /tasks/:id/toggle - שינוי סטטוס השלמת משימה
  async toggleTaskCompletion(id: string): Promise<Task> {
    try {
      return await this.apiCall<Task>(`/tasks/${id}/toggle`, {
        method: 'PUT',
      });
    } catch (error) {
      console.error(`Failed to toggle task completion ${id}:`, error);
      throw error;
    }
  }

  // DELETE /tasks/:id - מחיקת משימה
  async deleteTask(id: string): Promise<void> {
    try {
      await this.apiCall<void>(`/tasks/${id}`, {
        method: 'DELETE',
      });
    } catch (error) {
      console.error(`Failed to delete task ${id}:`, error);
      throw error;
    }
  }

  // DELETE /tasks/completed/all - מחיקת כל המשימות שהושלמו
  async deleteAllCompletedTasks(): Promise<void> {
    try {
      await this.apiCall<void>('/tasks/completed/all', {
        method: 'DELETE',
      });
    } catch (error) {
      console.error('Failed to delete all completed tasks:', error);
      throw error;
    }
  }
}

export const tasksService = new TasksService();