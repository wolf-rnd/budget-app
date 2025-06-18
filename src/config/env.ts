// Environment configuration
export const ENV = {
  // API Configuration - Use proxy in development, full URL in production
  API_BASE_URL: import.meta.env.DEV 
    ? '/api' 
    : (import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001/api'),
  
  // Application Settings
  APP_NAME: import.meta.env.VITE_APP_NAME || 'תקציב-בית',
  APP_VERSION: import.meta.env.VITE_APP_VERSION || '1.0',
  DEFAULT_TITHE_PERCENTAGE: Number(import.meta.env.VITE_DEFAULT_TITHE_PERCENTAGE) || 10,
  DEFAULT_CURRENCY: import.meta.env.VITE_DEFAULT_CURRENCY || 'ILS',
  
  // Development Settings
  DEV_MODE: import.meta.env.VITE_DEV_MODE === 'true',
  LOG_LEVEL: import.meta.env.VITE_LOG_LEVEL || 'info',
  
  // API Settings
  API_TIMEOUT: Number(import.meta.env.VITE_API_TIMEOUT) || 10000,
  ENABLE_MOCK_DATA: import.meta.env.VITE_ENABLE_MOCK_DATA === 'true',
  
  // Derived values
  IS_PRODUCTION: import.meta.env.PROD,
  IS_DEVELOPMENT: import.meta.env.DEV,
} as const;

// Type for environment configuration
export type EnvConfig = typeof ENV;