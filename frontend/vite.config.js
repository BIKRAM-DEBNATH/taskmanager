import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  // Load env vars for the current mode (development / production)
  const env = loadEnv(mode, process.cwd(), '');

  const backendUrl = env.VITE_API_URL || 'http://localhost:5000';

  return {
    plugins: [react()],

    server: {
      port: 5173,
      // Proxy /api calls to the backend during local development.
      // In production the built files are served by a static host and
      // axios uses the full VITE_API_URL directly — no proxy needed.
      proxy: {
        '/api': {
          target: backendUrl,
          changeOrigin: true,
          secure: false,           // allow self-signed certs in dev
          // No rewrite — backend routes already start with /api
        },
      },
    },

    build: {
      outDir: 'dist',
      sourcemap: false,
      // Chunk splitting for better caching
      rollupOptions: {
        output: {
          manualChunks: {
            vendor: ['react', 'react-dom', 'react-router-dom'],
            http: ['axios'],
          },
        },
      },
    },
  };
});

