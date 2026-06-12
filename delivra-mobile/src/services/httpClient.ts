import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

const BASE_URL = process.env.EXPO_PUBLIC_API_URL;

const axiosInstance = axios.create({
  baseURL: BASE_URL,
  headers: { 'Content-Type': 'application/json' },
  timeout: 10000,
});

// Attach JWT token to every request
axiosInstance.interceptors.request.use(async (config) => {
  try {
    const token = await AsyncStorage.getItem('authToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  } catch (e) {}
  return config;
});

// Handle responses — unwrap { success, data } wrapper automatically
axiosInstance.interceptors.response.use(
  (response) => {
    const body = response.data;
    // If the response shape is { success: true, data: ... }, return data directly
    if (body && typeof body === 'object' && 'success' in body && 'data' in body) {
      return body.data;
    }
    // Otherwise return as-is (raw data without wrapper)
    return body;
  },
  (error) => {
    const message =
      error.response?.data?.message ||
      error.message ||
      'An error occurred';
    return Promise.reject(new Error(message));
  }
);

// Re-export with correct types (return any instead of AxiosResponse)
export const httpClient = {
  get: (url: string, config?: any) => axiosInstance.get(url, config) as any,
  post: (url: string, data?: any, config?: any) => axiosInstance.post(url, data, config) as any,
  put: (url: string, data?: any, config?: any) => axiosInstance.put(url, data, config) as any,
  patch: (url: string, data?: any, config?: any) => axiosInstance.patch(url, data, config) as any,
  delete: (url: string, config?: any) => axiosInstance.delete(url, config) as any,
};