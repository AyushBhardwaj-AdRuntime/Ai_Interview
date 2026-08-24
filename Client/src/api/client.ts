import axios from 'axios';
import { BACKEND_URL } from '@/lib/config';
import { toast } from 'sonner';

export const apiClient = axios.create({
  baseURL: `${BACKEND_URL}/api/v1`,
  withCredentials: true,
});

apiClient.interceptors.request.use(async (config) => {
  console.log("[DEBUG Axios] Interceptor started for URL:", config.url);
  try {
    // Attempt to inject token asynchronously if Clerk is available globally
    console.log("[DEBUG Axios] Checking window.Clerk:", !!(typeof window !== 'undefined' && window.Clerk && window.Clerk.session));
    // @ts-ignore
    if (typeof window !== 'undefined' && window.Clerk && window.Clerk.session) {
      console.log("[DEBUG Axios] Calling window.Clerk.session.getToken()");
      // @ts-ignore
      const token = await Promise.race([
        window.Clerk.session.getToken(),
        new Promise((_, reject) => setTimeout(() => reject(new Error('Clerk token timeout')), 3000))
      ]);
      console.log("[DEBUG Axios] Token received:", !!token);
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
  } catch (error) {
    console.error('[DEBUG Axios] Error fetching Clerk token', error);
  }
  console.log("[DEBUG Axios] Interceptor finished. Returning config.");
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
