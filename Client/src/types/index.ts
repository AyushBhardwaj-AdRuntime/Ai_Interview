export type ApiResponse<T> = {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
};

export type AtsResult = {
  score: number;
  matchStatus: "High" | "Medium" | "Low";
  feedback?: string;
  missingKeywords?: string[];
  matchingKeywords?: string[];
  criticalRedFlag?: {
    skill: string;
    reason: string;
    potentialScoreGain: string;
  } | null;
  teaserQuestions?: string[];
  candidateName?: string;
  resultId?: string;
};

export type DashboardStats = {
  averageScore: number;
  totalInterviews: number;
  recentTrends: number[];
  topStrengths: string[];
  topWeaknesses: string[];
};

export type Interview = {
  _id: string;
  userId: string;
  status: string;
  jdText: string;
  resumeId?: string;
  createdAt: string;
  updatedAt: string;
  // Populated fields
  job_title?: string;
  company?: string;
  interview?: {
    status: string;
    result?: InterviewResult;
    questions?: Array<{ question: string; answer?: string }>;
  };
};

export type PracticePlan = {
  focusAreas: Array<{
    topic: string;
    practiceItems: string[];
  }>;
  nextRecommendedInterview?: string;
};

export type InterviewResult = {
  overallScore: number;
  technical?: number;
  technicalKnowledge?: number;
  communication?: number;
  problemSolving?: number;
  recommendation: string;
  strengths: string[];
  weaknesses: string[];
  nextSteps: string[];
  feedback?: string;
  practicePlan?: PracticePlan;
  questionsAnalysis?: Array<{
    score: number;
    questionText: string;
    candidateAnswer: string;
    strengths: string;
    weaknesses: string;
    betterAnswer: string;
  }>;
};
