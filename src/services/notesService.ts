import { ENV } from '../config/env';
import { apiClient } from './apiClient';

export interface Note {
  id: string;
  title: string;
  content: string;
  created_at: string;
  updated_at: string;
  user_id: string;
}

export interface CreateNoteRequest {
  title: string;
  content: string;
}

export interface UpdateNoteRequest {
  title?: string;
  content?: string;
}

export interface NoteFilters {
  search?: string;
  page?: number;
  limit?: number;
}

class NotesService {
  // GET /notes - קבלת כל הפתקים (עם פילטרים)
  async getAllNotes(filters?: NoteFilters): Promise<Note[]> {
    const params = new URLSearchParams();
    
    if (filters?.search) params.append('search', filters.search);
    if (filters?.page) params.append('page', filters.page.toString());
    if (filters?.limit) params.append('limit', filters.limit.toString());

    const queryString = params.toString();
    const endpoint = queryString ? `/notes?${queryString}` : '/notes';
    
    const response = await apiClient.get<Note[]>(endpoint);
    return response.data;
  }

  // GET /notes/:id - קבלת פתק ספציפי
  async getNoteById(id: string): Promise<Note | null> {
    try {
      const response = await apiClient.get<Note>(`/notes/${id}`);
      return response.data;
    } catch (error) {
      return null;
    }
  }

  // POST /notes - יצירת פתק חדש
  async createNote(data: CreateNoteRequest): Promise<Note> {
    const response = await apiClient.post<Note>('/notes', data);
    return response.data;
  }

  // PUT /notes/:id - עדכון פתק
  async updateNote(id: string, data: UpdateNoteRequest): Promise<Note> {
    const response = await apiClient.put<Note>(`/notes/${id}`, data);
    return response.data;
  }

  // DELETE /notes/:id - מחיקת פתק
  async deleteNote(id: string): Promise<void> {
    await apiClient.delete<void>(`/notes/${id}`);
  }
}

export const notesService = new NotesService();