import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { toast } from "sonner";
import { useCreateInterview } from "@/hooks/useInterview";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import ResumeDropzone from "@/components/ui/ResumeDropzone";
import { ArrowLeft, ArrowRight, Upload, Briefcase, Settings2, PlayCircle, FileText, Loader2 } from "lucide-react";

const steps = [
  { id: 1, name: "Resume", icon: Upload },
  { id: 2, name: "Target Job", icon: Briefcase },
  { id: 3, name: "Configuration", icon: Settings2 },
  { id: 4, name: "Preview", icon: PlayCircle },
];

const Form = () => {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const navigation = useNavigate();
  const location = useLocation();

  // Form State
  const [resume, setResume] = useState<File | null>(null);
  const [resumeFromAts, setResumeFromAts] = useState(false);
  const [jobTitle, setJobTitle] = useState("");
  const [company, setCompany] = useState("");
  const [jobDescription, setJobDescription] = useState("");
  const [interviewType, setInterviewType] = useState("Technical");
  const [difficulty, setDifficulty] = useState("Medium");
  const [experience, setExperience] = useState("1-3 years");

  const [interviewId, setInterviewId] = useState<string | null>(null);

  useEffect(() => {
    if (location.state?.jdText) {
      setJobDescription(location.state.jdText);
      setResumeFromAts(true);
      // We don't advance the step automatically so the user has a moment to review
      toast.success("Resume & Job Description loaded from ATS! You can review before starting.", { duration: 5000 });
    }
  }, [location.state]);

  const handleNext = async () => {
    if (step === 1 && !resume && !resumeFromAts) {
      toast.error("Please upload a resume to continue.");
      return;
    }
    if (step === 2 && (!jobTitle || !jobDescription)) {
      toast.error("Job title and description are required.");
      return;
    }
    
    if (step === 3) {
      // Create the interview before showing Step 4 (Preview/Readiness)
      await prepareInterview();
      return;
    }

    setStep((s) => Math.min(s + 1, 4));
  };

  const handleBack = () => {
    setStep((s) => Math.max(s - 1, 1));
  };

  const { mutateAsync: createPreInterview } = useCreateInterview();

  async function prepareInterview() {
    const formData = new FormData();
    try {
      setLoading(true);

      if (resume) {
        formData.append("resume", resume, resume.name);
      }
      formData.append("jobTitle", jobTitle);
      formData.append("company", company);
      formData.append("jobDescription", jobDescription);
      formData.append("interviewType", interviewType);
      formData.append("difficulty", difficulty);
      formData.append("experience", experience);
      
      const data = await createPreInterview(formData);
      
      setInterviewId(data._id || (data as any).id);
      toast.success("Interview prepared successfully!");
      setStep(4);
    } catch (err: any) {
      const message = err.response?.data?.message || "Setup failed. Please try again.";
      toast.error(message);
    } finally {
      setLoading(false);
    }
  }

  function handleStartInterview() {
    if (interviewId) {
      navigation(`/interview/${interviewId}`);
    }
  }

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4 pt-24">
      
      

      <div className="w-full max-w-2xl">
        {/* Progress Tracker */}
        <div className="mb-8 relative">
          <div className="absolute top-1/2 left-0 w-full h-0.5 bg-muted -z-10 -translate-y-1/2"></div>
          <div 
            className="absolute top-1/2 left-0 h-0.5 bg-primary -z-10 -translate-y-1/2 transition-all duration-500 ease-in-out" 
            style={{ width: `${((step - 1) / 3) * 100}%` }}
          ></div>
          <div className="flex justify-between">
            {steps.map((s) => {
              const Icon = s.icon;
              const isActive = step >= s.id;
              return (
                <div key={s.id} className="flex flex-col items-center gap-2">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition-colors duration-300 ${isActive ? 'bg-primary border-primary text-primary-foreground' : 'bg-card border-muted text-muted-foreground'}`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <span className={`text-xs font-medium ${isActive ? 'text-foreground' : 'text-muted-foreground'}`}>{s.name}</span>
                </div>
              )
            })}
          </div>
        </div>

        <Card className="shadow-sm border-border overflow-hidden bg-card">
          <AnimatePresence mode="wait">
            <motion.div
              key={step}
              initial={{ x: 20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: -20, opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              {step === 1 && (
                <>
                  <CardHeader>
                    <CardTitle className="text-2xl">Upload Resume</CardTitle>
                    <CardDescription>Upload your latest resume to base the interview on your actual experience.</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <ResumeDropzone setResume={setResume} resume={resume} />
                    {resume && (
                      <div className="flex items-center gap-2 p-3 bg-green-50 text-green-700 dark:bg-green-950/30 dark:text-green-400 rounded-md border border-green-200 dark:border-green-900">
                        <FileText className="w-4 h-4" />
                        <span className="text-sm font-medium">New resume uploaded successfully</span>
                      </div>
                    )}
                    {!resume && resumeFromAts && (
                      <div className="flex items-center gap-2 p-3 bg-blue-50 text-blue-700 dark:bg-blue-950/30 dark:text-blue-400 rounded-md border border-blue-200 dark:border-blue-900">
                        <FileText className="w-4 h-4" />
                        <span className="text-sm font-medium">Using your saved resume from ATS. You can upload a new one to replace it, or just click Next.</span>
                      </div>
                    )}
                  </CardContent>
                </>
              )}

              {step === 2 && (
                <>
                  <CardHeader>
                    <CardTitle className="text-2xl">Target Job</CardTitle>
                    <CardDescription>Tell us about the job you are applying for.</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label className="text-sm font-medium">Job Title</label>
                        <Input 
                          placeholder="e.g. Frontend Developer" 
                          value={jobTitle}
                          onChange={(e) => setJobTitle(e.target.value)}
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-medium">Company (Optional)</label>
                        <Input 
                          placeholder="e.g. Google" 
                          value={company}
                          onChange={(e) => setCompany(e.target.value)}
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Job Description</label>
                      <textarea 
                        className="flex min-h-[120px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                        placeholder="Paste the job description here..."
                        value={jobDescription}
                        onChange={(e) => setJobDescription(e.target.value)}
                      />
                    </div>
                  </CardContent>
                </>
              )}

              {step === 3 && (
                <>
                  <CardHeader>
                    <CardTitle className="text-2xl">Interview Configuration</CardTitle>
                    <CardDescription>Customize how you want to be interviewed.</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="space-y-3">
                      <label className="text-sm font-medium">Interview Type</label>
                      <div className="grid grid-cols-3 gap-3">
                        {['Technical', 'Behavioral', 'Mixed'].map(type => (
                          <div 
                            key={type}
                            onClick={() => setInterviewType(type)}
                            className={`p-3 text-center text-sm font-medium rounded-md border cursor-pointer transition-all ${interviewType === type ? 'border-primary bg-primary/10 text-primary' : 'border-border hover:border-primary/50'}`}
                          >
                            {type}
                          </div>
                        ))}
                      </div>
                    </div>
                    <div className="space-y-3">
                      <label className="text-sm font-medium">Difficulty</label>
                      <div className="grid grid-cols-3 gap-3">
                        {['Easy', 'Medium', 'Hard'].map(level => (
                          <div 
                            key={level}
                            onClick={() => setDifficulty(level)}
                            className={`p-3 text-center text-sm font-medium rounded-md border cursor-pointer transition-all ${difficulty === level ? 'border-primary bg-primary/10 text-primary' : 'border-border hover:border-primary/50'}`}
                          >
                            {level}
                          </div>
                        ))}
                      </div>
                    </div>
                    <div className="space-y-3">
                      <label className="text-sm font-medium">Experience Level</label>
                      <div className="grid grid-cols-3 gap-3">
                        {['Entry', '1-3 years', 'Senior'].map(exp => (
                          <div 
                            key={exp}
                            onClick={() => setExperience(exp)}
                            className={`p-3 text-center text-sm font-medium rounded-md border cursor-pointer transition-all ${experience === exp ? 'border-primary bg-primary/10 text-primary' : 'border-border hover:border-primary/50'}`}
                          >
                            {exp}
                          </div>
                        ))}
                      </div>
                    </div>
                  </CardContent>
                </>
              )}

              {step === 4 && (
                <>
                  <CardHeader>
                    <CardTitle className="text-2xl">Ready to Start</CardTitle>
                    <CardDescription>Review your interview configuration before we begin.</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="rounded-xl border border-border bg-muted/30 p-6 space-y-4">
                      <div>
                        <h4 className="text-lg font-semibold">{jobTitle} {company && `at ${company}`}</h4>
                        <div className="flex flex-wrap gap-2 mt-2">
                          <span className="px-2 py-1 text-xs rounded-md bg-secondary text-secondary-foreground border border-border">Based on your resume</span>
                          <span className="px-2 py-1 text-xs rounded-md bg-secondary text-secondary-foreground border border-border">Based on job description</span>
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-y-4 text-sm pt-4 border-t border-border">
                        <div>
                          <span className="text-muted-foreground block mb-1">Type</span>
                          <span className="font-medium">{interviewType}</span>
                        </div>
                        <div>
                          <span className="text-muted-foreground block mb-1">Difficulty</span>
                          <span className="font-medium">{difficulty}</span>
                        </div>
                        <div>
                          <span className="text-muted-foreground block mb-1">Experience</span>
                          <span className="font-medium">{experience}</span>
                        </div>
                        <div>
                          <span className="text-muted-foreground block mb-1">Estimated Time</span>
                          <span className="font-medium">~30 minutes</span>
                        </div>
                      </div>
                      
                    </div>
                  </CardContent>
                </>
              )}
            </motion.div>
          </AnimatePresence>

          <div className="p-6 pt-0 flex justify-between border-t border-border mt-4 bg-muted/10 rounded-b-xl">
            {step > 1 ? (
              <Button variant="outline" onClick={handleBack} className="mt-4 border-border">
                <ArrowLeft className="w-4 h-4 mr-2" /> Back
              </Button>
            ) : (
              <div></div>
            )}
            
            {step < 4 ? (
              <Button onClick={handleNext} disabled={loading} className="mt-4 bg-primary text-primary-foreground hover:bg-primary/90">
                {loading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
                Continue <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            ) : (
              <Button onClick={handleStartInterview} className="mt-4 bg-primary text-primary-foreground hover:bg-primary/90 px-8">
                Start Interview <PlayCircle className="w-4 h-4 ml-2" />
              </Button>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
};

export default Form;