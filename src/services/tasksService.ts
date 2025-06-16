import { apiClient } from './api';
import { Task } from '../types';

// Mock data import
import tasksData from '../data/tasks.json';

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
  // GET / - קבלת כל המשימות (עם פילטרים)
  async getAllTasks(filters?: TaskFilters): Promise<Task[]> {
    // TODO: Replace with actual API call
    // const params = new URLSearchParams();
    // if (filters?.completed !== undefined) params.append('completed', filters.completed.toString());
    // if (filters?.important !== undefined) params.append('important', filters.important.toString());
    // if (filters?.search) params.append('search', filters.search);
    // if (filters?.page) params.append('page', filters.page.toString());
    // if (filters?.limit) params.append('limit', filters.limit.toString());
    // return apiClient.get<Task[]>(`/tasks?${params.toString()}`);
    
    // Mock implementation
    let filteredTasks = tasksData.tasks;
    
    if (filters?.completed !== undefined) {
      filteredTasks = filteredTasks.filter(task => task.completed === filters.completed);
    }
    if (filters?.important !== undefined) {
      filteredTasks = filteredTasks.filter(task => task.important === filters.important);
    }
    if (filters?.search) {
      filteredTasks = filteredTasks.filter(task => 
        task.description.toLowerCase().includes(filters.search!.toLowerCase())
      );
    }
    
    return Promise.resolve(filteredTasks);
  }

  // GET /summary - קבלת סיכום משימות
  async getTaskSummary(): Promise<TaskSummary> {
    // TODO: Replace with actual API call
    // return apiClient.get<TaskSummary>('/tasks/summary');
    
    // Mock implementation
    const totalTasks = tasksData.tasks.length;
    const completedTasks = tasksData.tasks.filter(task => task.completed).length;
    const pendingTasks = totalTasks - completedTasks;
    const importantTasks = tasksData.tasks.filter(task => task.important).length;
    const completionRate = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;
    
    return Promise.resolve({
      totalTasks,
      completedTasks,
      pendingTasks,
      importantTasks,
      completionRate,
      recentTasks: tasksData.tasks.slice(0, 5)
    });
  }

  // GET /:id - קבלת משימה ספציפית
  async getTaskById(id: string): Promise<Task | null> {
    // TODO: Replace with actual API call
    // return apiClient.get<Task>(`/tasks/${id}`);
    
    // Mock implementation
    const task = tasksData.tasks.find(t => t.id === id);
    return Promise.resolve(task || null);
  }

  // POST / - יצירת משימה חדשה
  async createTask(data: CreateTaskRequest): Promise<Task> {
    // TODO: Replace with actual API call
    // return apiClient.post<Task>('/tasks', data);
    
    // Mock implementation
    const newTask: Task = {
      id: Date.now().toString(),
      description: data.description,
      important: data.important || false,
      completed: data.completed || false
    };
    
    return Promise.resolve(newTask);
  }

  // PUT /:id - עדכון משימה
  async updateTask(id: string, data: UpdateTaskRequest): Promise<Task> {
    // TODO: Replace with actual API call
    // return apiClient.put<Task>(`/tasks/${id}`, data);
    
    // Mock implementation
    const existingTask = tasksData.tasks.find(t => t.id === id);
    if (!existingTask) {
      throw new Error('Task not found');
    }
    
    const updatedTask: Task = {
      ...existingTask,
      ...data
    };
    
    return Promise.resolve(updatedTask);
  }

  // PUT /:id/toggle - שינוי סטטוס השלמת משימה
  async toggleTaskCompletion(id: string): Promise<Task> {
    // TODO: Replace with actual API call
    // return apiClient.put<Task>(`/tasks/${id}/toggle`);
    
    // Mock implementation
    const existingTask = tasksData.tasks.find(t => t.id === id);
    if (!existingTask) {
      throw new Error('Task not found');
    }
    
    const toggledTask: Task = {
      ...existingTask,
      completed: !existingTask.completed
    };
    
    return Promise.resolve(toggledTask);
  }

  // DELETE /:id - מחיקת משימה
  async deleteTask(id: string): Promise<void> {
    // TODO: Replace with actual API call
    // return apiClient.delete<void>(`/tasks/${id}`);
    
    // Mock implementation
    console.log(`Deleting task with id: ${id}`);
    return Promise.resolve();
  }

  // DELETE /completed/all - מחיקת כל המשימות שהושלמו
  async deleteAllCompletedTasks(): Promise<void> {
    // TODO: Replace with actual API call
    // return apiClient.delete<void>('/tasks/completed/all');
    
    // Mock implementation
    console.log('Deleting all completed tasks');
    return Promise.resolve();
  }
}

export const tasksService = new TasksService();