import axios, { type AxiosRequestConfig, type InternalAxiosRequestConfig } from "axios";
import { useAuth } from "@clerk/clerk-react";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:3000";

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Store the getToken function to be set by the AuthProvider
let getTokenFunction: (() => Promise<string | null>) | null = null;

export function setAuthToken(getToken: () => Promise<string | null>) {
  getTokenFunction = getToken;
}

// Add request interceptor to include Clerk session token
apiClient.interceptors.request.use(
  async (config: InternalAxiosRequestConfig) => {
    try {
      if (getTokenFunction) {
        // Always get a fresh token for each request (Clerk handles caching)
        const token = await getTokenFunction();
        
        console.log("🔑 Token:", token ? `${token.substring(0, 30)}...` : "NULL");
        
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
          console.log("✅ Authorization header added");
        } else {
          console.warn("⚠️ Token is null - user may not be signed in");
        }
      } else {
        console.warn("⚠️ Auth not initialized yet");
      }
    } catch (error) {
      console.error("❌ Failed to get Clerk token:", error);
    }
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add response interceptor to handle token expiration
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // If 401 error and we haven't retried yet, try to refresh token
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      console.log("🔄 Got 401, retrying with fresh token...");

      try {
        if (getTokenFunction) {
          // Get a fresh token (force refresh)
          const token = await getTokenFunction();
          
          if (token) {
            originalRequest.headers.Authorization = `Bearer ${token}`;
            console.log("✅ Retry with refreshed token");
            return apiClient(originalRequest);
          }
        }
      } catch (refreshError) {
        console.error("❌ Failed to refresh token:", refreshError);
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export const api = {
  get: async <T>(url: string, config?: AxiosRequestConfig): Promise<T> => {
    const response = await apiClient.get<T>(url, config);
    return response.data;
  },
  post: async <T>(url: string, data: unknown, config?: AxiosRequestConfig): Promise<T> => {
    const response = await apiClient.post<T>(url, data, config);
    return response.data;
  },
  patch: async <T>(url: string, data: unknown, config?: AxiosRequestConfig): Promise<T> => {
    const response = await apiClient.patch<T>(url, data, config);
    return response.data;
  },
  put: async <T>(url: string, data: unknown, config?: AxiosRequestConfig): Promise<T> => {
    const response = await apiClient.put<T>(url, data, config);
    return response.data;
  },
  delete: async <T>(url: string, config?: AxiosRequestConfig): Promise<T> => {
    const response = await apiClient.delete<T>(url, config);
    return response.data;
  },
};

