import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { FileUp, Briefcase, Link as LinkIcon, ArrowRight, Loader2, AlertCircle } from 'lucide-react';
import { SEO } from '@/components/seo/SEO';
import { useStartAssessment } from '@/hooks/useAssessment';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

const AssessmentSetup = () => {
  const navigate = useNavigate();
  const startAssessment = useStartAssessment();
  
  const [resume, setResume] = useState<File | null>(null);
  const [jdText, setJdText] = useState('');
  const [githubUrl, setGithubUrl] = useState('');
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!resume || !jdText) return;

    const formData = new FormData();
    formData.append('resume', resume);
    formData.append('jdText', jdText);
    if (githubUrl) {
      formData.append('githubUrl', githubUrl);
    }

    startAssessment.mutate(formData, {
      onSuccess: (data) => {
        navigate(`/assessment/${data.assessmentId}/progress`);
      }
    });
  };

  const handleContinueAssessment = () => {
    const errorData = (startAssessment.error as any)?.response?.data;
    if (!errorData) return;
    const { assessmentId, status, interviewId } = errorData;
    
    if (status === 'awaiting_interview') {
      navigate(`/interview/${interviewId}?assessmentId=${assessmentId}`);
    } else if (status === 'completed') {
      navigate(`/assessment/${assessmentId}/result`);
    } else {
      navigate(`/assessment/${assessmentId}/progress`);
    }
  };

  const isDuplicateError = (startAssessment.error as any)?.response?.data?.code === 'ACTIVE_ASSESSMENT';

  return (
    <div className="min-h-screen bg-background text-foreground font-sans flex items-center justify-center p-4">
      <SEO title="Check My Readiness" />
      <div className="w-full max-w-2xl mt-16 mb-16">
        <div className="mb-8 text-center">
          <h1 className="text-4xl font-extrabold tracking-tight mb-3">Check My Readiness</h1>
          <p className="text-muted-foreground text-lg">Upload your resume and job description to get a comprehensive readiness report and verification interview.</p>
        </div>

        <Card className="shadow-lg border-border">
          <form onSubmit={handleSubmit}>
            <CardHeader>
              <CardTitle>Assessment Details</CardTitle>
              <CardDescription>We'll analyze your profile against the required skills.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              
              {isDuplicateError && (
                <Alert variant="destructive" className="bg-destructive/10 text-destructive border-destructive/20">
                  <AlertCircle className="h-4 w-4" />
                  <AlertTitle>Active Assessment Found</AlertTitle>
                  <AlertDescription className="flex flex-col gap-3 mt-2">
                    <p>You already have an assessment in progress. Please complete it first before starting a new one.</p>
                    <Button type="button" onClick={handleContinueAssessment} variant="outline" className="w-fit border-destructive/30 hover:bg-destructive/20">
                      Continue Assessment
                    </Button>
                  </AlertDescription>
                </Alert>
              )}
              
              {/* Resume Upload */}
              <div className="space-y-2">
                <label htmlFor="resume" className="flex items-center gap-2 text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                  <FileUp className="w-4 h-4 text-primary" /> Resume (PDF/DOCX) *
                </label>
                <div className="border-2 border-dashed rounded-lg p-6 flex flex-col items-center justify-center gap-2 text-muted-foreground hover:bg-muted/50 transition-colors">
                  <Input 
                    id="resume" 
                    type="file" 
                    accept=".pdf,.docx"
                    className="hidden" 
                    onChange={(e) => setResume(e.target.files?.[0] || null)}
                    required
                  />
                  <label htmlFor="resume" className="cursor-pointer text-sm font-medium hover:text-primary transition-colors">
                    {resume ? resume.name : "Click to select or drag and drop"}
                  </label>
                </div>
              </div>

              {/* Job Description */}
              <div className="space-y-2">
                <label htmlFor="jdText" className="flex items-center gap-2 text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                  <Briefcase className="w-4 h-4 text-primary" /> Job Description *
                </label>
                <Textarea 
                  id="jdText" 
                  placeholder="Paste the target job description here..." 
                  className="min-h-[150px] resize-y"
                  value={jdText}
                  onChange={(e) => setJdText(e.target.value)}
                  required
                />
              </div>

              {/* GitHub */}
              <div className="space-y-2">
                <label htmlFor="githubUrl" className="flex items-center gap-2 text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                  <LinkIcon className="w-4 h-4 text-primary" /> GitHub URL (Optional)
                </label>
                <Input 
                  id="githubUrl" 
                  type="url" 
                  placeholder="https://github.com/username"
                  value={githubUrl}
                  onChange={(e) => setGithubUrl(e.target.value)}
                />
              </div>

            </CardContent>
            <CardFooter>
              <Button 
                type="submit" 
                className="w-full text-lg h-12"
                disabled={!resume || !jdText || startAssessment.isPending}
              >
                {startAssessment.isPending ? (
                  <>
                    <Loader2 className="w-5 h-5 mr-2 animate-spin" /> Starting Assessment...
                  </>
                ) : (
                  <>
                    Start Assessment <ArrowRight className="w-5 h-5 ml-2" />
                  </>
                )}
              </Button>
            </CardFooter>
          </form>
        </Card>
      </div>
    </div>
  );
};

export default AssessmentSetup;
