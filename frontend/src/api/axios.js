import axios from 'axios';

// ─────────────────────────────────────────────────────────────────────────────
// Base URL strategy
//
// Development  → Vite proxy rewrites /api → http://localhost:5000/api
//                So we use the relative path '/api' and the proxy handles it.
//
// Production   → No proxy. VITE_API_URL holds the full backend origin
//                (e.g. https://your-backend.onrender.com).
//                Axios constructs: https://your-backend.onrender.com/api/...
// ─────────────────────────────────────────────────────────────────────────────
const isDev = import.meta.env.DEV;

const baseURL = isDev
  ? '/api'  // proxied by Vite dev server
  : `${import.meta.env.VITE_API_URL}/api`; // full URL in production build

const api = axios.create({
  baseURL,
  headers: { 'Content-Type': 'application/json' },
  withCredentials: true, // send cookies / auth headers cross-origin
  timeout: 15000,        // 15 s — avoids hanging requests
});

// ── Request interceptor — attach JWT token ───────────────────────────────────
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// ── Response interceptor — global error handling ─────────────────────────────
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid — clear storage and redirect to login
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      // Use replace so the user can't go back to the protected page
      window.location.replace('/login');
    }
    return Promise.reject(error);
  }
);

export default api;

