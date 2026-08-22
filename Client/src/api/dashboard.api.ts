import { apiClient } from './client';
import type { DashboardStats } from '@/types/index';

export const dashboardApi = {
  getStats: async (): Promise<DashboardStats> => {
    const response = await apiClient.get('/dashboard/stats');
    return response.data;
  }
};
