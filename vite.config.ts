import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
    // Load .env file variables and filter for the ones we want to expose
    const env = loadEnv(mode, process.cwd(), '');

    const envWithProcessPrefix = Object.entries(env).reduce(
      (prev, [key, val]) => {
        if (key.startsWith('REACT_APP_') || key === 'GEMINI_API_KEY') {
          return {
            ...prev,
            [`process.env.${key}`]: JSON.stringify(val),
          };
        }
        return prev;
      },
      {},
    );

    return {
      server: {
        port: 3000,
        host: '0.0.0.0',
      },
      plugins: [react()],
      define: envWithProcessPrefix, // Use the correctly constructed define object
      resolve: {
        alias: {
          '@': path.resolve(__dirname, '.'),
        }
      }
    };
});
