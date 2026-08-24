import { SEO } from "@/components/seo/SEO";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { CheckCircle2 } from "lucide-react";
import { motion } from "framer-motion";

const Pricing = () => {
  return (
    <>
      <SEO 
        title="Pricing"
        description="View pricing for MockHire AI Mock Interviews and ATS Analyzer. Start practicing for your next software engineering role today."
        canonical="/pricing"
      />
      <div className="min-h-screen bg-background pt-24 pb-16">
        <div className="container mx-auto px-4 md:px-6 max-w-5xl">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center space-y-4 mb-16"
          >
            <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-foreground">
              Simple, transparent pricing
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              MockHire is currently entirely free while we are in open beta. Pro tiers with advanced features are coming soon.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {/* Free Tier */}
            <Card className="bg-card border-border shadow-sm flex flex-col">
              <CardHeader>
                <CardTitle className="text-2xl">Open Beta (Free)</CardTitle>
                <CardDescription>Everything you need to start practicing.</CardDescription>
                <div className="text-4xl font-bold pt-4">$0 <span className="text-lg text-muted-foreground font-normal">/ month</span></div>
              </CardHeader>
              <CardContent className="flex-1 flex flex-col">
                <div className="space-y-4 flex-1">
                  {[
                    "Unlimited ATS Resume Analysis",
                    "AI Voice Interviews",
                    "Feedback & Performance Metrics",
                    "Custom Job Descriptions"
                  ].map((feature, i) => (
                    <div key={i} className="flex gap-3 items-center">
                      <CheckCircle2 className="w-5 h-5 text-primary shrink-0" />
                      <span className="text-muted-foreground">{feature}</span>
                    </div>
                  ))}
                </div>
                <Button asChild size="lg" className="mt-8 w-full">
                  <Link to="/setup">Start for free</Link>
                </Button>
              </CardContent>
            </Card>

            {/* Pro Tier (Coming Soon) */}
            <Card className="bg-muted/30 border-border shadow-sm flex flex-col relative overflow-hidden">
              <div className="absolute top-4 right-4 bg-primary text-primary-foreground text-xs font-bold px-2 py-1 rounded">
                Coming Soon
              </div>
              <CardHeader>
                <CardTitle className="text-2xl">Pro</CardTitle>
                <CardDescription>Advanced tools for serious job seekers.</CardDescription>
                <div className="text-4xl font-bold pt-4 text-muted-foreground">TBD</div>
              </CardHeader>
              <CardContent className="flex-1 flex flex-col opacity-70">
                <div className="space-y-4 flex-1">
                  {[
                    "Everything in Free",
                    "Interview Recording & Playback",
                    "System Design Interview Mode",
                    "Priority AI Server Access",
                    "Personalized Improvement Plan"
                  ].map((feature, i) => (
                    <div key={i} className="flex gap-3 items-center">
                      <CheckCircle2 className="w-5 h-5 text-muted-foreground shrink-0" />
                      <span className="text-muted-foreground">{feature}</span>
                    </div>
                  ))}
                </div>
                <Button variant="outline" size="lg" className="mt-8 w-full cursor-not-allowed" disabled>
                  Coming Soon
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </>
  );
};

export default Pricing;
