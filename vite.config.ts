import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
    // Load env file variables into an 'env' object
    const env = loadEnv(mode, '.', '');

    return {
      server: {
        port: 3000,
        host: '0.0.0.0',
      },
      plugins: [react()],
      define: {
        // Expose all loaded environment variables to the client-side code
        'process.env.GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY),
        'process.env.REACT_APP_FIREBASE_API_KEY': JSON.stringify(env.REACT_APP_FIREBASE_API_KEY),
        'process.env.REACT_APP_FIREBASE_AUTH_DOMAIN': JSON.stringify(env.REACT_APP_FIREBASE_AUTH_DOMAIN),
        'process.env.REACT_APP_FIREBASE_PROJECT_ID': JSON.stringify(env.REACT_APP_FIREBASE_PROJECT_ID),
        'process.env.REACT_APP_FIREBASE_STORAGE_BUCKET': JSON.stringify(env.REACT_APP_FIREBASE_STORAGE_BUCKET),
        'process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID': JSON.stringify(env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID),
        'process.env.REACT_APP_FIREBASE_APP_ID': JSON.stringify(env.REACT_APP_FIREBASE_APP_ID),
        'process.env.REACT_APP_FIREBASE_MEASUREMENT_ID': JSON.stringify(env.REACT_APP_FIREBASE_MEASUREMENT_ID),
        'process.env.REACT_APP_STRIPE_PUBLISHABLE_KEY': JSON.stringify(env.REACT_APP_STRIPE_PUBLISHABLE_KEY),
        'process.env.REACT_APP_STRIPE_BACKEND_URL': JSON.stringify(env.REACT_APP_STRIPE_BACKEND_URL)
      },
      resolve: {
        alias: {
          '@': path.resolve(__dirname, '.'),
        }
      }
    };
});
