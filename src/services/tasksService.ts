import { Task } from '../types';
import { ENV } from '../config/env';
import { apiClient } from './apiClient';

export interface CreateTaskRequest {
  title: string;
  important?: boolean;
  completed?: boolean;
}

export interface UpdateTaskRequest {
  title?: string;
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
  total_tasks: number;
  completed_tasks: number;
  pending_tasks: number;
  important_tasks: number;
  completion_rate: number;
  recent_tasks: Task[];
}

class TasksService {
  // GET /tasks - קבלת כל המשימות (עם פילטרים)
  async getAllTasks(filters?: TaskFilters): Promise<Task[]> {
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
  }

  // GET /tasks/summary - קבלת סיכום משימות
  async getTaskSummary(): Promise<TaskSummary> {
    const response = await apiClient.get<TaskSummary>('/tasks/summary');
    return response.data;
  }

  // GET /tasks/:id - קבלת משימה ספציפית
  async getTaskById(id: string): Promise<Task | null> {
    try {
      const response = await apiClient.get<Task>(`/tasks/${id}`);
      return response.data;
    } catch (error) {
      return null;
    }
  }

  // POST /tasks - יצירת משימה חדשה
  async createTask(data: CreateTaskRequest): Promise<Task> {
    const response = await apiClient.post<Task>('/tasks', data);
    return response.data;
  }

  // PUT /tasks/:id - עדכון משימה
  async updateTask(id: string, data: UpdateTaskRequest): Promise<Task> {
    const response = await apiClient.put<Task>(`/tasks/${id}`, data);
    return response.data;
  }

  // PUT /tasks/:id/toggle - שינוי סטטוס השלמת משימה
  async toggleTaskCompletion(id: string): Promise<Task> {
    const response = await apiClient.put<Task>(`/tasks/${id}/toggle`);
    return response.data;
  }

  // DELETE /tasks/:id - מחיקת משימה
  async deleteTask(id: string): Promise<void> {
    await apiClient.delete<void>(`/tasks/${id}`);
  }

  // DELETE /tasks/completed/all - מחיקת כל המשימות שהושלמו
  async deleteAllCompletedTasks(): Promise<void> {
    await apiClient.delete<void>('/tasks/completed/all');
  }
}

export const tasksService = new TasksService();