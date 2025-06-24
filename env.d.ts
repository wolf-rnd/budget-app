/// <reference types="vite/client" />

interface ImportMetaEnv {
    readonly VITE_API_BASE_URL: string;
    readonly VITE_APP_NAME: string;
    readonly VITE_APP_VERSION: string;
    readonly VITE_DEFAULT_TITHE_PERCENTAGE: string;
    readonly VITE_DEFAULT_CURRENCY: string;
    readonly VITE_DEV_MODE: string;
    readonly VITE_LOG_LEVEL: string;
    readonly VITE_API_TIMEOUT: string;
  }
  
  interface ImportMeta {
    readonly env: ImportMetaEnv;
  }
  