import { SEO } from "@/components/seo/SEO";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { ArrowRight, CheckCircle2 } from "lucide-react";
import { motion } from "framer-motion";

const AiInterviewInfo = () => {
  return (
    <>
      <SEO 
        title="AI Mock Interviews"
        description="Experience realistic voice-based mock interviews tailored to your job description and resume. Get instant feedback and improve your software engineering interview skills."
        canonical="/ai-interview"
      />
      <div className="min-h-screen bg-background pt-24 pb-16">
        <div className="container mx-auto px-4 md:px-6 max-w-5xl">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center space-y-4 mb-16"
          >
            <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-foreground">
              Realistic AI Mock Interviews
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Stop practicing in the mirror. Have actual voice conversations with our advanced AI interviewer tailored specifically to your target role.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 gap-12 items-center mb-16">
            <div className="space-y-6">
              <h2 className="text-3xl font-bold">How MockHire AI Works</h2>
              <div className="space-y-4">
                {[
                  "Upload your current resume",
                  "Paste the specific job description you want to target",
                  "Configure the difficulty and interview type (Technical, Behavioral, etc.)",
                  "Engage in a live, voice-to-voice interview just like a real Zoom call",
                  "Receive immediate, actionable feedback on your answers"
                ].map((step, i) => (
                  <div key={i} className="flex gap-3 items-start">
                    <CheckCircle2 className="w-6 h-6 text-primary shrink-0" />
                    <p className="text-muted-foreground">{step}</p>
                  </div>
                ))}
              </div>
              <Button asChild size="lg" className="mt-4">
                <Link to="/setup">
                  Start Your Mock Interview <ArrowRight className="ml-2 w-4 h-4" />
                </Link>
              </Button>
            </div>
            
            <Card className="bg-card border-border shadow-sm">
              <CardHeader>
                <CardTitle>Why use an AI Interviewer?</CardTitle>
                <CardDescription>The data behind deliberate practice</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4 text-muted-foreground">
                <p>
                  Traditional mock interviews require scheduling with peers or paying expensive coaches. MockHire is available 24/7, never gets tired, and doesn't judge you while you're learning.
                </p>
                <p>
                  Because the AI reads your resume and the target job description, the questions are exactly what you'll face in the real interview—not generic leetcode questions pulled from a database.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </>
  );
};

export default AiInterviewInfo;
