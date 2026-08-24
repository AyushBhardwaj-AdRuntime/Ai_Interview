import { SEO } from "@/components/seo/SEO";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { Users, Zap, ShieldCheck } from "lucide-react";
import { motion } from "framer-motion";

const HiringTeams = () => {
  return (
    <>
      <SEO 
        title="For Hiring Teams"
        description="Scale your technical screening process with MockHire. Screen candidates fairly and quickly with standardized AI interviews."
        canonical="/teams"
      />
      <div className="min-h-screen bg-background pt-24 pb-16">
        <div className="container mx-auto px-4 md:px-6 max-w-5xl">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center space-y-4 mb-16"
          >
            <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-foreground">
              MockHire for Hiring Teams
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Automate initial technical screens. Free up your engineering team's time while giving candidates a standardized, unbiased interview experience.
            </p>
            <div className="pt-4">
              <Button asChild size="lg">
                <Link to="/contact">Contact Sales</Link>
              </Button>
            </div>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8">
            <Card className="bg-card border-border shadow-sm">
              <CardHeader>
                <Zap className="w-10 h-10 text-primary mb-4" />
                <CardTitle>Save Engineering Hours</CardTitle>
              </CardHeader>
              <CardContent className="text-muted-foreground">
                Stop pulling your best senior engineers off of critical product work to conduct 1st-round technical screens. Let MockHire handle the fundamentals.
              </CardContent>
            </Card>

            <Card className="bg-card border-border shadow-sm">
              <CardHeader>
                <ShieldCheck className="w-10 h-10 text-primary mb-4" />
                <CardTitle>Standardized & Unbiased</CardTitle>
              </CardHeader>
              <CardContent className="text-muted-foreground">
                Every candidate gets exactly the same baseline questions for a given role, evaluated by an objective AI without human bias, ensuring fair hiring practices.
              </CardContent>
            </Card>

            <Card className="bg-card border-border shadow-sm">
              <CardHeader>
                <Users className="w-10 h-10 text-primary mb-4" />
                <CardTitle>Better Candidate Experience</CardTitle>
              </CardHeader>
              <CardContent className="text-muted-foreground">
                Candidates can take the screening interview on their own schedule without stressful scheduling back-and-forths, reducing drop-off rates in your pipeline.
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </>
  );
};

export default HiringTeams;
