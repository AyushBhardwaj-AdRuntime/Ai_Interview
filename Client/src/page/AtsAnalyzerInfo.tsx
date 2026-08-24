import { SEO } from "@/components/seo/SEO";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { ArrowRight, FileSearch } from "lucide-react";
import { motion } from "framer-motion";

const AtsAnalyzerInfo = () => {
  return (
    <>
      <SEO 
        title="ATS Resume Analyzer"
        description="Check your resume ATS score against any job description. MockHire's ATS Analyzer breaks down keyword matching, formatting, and missing skills to help you pass the screening."
        canonical="/ats-analyzer"
      />
      <div className="min-h-screen bg-background pt-24 pb-16">
        <div className="container mx-auto px-4 md:px-6 max-w-5xl">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center space-y-4 mb-16"
          >
            <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-foreground">
              ATS Resume Analyzer
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Beat the Applicant Tracking System. See exactly what recruiters see when your resume is parsed by automated hiring software.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 gap-12 items-center mb-16">
            <Card className="bg-card border-border shadow-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileSearch className="w-5 h-5 text-primary" />
                  Why check your ATS score?
                </CardTitle>
                <CardDescription>Over 75% of resumes are rejected before a human reads them.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4 text-muted-foreground">
                <p>
                  Modern companies use Applicant Tracking Systems (ATS) to filter out resumes that don't match the job description. Even if you're the perfect candidate, poor formatting or missing keywords can get your resume automatically discarded.
                </p>
                <p>
                  Our ATS Analyzer uses industry-standard parsing algorithms to score your resume against the target job description. We highlight exact keyword matches, identify missing critical skills, and warn you about formatting issues that might break the parser.
                </p>
              </CardContent>
            </Card>

            <div className="space-y-6">
              <h2 className="text-3xl font-bold">Actionable Insights</h2>
              <div className="space-y-4 text-muted-foreground">
                <p>
                  <strong>1. Match Percentage:</strong> Get a clear score showing how well your experience aligns with the job requirements.
                </p>
                <p>
                  <strong>2. Keyword Gap Analysis:</strong> See exactly which required skills, tools, or methodologies are missing from your resume.
                </p>
                <p>
                  <strong>3. Formatting Checks:</strong> Ensure your layout, fonts, and file format are ATS-friendly.
                </p>
              </div>
              <Button asChild size="lg" className="mt-4">
                <Link to="/ats">
                  Try the ATS Analyzer <ArrowRight className="ml-2 w-4 h-4" />
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default AtsAnalyzerInfo;
