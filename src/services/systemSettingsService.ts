import { ENV } from '../config/env';
import { apiClient } from './apiClient';

export interface SystemSetting {
  id: string;
  user_id: string;
  setting_key: string;
  setting_value: string;
  data_type: 'string' | 'number' | 'boolean' | 'json';
  parsed_value: any;
  created_at: string;
  updated_at: string;
}

export interface CreateSystemSettingRequest {
  setting_key: string;
  setting_value: string | number | boolean | object;
  data_type?: 'string' | 'number' | 'boolean' | 'json';
}

export interface UpdateSystemSettingRequest {
  setting_key?: string;
  setting_value?: string | number | boolean | object;
  data_type?: 'string' | 'number' | 'boolean' | 'json';
}

export interface SystemSettingsFilters {
  setting_key?: string;
  data_type?: 'string' | 'number' | 'boolean' | 'json';
  search?: string;
  page?: number;
  limit?: number;
}

export interface SystemSettingsResponse {
  data: SystemSetting[];
  total: number;
  page: number;
  limit: number;
  hasMore: boolean;
}

class SystemSettingsService {
  // GET /system-settings - קבלת כל הגדרות המערכת (עם פילטרים)
  async getAllSettings(filters?: SystemSettingsFilters): Promise<SystemSettingsResponse | SystemSetting[]> {
    const params = new URLSearchParams();
    
    if (filters?.setting_key) params.append('setting_key', filters.setting_key);
    if (filters?.data_type) params.append('data_type', filters.data_type);
    if (filters?.search) params.append('search', filters.search);
    if (filters?.page) params.append('page', filters.page.toString());
    if (filters?.limit) params.append('limit', filters.limit.toString());

    const queryString = params.toString();
    const endpoint = queryString ? `/system-settings?${queryString}` : '/system-settings';
    const response = await apiClient.get<SystemSettingsResponse | SystemSetting[]>(endpoint);
    return response.data;
  }

  // GET /system-settings/by-type/:dataType - קבלת הגדרות לפי סוג נתונים
  async getSettingsByType(dataType: 'string' | 'number' | 'boolean' | 'json'): Promise<SystemSetting[]> {
    const response = await apiClient.get<SystemSetting[]>(`/system-settings/by-type/${dataType}`);
    return response.data;
  }

  // GET /system-settings/key/:settingKey - קבלת הגדרה לפי מפתח
  async getSettingByKey(settingKey: string): Promise<SystemSetting | null> {
    try {
      const response = await apiClient.get<SystemSetting>(`/system-settings/key/${settingKey}`);
      return response.data;
    } catch (error) {
      return null;
    }
  }

  // GET /system-settings/:id - קבלת הגדרה ספציפית
  async getSettingById(id: string): Promise<SystemSetting | null> {
    try {
      const response = await apiClient.get<SystemSetting>(`/system-settings/${id}`);
      return response.data;
    } catch (error) {
      return null;
    }
  }

  // POST /system-settings - יצירת הגדרה חדשה
  async createSetting(data: CreateSystemSettingRequest): Promise<SystemSetting> {
    const response = await apiClient.post<SystemSetting>('/system-settings', data);
    return response.data;
  }

  // PUT /system-settings/:id - עדכון הגדרה
  async updateSetting(id: string, data: UpdateSystemSettingRequest): Promise<SystemSetting> {
    const response = await apiClient.put<SystemSetting>(`/system-settings/${id}`, data);
    return response.data;
  }

  // PUT /system-settings/key/:settingKey - עדכון הגדרה לפי מפתח
  async updateSettingByKey(
    settingKey: string, 
    settingValue: string | number | boolean | object,
    dataType: 'string' | 'number' | 'boolean' | 'json' = 'string'
  ): Promise<SystemSetting> {
    const response = await apiClient.put<SystemSetting>(`/system-settings/key/${settingKey}`, {
      setting_value: settingValue,
      data_type: dataType
    });
    return response.data;
  }

  // DELETE /system-settings/:id - מחיקת הגדרה
  async deleteSetting(id: string): Promise<void> {
    await apiClient.delete<void>(`/system-settings/${id}`);
  }

  // DELETE /system-settings/key/:settingKey - מחיקת הגדרה לפי מפתח
  async deleteSettingByKey(settingKey: string): Promise<void> {
    await apiClient.delete<void>(`/system-settings/key/${settingKey}`);
  }


}

export const systemSettingsService = new SystemSettingsService();