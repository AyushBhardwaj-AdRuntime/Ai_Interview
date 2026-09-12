import { apiClient } from './client';

export const assessmentApi = {
  startAssessment: async (formData: FormData, token: string | null): Promise<{ success: boolean; assessmentId: string }> => {
    const headers: Record<string, string> = {};
    if (token) headers['Authorization'] = `Bearer ${token}`;

    const response = await apiClient.post('/agent/assess', formData, { headers });
    return response.data;
  },

  getAssessment: async (assessmentId: string, token: string | null): Promise<{ success: boolean; assessment: any }> => {
    const headers: Record<string, string> = {};
    if (token) headers['Authorization'] = `Bearer ${token}`;
    
    const response = await apiClient.get(`/agent/assess/${assessmentId}`, { headers });
    return response.data;
  },

  listAssessments: async (token: string | null): Promise<any[]> => {
    const headers: Record<string, string> = {};
    if (token) headers['Authorization'] = `Bearer ${token}`;

    const response = await apiClient.get('/agent/assess/me', { headers });
    return response.data;
  }
};
