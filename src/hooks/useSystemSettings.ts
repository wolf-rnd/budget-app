import { useState, useEffect, useCallback } from 'react';
import { SystemSetting, systemSettingsService } from '../services/systemSettingsService';

export const useSystemSettings = () => {
  const [settings, setSettings] = useState<SystemSetting[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load all settings
  const loadSettings = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await systemSettingsService.getAllSettings();
      
      let settingsData: SystemSetting[];
      if (response && typeof response === 'object' && 'data' in response) {
        settingsData = response.data;
      } else {
        settingsData = Array.isArray(response) ? response : [];
      }
      
      setSettings(settingsData);
    } catch (err) {
      console.error('Failed to load settings:', err);
      setError('שגיאה בטעינת הגדרות המערכת');
    } finally {
      setLoading(false);
    }
  }, []);

  // Get setting by key
  const getSetting = useCallback((key: string): SystemSetting | undefined => {
    return settings.find(setting => setting.setting_key === key);
  }, [settings]);

  // Get setting value by key
  const getSettingValue = useCallback((key: string, defaultValue?: any): any => {
    const setting = settings.find(setting => setting.setting_key === key);
    if (!setting) return defaultValue;
    return setting.parsed_value !== undefined ? setting.parsed_value : setting.setting_value;
  }, [settings]);

  // Update setting by key
  const updateSetting = useCallback(async (
    key: string, 
    value: string | number | boolean | object,
    dataType: 'string' | 'number' | 'boolean' | 'json' = 'string'
  ) => {
    try {
      const updated = await systemSettingsService.updateSettingByKey(key, value, dataType);
      setSettings(prev => prev.map(setting => 
        setting.setting_key === key ? updated : setting
      ));
      return updated;
    } catch (error) {
      console.error(`Failed to update setting ${key}:`, error);
      throw error;
    }
  }, []);

  // Create setting
  const createSetting = useCallback(async (
    key: string, 
    value: string | number | boolean | object,
    dataType: 'string' | 'number' | 'boolean' | 'json' = 'string'
  ) => {
    try {
      const created = await systemSettingsService.createSetting({
        setting_key: key,
        setting_value: value,
        data_type: dataType
      });
      setSettings(prev => [...prev, created]);
      return created;
    } catch (error) {
      console.error(`Failed to create setting ${key}:`, error);
      throw error;
    }
  }, []);

  // Delete setting by key
  const deleteSetting = useCallback(async (key: string) => {
    try {
      await systemSettingsService.deleteSettingByKey(key);
      setSettings(prev => prev.filter(setting => setting.setting_key !== key));
    } catch (error) {
      console.error(`Failed to delete setting ${key}:`, error);
      throw error;
    }
  }, []);

  // Create or update setting (upsert)
  const upsertSetting = useCallback(async (
    key: string, 
    value: string | number | boolean | object,
    dataType: 'string' | 'number' | 'boolean' | 'json' = 'string'
  ) => {
    try {
      const existing = settings.find(setting => setting.setting_key === key);
      if (existing) {
        return await updateSetting(key, value, dataType);
      } else {
        return await createSetting(key, value, dataType);
      }
    } catch (error) {
      console.error(`Failed to upsert setting ${key}:`, error);
      throw error;
    }
  }, [settings, updateSetting, createSetting]);

  // Load settings on mount
  useEffect(() => {
    loadSettings();
  }, [loadSettings]);

  return {
    settings,
    loading,
    error,
    loadSettings,
    getSetting,
    getSettingValue,
    updateSetting,
    createSetting,
    deleteSetting,
    upsertSetting
  };
};