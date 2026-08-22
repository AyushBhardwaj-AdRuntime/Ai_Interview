import { useMutation, useQuery } from '@tanstack/react-query';
import { interviewApi } from '@/api/interview.api';

export const useCreateInterview = () => {
  return useMutation({
    mutationFn: interviewApi.createPreInterview,
    // Do not auto-retry POST requests for AI-expensive tasks
    retry: false,
  });
};

export const useInterviewHistory = () => {
  return useQuery({
    queryKey: ['interviews-history'],
    queryFn: interviewApi.getInterviewHistory,
  });
};

export const useInterview = (id: string) => {
  return useQuery({
    queryKey: ['interview-session', id],
    queryFn: () => interviewApi.getInterviewSession(id),
    enabled: !!id,
  });
};

export const useInterviewResult = (id: string) => {
  return useQuery({
    queryKey: ['interview-result', id],
    queryFn: () => interviewApi.getInterviewResult(id),
    enabled: !!id,
  });
};
