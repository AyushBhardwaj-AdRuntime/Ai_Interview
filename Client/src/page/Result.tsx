import { BACKEND_URL } from '@/lib/config';

import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  CheckCircle2,
  XCircle,
  ArrowRightCircle,
  ChevronDown,
  ChevronUp,
  BrainCircuit,
  MessageSquare,
  Wrench,
  Award,
  Loader2,
  Target,
  PlayCircle
} from 'lucide-react';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

import { useAuth } from '@clerk/clerk-react';
import { useInterviewResult } from '@/hooks/useInterview';

const loadingMessages = [
  "Analyzing your answers...",
  "Evaluating communication skills...",
  "Finding weak areas...",
  "Building your practice plan..."
];

const Result = () => {
  const { id } = useParams();
  const { data: result, isLoading: loading } = useInterviewResult(id || '');
  const [loadingStep, setLoadingStep] = useState(0);
  const [expandedQuestion, setExpandedQuestion] = useState<number | null>(null);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (loading) {
      interval = setInterval(() => {
        setLoadingStep((prev) => (prev + 1) % loadingMessages.length);
      }, 2500);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [loading]);

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-background text-foreground p-4">
        <div className="w-24 h-24 bg-primary/10 rounded-full flex items-center justify-center mb-8 relative">
          <motion.div 
            initial={{ scale: 1, opacity: 0.5 }}
            animate={{ scale: 1.5, opacity: 0 }}
            exit={{ opacity: 0 }}
            transition={{ repeat: Infinity, duration: 2 }}
            className="absolute inset-0 rounded-full border border-primary bg-primary/20"
          />
          <BrainCircuit className="w-10 h-10 animate-pulse text-primary relative z-10" />
        </div>
        
        <div className="h-8 overflow-hidden relative w-64 text-center">
          <AnimatePresence mode="wait">
            <motion.p
              key={loadingStep}
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: -20, opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="text-lg font-medium text-foreground absolute inset-0"
            >
              {loadingMessages[loadingStep]}
            </motion.p>
          </AnimatePresence>
        </div>
      </div>
    );
  }

  if (!result) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background text-foreground">
        <div className="text-center">
          <p className="text-destructive font-medium mb-4">Failed to load results.</p>
          <Link to="/">
            <Button variant="default">Go Home</Button>
          </Link>
        </div>
      </div>
    );
  }

  const getBadgeColor = (rec: string) => {
    const text = (rec || "").toLowerCase();
    if (text.includes("strong hire")) return "bg-green-500 hover:bg-green-600";
    if (text.includes("hire") && !text.includes("no")) return "bg-blue-500 hover:bg-blue-600";
    if (text.includes("borderline")) return "bg-yellow-500 hover:bg-yellow-600";
    return "bg-destructive hover:bg-destructive/90";
  };

  return (
    <div className="min-h-screen bg-background text-foreground font-sans selection:bg-primary/20">
      
      <div className="mx-auto max-w-5xl space-y-12 p-6 md:p-12 pt-24 md:pt-32">
        
        {/* Header Section */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 bg-card border border-border p-8 rounded-[2rem] shadow-sm">
          <div>
            <h1 className="text-3xl font-bold tracking-tight mb-2">Interview Report</h1>
            <p className="text-muted-foreground">Actionable coaching based on your performance.</p>
          </div>
          <div className="flex items-center gap-6">
            <div className="text-right">
              <p className="text-sm font-semibold uppercase tracking-wider text-muted-foreground mb-1">Recommendation</p>
              <Badge className={`${getBadgeColor(result.recommendation)} text-white px-4 py-1.5 text-sm font-bold`}>
                {result.recommendation || "Pending"}
              </Badge>
            </div>
            <Link to="/">
              <Button variant="default" className="rounded-full shadow-lg hover:scale-105 transition-transform">Practice Again</Button>
            </Link>
          </div>
        </div>

        {/* Score Breakdown */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <ScoreCard title="Overall Score" score={result.overallScore} icon={<Award className="w-5 h-5" />} highlight />
          <ScoreCard title="Technical" score={result.technical || result.technicalKnowledge} icon={<BrainCircuit className="w-5 h-5" />} />
          <ScoreCard title="Communication" score={result.communication} icon={<MessageSquare className="w-5 h-5" />} />
          <ScoreCard title="Problem Solving" score={result.problemSolving} icon={<Wrench className="w-5 h-5" />} />
        </div>

        {/* Actionable Feedback */}
        {(result.strengths?.length > 0 || result.weaknesses?.length > 0 || result.nextSteps?.length > 0) && (
          <div className="grid md:grid-cols-3 gap-8">
            <FeedbackList title="What you did well" items={result.strengths} icon={<CheckCircle2 className="w-5 h-5 text-green-500" />} />
            <FeedbackList title="What went wrong" items={result.weaknesses} icon={<XCircle className="w-5 h-5 text-destructive" />} />
            <FeedbackList title="Practice Next" items={result.nextSteps} icon={<ArrowRightCircle className="w-5 h-5 text-blue-500" />} />
          </div>
        )}

        {/* Personalized Practice Plan */}
        {result.practicePlan && result.practicePlan.focusAreas && result.practicePlan.focusAreas.length > 0 && (
          <div className="bg-slate-50 border border-slate-200 p-8 rounded-3xl shadow-sm my-8">
            <div className="flex items-center gap-3 mb-6">
              <div className="bg-coral-100 p-2 rounded-full">
                <Target className="w-6 h-6 text-coral-600" style={{ color: '#ff7f50' }} />
              </div>
              <h2 className="text-2xl font-bold text-slate-800 tracking-tight">Your Personalized Practice Plan</h2>
            </div>
            
            <div className="grid md:grid-cols-2 gap-6 mb-8">
              {result.practicePlan.focusAreas.map((area: any, idx: number) => (
                <div key={idx} className="bg-white border border-slate-200 p-6 rounded-2xl shadow-sm">
                  <h3 className="font-bold text-lg text-slate-800 mb-4 pb-2 border-b border-slate-100">
                    Focus {idx + 1}: {area.topic}
                  </h3>
                  <ul className="space-y-3">
                    {area.practiceItems?.map((item: string, i: number) => (
                      <li key={i} className="flex items-start gap-3 text-sm text-slate-600">
                        <ArrowRightCircle className="w-4 h-4 text-slate-400 mt-0.5 shrink-0" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>

            {result.practicePlan.nextRecommendedInterview && (
              <div className="bg-white border border-slate-200 rounded-2xl p-6 flex flex-col sm:flex-row items-center justify-between gap-6 shadow-sm">
                <div>
                  <p className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-1">Next Recommended Interview</p>
                  <p className="text-xl font-semibold text-slate-800">{result.practicePlan.nextRecommendedInterview}</p>
                </div>
                <Link to="/setup">
                  <Button className="shrink-0 bg-slate-800 hover:bg-slate-900 text-white rounded-full px-8 py-6 shadow-md transition-all hover:scale-105">
                    Start Recommended Practice <PlayCircle className="w-5 h-5 ml-2" />
                  </Button>
                </Link>
              </div>
            )}
          </div>
        )}

        {/* Legacy Feedback Support */}
        {typeof result.feedback === 'string' && !result.strengths && (
          <Card className="bg-card border-border shadow-sm rounded-2xl">
            <CardHeader>
              <CardTitle className="text-xl font-semibold">Feedback Summary</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="prose prose-slate max-w-none text-foreground whitespace-pre-wrap">
                {result.feedback}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Question Breakdown */}
        {result.questionsAnalysis && result.questionsAnalysis.length > 0 && (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold tracking-tight">Question Analysis</h2>
            <div className="space-y-4">
              {result.questionsAnalysis.map((qa: any, index: number) => (
                <Card 
                  key={index} 
                  className="bg-card border-border shadow-sm rounded-2xl overflow-hidden transition-all duration-300"
                >
                  <div 
                    className="p-6 cursor-pointer hover:bg-muted/30 flex items-start justify-between gap-4"
                    onClick={() => setExpandedQuestion(expandedQuestion === index ? null : index)}
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <span className="text-sm font-bold text-muted-foreground">Q{index + 1}</span>
                        <Badge variant="outline" className={qa.score >= 70 ? 'text-green-500 border-green-200' : 'text-yellow-600 border-yellow-200'}>
                          Score: {qa.score}/100
                        </Badge>
                      </div>
                      <h3 className="font-semibold text-lg leading-snug">{qa.questionText}</h3>
                    </div>
                    <Button variant="ghost" size="icon" className="shrink-0 rounded-full">
                      {expandedQuestion === index ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                    </Button>
                  </div>

                  <AnimatePresence>
                    {expandedQuestion === index && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.2 }}
                      >
                        <div className="p-6 pt-0 border-t border-border mt-2 space-y-6 bg-muted/10">
                          
                          <div>
                            <p className="text-sm font-bold text-muted-foreground uppercase tracking-wider mb-2">Your Answer</p>
                            <div className="bg-background rounded-xl p-4 border border-border text-foreground/90 italic">
                              "{qa.candidateAnswer}"
                            </div>
                          </div>

                          <div className="grid md:grid-cols-2 gap-6">
                            <div>
                              <p className="text-sm font-bold text-green-600 uppercase tracking-wider mb-2 flex items-center gap-2">
                                <CheckCircle2 className="w-4 h-4" /> Strengths
                              </p>
                              <p className="text-sm text-foreground/80">{qa.strengths}</p>
                            </div>
                            <div>
                              <p className="text-sm font-bold text-destructive uppercase tracking-wider mb-2 flex items-center gap-2">
                                <XCircle className="w-4 h-4" /> Weaknesses
                              </p>
                              <p className="text-sm text-foreground/80">{qa.weaknesses}</p>
                            </div>
                          </div>

                          <div>
                            <p className="text-sm font-bold text-blue-600 uppercase tracking-wider mb-2 flex items-center gap-2">
                              <BrainCircuit className="w-4 h-4" /> Better Answer
                            </p>
                            <div className="bg-blue-50 dark:bg-blue-950/20 rounded-xl p-4 border border-blue-100 dark:border-blue-900 text-foreground/90">
                              {qa.betterAnswer}
                            </div>
                          </div>

                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </Card>
              ))}
            </div>
          </div>
        )}

      </div>
    </div>
  );
};

// Helper Components

const ScoreCard = ({ title, score, icon, highlight = false }: { title: string, score: number, icon: React.ReactNode, highlight?: boolean }) => {
  const val = score || 0;
  return (
    <Card className={`rounded-2xl border-border shadow-sm ${highlight ? 'bg-primary/5 border-primary/20' : 'bg-card'}`}>
      <CardHeader className="pb-2 flex flex-row items-center justify-between space-y-0">
        <CardTitle className="text-sm font-bold text-muted-foreground uppercase tracking-wider">{title}</CardTitle>
        <div className={highlight ? 'text-primary' : 'text-muted-foreground'}>{icon}</div>
      </CardHeader>
      <CardContent>
        <div className="flex items-baseline gap-1 mb-3">
          <span className={`text-4xl font-black ${highlight ? 'text-primary' : 'text-foreground'}`}>{val}</span>
          <span className="text-sm font-medium text-muted-foreground">/ 100</span>
        </div>
        {/* We use a standard div for the progress to avoid component errors if Progress doesn't take indicatorColor */}
        <div className="h-2 w-full bg-muted overflow-hidden rounded-full">
           <div className={`h-full ${highlight ? 'bg-primary' : 'bg-foreground'}`} style={{ width: `${val}%` }} />
        </div>
      </CardContent>
    </Card>
  );
};

const FeedbackList = ({ title, items, icon }: { title: string, items: string[], icon: React.ReactNode }) => {
  if (!items || items.length === 0) return null;
  return (
    <div className="bg-card border border-border p-6 rounded-2xl shadow-sm">
      <div className="flex items-center gap-3 mb-6">
        {icon}
        <h3 className="font-bold text-lg">{title}</h3>
      </div>
      <ul className="space-y-4">
        {items.map((item, i) => (
          <li key={i} className="flex items-start gap-3 text-sm text-foreground/80 leading-relaxed">
            <span className="w-1.5 h-1.5 rounded-full bg-foreground/30 mt-2 shrink-0" />
            <span>{item}</span>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default Result;
