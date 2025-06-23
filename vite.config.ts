import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import * as dotenv from 'dotenv'

dotenv.config()

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api': {
        target: process.env.VITE_API_BASE_URL || 'https://budget-server-y649.onrender.com/api',
        changeOrigin: true,
        secure: true,
        timeout: 30000,
        configure: (proxy, _options) => {
          proxy.on('error', (err, _req, res) => {
            console.log('Proxy error:', err.message);
            // Send a proper error response instead of letting the connection hang
            if (res && !res.headersSent) {
              res.writeHead(503, { 'Content-Type': 'application/json' });
              res.end(JSON.stringify({ 
                error: 'Backend service unavailable', 
                message: 'The API server is currently experiencing issues. Please try again later.',
                fallback: true 
              }));
            }
          });
          proxy.on('proxyReq', (proxyReq, req, _res) => {
            if (process.env.NODE_ENV === 'development') {
              console.log('Sending Request to the Target:', req.method, req.url);
            }
          });
          proxy.on('proxyRes', (proxyRes, req, _res) => {
            if (process.env.NODE_ENV === 'development') {
              console.log('Received Response from the Target:', proxyRes.statusCode, req.url);
            }
          });
        },
      }
    }
  },
  build: {
    outDir: 'dist',
    sourcemap: false,
    minify: 'esbuild'
  }
})