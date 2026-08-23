import { apiClient } from './client';
import type { Interview, InterviewResult } from '@/types/index';

export const interviewApi = {
  createPreInterview: async (data: Partial<Interview> | FormData): Promise<Interview> => {
    const response = await apiClient.post('/pre-interview', data);
    return response.data;
  },

  getInterviewSession: async (id: string): Promise<Interview> => {
    const response = await apiClient.get(`/interview/${id}`);
    return response.data;
  },

  getInterviewHistory: async (): Promise<Interview[]> => {
    const response = await apiClient.get('/interviews/me');
    return response.data;
  },

  getInterviewResult: async (id: string): Promise<InterviewResult> => {
    const response = await apiClient.get(`/result/${id}`);
    let data = response.data;
    
    if (typeof data === 'string') {
      try {
        const cleanStr = data.replace(/```json/g, '').replace(/```/g, '').trim();
        data = JSON.parse(cleanStr);
      } catch (e) {
        console.error("Failed to parse JSON result", e);
      }
    }
    return data;
  }
};
