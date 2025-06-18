import { Task } from '../types';
import { ENV } from '../config/env';
import { apiClient, ApiError } from './apiClient';
import { mockTasks } from './mockData';

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
      
      const response = await apiClient.get<Task[]>(endpoint);
      return response.data;
    } catch (error) {
      if (ENV.DEV_MODE) {
        console.warn('Failed to fetch tasks from API, using mock data:', error);
      }
      
      // Return mock data as fallback
      if (ENV.ENABLE_MOCK_DATA || error instanceof ApiError) {
        return mockTasks;
      }
      
      throw error;
    }
  }

  // GET /tasks/summary - קבלת סיכום משימות
  async getTaskSummary(): Promise<TaskSummary> {
    try {
      const response = await apiClient.get<TaskSummary>('/tasks/summary');
      return response.data;
    } catch (error) {
      if (ENV.DEV_MODE) {
        console.warn('Failed to fetch task summary from API:', error);
      }
      
      if (ENV.ENABLE_MOCK_DATA || error instanceof ApiError) {
        const completedTasks = mockTasks.filter(task => task.completed).length;
        const importantTasks = mockTasks.filter(task => task.important).length;
        
        return {
          totalTasks: mockTasks.length,
          completedTasks,
          pendingTasks: mockTasks.length - completedTasks,
          importantTasks,
          completionRate: mockTasks.length > 0 ? (completedTasks / mockTasks.length) * 100 : 0,
          recentTasks: mockTasks
        };
      }
      
      throw error;
    }
  }

  // GET /tasks/:id - קבלת משימה ספציפית
  async getTaskById(id: string): Promise<Task | null> {
    try {
      const response = await apiClient.get<Task>(`/tasks/${id}`);
      return response.data;
    } catch (error) {
      if (ENV.DEV_MODE) {
        console.warn(`Failed to fetch task ${id} from API:`, error);
      }
      
      if (ENV.ENABLE_MOCK_DATA || error instanceof ApiError) {
        return mockTasks.find(task => task.id === id) || null;
      }
      
      return null;
    }
  }

  // POST /tasks - יצירת משימה חדשה
  async createTask(data: CreateTaskRequest): Promise<Task> {
    try {
      const response = await apiClient.post<Task>('/tasks', data);
      return response.data;
    } catch (error) {
      if (ENV.DEV_MODE) {
        console.error('Failed to create task:', error);
      }
      throw error;
    }
  }

  // PUT /tasks/:id - עדכון משימה
  async updateTask(id: string, data: UpdateTaskRequest): Promise<Task> {
    try {
      const response = await apiClient.put<Task>(`/tasks/${id}`, data);
      return response.data;
    } catch (error) {
      if (ENV.DEV_MODE) {
        console.error(`Failed to update task ${id}:`, error);
      }
      throw error;
    }
  }

  // PUT /tasks/:id/toggle - שינוי סטטוס השלמת משימה
  async toggleTaskCompletion(id: string): Promise<Task> {
    try {
      const response = await apiClient.put<Task>(`/tasks/${id}/toggle`);
      return response.data;
    } catch (error) {
      if (ENV.DEV_MODE) {
        console.error(`Failed to toggle task completion ${id}:`, error);
      }
      throw error;
    }
  }

  // DELETE /tasks/:id - מחיקת משימה
  async deleteTask(id: string): Promise<void> {
    try {
      await apiClient.delete<void>(`/tasks/${id}`);
    } catch (error) {
      if (ENV.DEV_MODE) {
        console.error(`Failed to delete task ${id}:`, error);
      }
      throw error;
    }
  }

  // DELETE /tasks/completed/all - מחיקת כל המשימות שהושלמו
  async deleteAllCompletedTasks(): Promise<void> {
    try {
      await apiClient.delete<void>('/tasks/completed/all');
    } catch (error) {
      if (ENV.DEV_MODE) {
        console.error('Failed to delete all completed tasks:', error);
      }
      throw error;
    }
  }
}

export const tasksService = new TasksService();