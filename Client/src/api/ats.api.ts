import { apiClient } from './client';
import type { AtsResult } from '@/types/index';

export const atsApi = {
  analyzeResume: async (data: FormData): Promise<AtsResult> => {
    const response = await apiClient.post('/ats/analyze', data, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return response.data;
  },
  
  getAtsHistory: async (): Promise<AtsResult[]> => {
    const response = await apiClient.get('/ats/me');
    return response.data;
  }
};
