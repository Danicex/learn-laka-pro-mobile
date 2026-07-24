// api.ts
import axios, {
  AxiosInstance,
  AxiosError,
  InternalAxiosRequestConfig,
  AxiosResponse,
} from "axios";

// Safely checks for Expo's variable first, then your fallback URL
const BASE_URL = process.env.EXPO_PUBLIC_API_URL ?? "https://example.com";
// If you're not using Vite, swap for process.env.API_URL (with dotenv) instead.

const api: AxiosInstance = axios.create({
  baseURL: BASE_URL,
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
  },
});

// --- Request interceptor: attach auth token, etc. ---
api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = localStorage.getItem("token");
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error: AxiosError) => Promise.reject(error)
);

// --- Response interceptor: handle errors globally ---
api.interceptors.response.use(
  (response: AxiosResponse) => response,
  (error: AxiosError) => {
    if (error.response?.status === 401) {
      // e.g. redirect to login, clear token, etc.
      localStorage.removeItem("token");
    }
    return Promise.reject(error);
  }
);

export default api;