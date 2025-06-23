// Base API configuration and utilities
const API_BASE_URL = 'https://budget-server-y649.onrender.com/api';

// HTTP client utility - DEPRECATED
// This file is kept for backward compatibility but should not be used
// All services now use their own fetch implementations directly

console.warn('api.ts is deprecated. Services now use direct fetch calls to the API.');

// Legacy export for backward compatibility
export const apiClient = {
  baseURL: API_BASE_URL,
  get: () => { throw new Error('Use service-specific fetch calls instead'); },
  post: () => { throw new Error('Use service-specific fetch calls instead'); },
  put: () => { throw new Error('Use service-specific fetch calls instead'); },
  delete: () => { throw new Error('Use service-specific fetch calls instead'); },
  setToken: () => { console.warn('Token management is now handled by individual services'); },
  removeToken: () => { console.warn('Token management is now handled by individual services'); },
};