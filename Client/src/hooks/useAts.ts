import { useMutation, useQuery } from '@tanstack/react-query';
import { atsApi } from '@/api/ats.api';

export const useAtsAnalysis = () => {
  return useMutation({
    mutationFn: atsApi.analyzeResume,
    // Do not auto-retry POST requests for AI-expensive tasks
    retry: false,
  });
};

export const useAtsHistory = () => {
  return useQuery({
    queryKey: ['ats-history'],
    queryFn: atsApi.getAtsHistory,
  });
};
