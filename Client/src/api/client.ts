import axios from 'axios';
import { BACKEND_URL } from '@/lib/config';
import { toast } from 'sonner';

export const apiClient = axios.create({
  baseURL: `${BACKEND_URL}/api/v1`,
  withCredentials: true,
});

apiClient.interceptors.request.use(async (config) => {
  try {
    // Attempt to inject token asynchronously if Clerk is available globally
    // @ts-ignore
    if (typeof window !== 'undefined' && window.Clerk && window.Clerk.session) {
      // @ts-ignore
      const token = await Promise.race([
        window.Clerk.session.getToken(),
        new Promise((_, reject) => setTimeout(() => reject(new Error('Clerk token timeout')), 3000))
      ]);
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
  } catch (error) {
    console.error('Error fetching Clerk token', error);
  }
  return config;
});

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response) {
      const status = error.response.status;
      const message = error.response.data?.message || 'An error occurred';
      
      if (status === 401 || status === 403) {
        toast.error(`Authentication Error: ${message}`);
      } else if (status === 429) {
        toast.error(`Rate Limit Exceeded: ${message}`);
      } else if (status >= 500) {
        toast.error(`Server Error: ${message}`);
      } else {
        toast.error(`Error: ${message}`);
      }
    } else {
      toast.error('Network Error. Please check your connection.');
    }
    return Promise.reject(error);
  }
);
