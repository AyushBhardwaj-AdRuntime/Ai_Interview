import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { ArrowRight, Sparkles, Target, Briefcase, Mic, CheckCircle2, BarChart } from "lucide-react";
import { SignInButton, SignUpButton, SignedIn, SignedOut, UserButton } from "@clerk/clerk-react";
export default function Landing() {
  return (
    <div className="min-h-screen bg-background text-foreground selection:bg-primary selection:text-primary-foreground overflow-x-hidden font-sans">
      
      {/* NAVBAR */}
      <nav className="fixed top-0 w-full bg-background/90 backdrop-blur-md z-50 border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center text-primary-foreground font-bold text-xl">M</div>
            <span className="font-bold text-xl tracking-tight text-foreground">MockHire</span>
          </div>
          <div className="hidden md:flex items-center gap-8 text-sm font-medium text-muted-foreground">
            <a href="#product" className="hover:text-foreground transition-colors">Product</a>
            <a href="#how-it-works" className="hover:text-foreground transition-colors">How it works</a>
            <a href="#pricing" className="hover:text-foreground transition-colors">Pricing</a>
          </div>
          <div className="flex items-center gap-4">
            <SignedOut>
              <SignInButton mode="modal">
                <Button variant="ghost" className="hidden sm:inline-flex">Log in</Button>
              </SignInButton>
              <SignUpButton mode="modal">
                <Button className="bg-primary text-primary-foreground hover:bg-primary/90 rounded-full px-6">Get Started</Button>
              </SignUpButton>
            </SignedOut>
            <SignedIn>
              <Link to="/dashboard">
                <Button variant="outline" className="hidden sm:inline-flex rounded-full">Dashboard</Button>
              </Link>
              <Link to="/setup">
                <Button className="bg-primary text-primary-foreground hover:bg-primary/90 rounded-full px-6">New Interview</Button>
              </Link>
              <UserButton afterSignOutUrl="/" />
            </SignedIn>
          </div>
        </div>
      </nav>

      <main className="pt-28 pb-12">
        {/* HERO */}
        <section className="px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto text-center space-y-5 pt-8">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-secondary/50 border border-border text-sm font-medium text-secondary-foreground animate-in fade-in slide-in-from-bottom-4 duration-500">
            <Sparkles className="w-4 h-4 text-primary" />
            <span>The ultimate AI interview coach</span>
          </div>
          
          <h1 className="text-4xl sm:text-5xl md:text-7xl font-bold tracking-tight text-foreground leading-[1.1] pt-2 animate-in fade-in slide-in-from-bottom-4 duration-500 delay-100">
            Practice for the job you <span className="text-primary relative whitespace-nowrap">actually want.</span>
          </h1>
          
          <p className="text-base sm:text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed animate-in fade-in slide-in-from-bottom-4 duration-500 delay-200">
            Upload your resume, add a job description, and take a realistic AI interview. Find your weaknesses and improve before the real thing.
          </p>
          
          <div className="flex flex-col items-center justify-center gap-2 pt-4 animate-in fade-in slide-in-from-bottom-4 duration-500 delay-300">
            <Link to="/setup" className="w-full sm:w-auto">
              <Button size="lg" className="w-full sm:w-auto bg-primary text-primary-foreground hover:bg-primary/90 h-14 px-8 rounded-full text-lg shadow-sm shadow-primary/20 transition-all hover:scale-[1.02]">
                Start Your Interview <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
            </Link>
            <span className="text-sm text-muted-foreground mt-1 font-medium">Free to try · No credit card required</span>
          </div>

          <div className="mt-12 max-w-3xl mx-auto animate-in fade-in slide-in-from-bottom-8 duration-700 delay-500">
            <div className="rounded-2xl border border-border bg-card shadow-xl shadow-primary/5 overflow-hidden">
              <div className="h-10 bg-muted/30 border-b border-border flex items-center px-4 gap-2">
                <div className="w-3 h-3 rounded-full bg-destructive/80"></div>
                <div className="w-3 h-3 rounded-full bg-chart-4/80"></div>
                <div className="w-3 h-3 rounded-full bg-chart-3/80"></div>
                <div className="mx-auto text-xs font-medium text-muted-foreground">MockHire Session</div>
              </div>
              <div className="p-8 text-center flex flex-col items-center justify-center bg-gradient-to-b from-card to-muted/20">
                <div className="w-14 h-14 bg-primary/10 rounded-full flex items-center justify-center mb-5">
                  <Mic className="w-7 h-7 text-primary" />
                </div>
                <h3 className="text-xl sm:text-2xl font-semibold mb-5 max-w-lg">"Tell me about a time you had to optimize a slow, complex system."</h3>
                <div className="flex items-center gap-1 h-10">
                  {[4, 8, 12, 16, 10, 6, 14, 20, 16, 8, 4, 12, 18, 14, 6].map((h, i) => (
                    <div key={i} className="w-1.5 bg-primary/70 rounded-full animate-pulse" style={{ minHeight: `${h}px`, animationDelay: `${i * 150}ms`, animationDuration: '1.2s' }} />
                  ))}
                </div>
                <p className="text-xs text-primary font-medium mt-4 animate-pulse">Listening...</p>
              </div>
            </div>
          </div>
        </section>

        {/* TRUST */}
        <section className="py-12 border-y border-border bg-muted/10 mt-16">
          <div className="max-w-7xl mx-auto px-4 text-center">
            <p className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-6">Built for candidates targeting</p>
            <div className="flex flex-wrap justify-center gap-6 md:gap-12 text-base md:text-lg font-medium text-secondary-foreground/70">
              <span>Software Engineering</span>
              <span>Product Management</span>
              <span>Data Science</span>
              <span>Marketing</span>
            </div>
          </div>
        </section>

        {/* HOW IT WORKS */}
        <section id="how-it-works" className="py-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-3">How it works</h2>
            <p className="text-muted-foreground">Three steps to interview readiness.</p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-14 h-14 bg-secondary text-secondary-foreground rounded-2xl flex items-center justify-center text-xl font-bold mx-auto mb-4">01</div>
              <h3 className="text-lg font-semibold mb-2">Upload resume</h3>
              <p className="text-muted-foreground text-sm">We tailor the interview to your specific background.</p>
            </div>
            <div className="text-center">
              <div className="w-14 h-14 bg-secondary text-secondary-foreground rounded-2xl flex items-center justify-center text-xl font-bold mx-auto mb-4">02</div>
              <h3 className="text-lg font-semibold mb-2">Add the job</h3>
              <p className="text-muted-foreground text-sm">Paste the job description so we ask exactly what they will.</p>
            </div>
            <div className="text-center">
              <div className="w-14 h-14 bg-primary text-primary-foreground rounded-2xl flex items-center justify-center text-xl font-bold mx-auto mb-4 shadow-md shadow-primary/20">03</div>
              <h3 className="text-lg font-semibold mb-2">Take the interview</h3>
              <p className="text-muted-foreground text-sm">Speak naturally with our AI. Get grilled, get feedback.</p>
            </div>
          </div>
        </section>

        {/* FEATURES */}
        <section id="product" className="py-16 bg-card border-y border-border">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid sm:grid-cols-3 gap-6">
              <div>
                <Briefcase className="w-7 h-7 text-primary mb-3" />
                <h3 className="text-base font-semibold mb-2">Tailored to You</h3>
                <p className="text-sm text-muted-foreground">Questions generated dynamically based on your unique resume and target job.</p>
              </div>
              <div>
                <Sparkles className="w-7 h-7 text-primary mb-3" />
                <h3 className="text-base font-semibold mb-2">Realistic Voice AI</h3>
                <p className="text-sm text-muted-foreground">Experience real pressure. Our AI listens, responds, and adapts to your answers.</p>
              </div>
              <div>
                <Target className="w-7 h-7 text-primary mb-3" />
                <h3 className="text-base font-semibold mb-2">Actionable Feedback</h3>
                <p className="text-sm text-muted-foreground">See exactly what you did well, where you stumbled, and how to improve.</p>
              </div>
            </div>
          </div>
        </section>

        {/* RESULTS SECTION */}
        <section className="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl font-bold mb-4">Don't just practice.<br />Know where you stand.</h2>
              <p className="text-muted-foreground text-base mb-6">Get a comprehensive breakdown of your performance instantly.</p>
              <ul className="space-y-3">
                <li className="flex items-center gap-3"><CheckCircle2 className="w-5 h-5 text-primary" /> <span className="font-medium text-sm">Overall readiness score</span></li>
                <li className="flex items-center gap-3"><CheckCircle2 className="w-5 h-5 text-primary" /> <span className="font-medium text-sm">Technical vs Communication breakdown</span></li>
                <li className="flex items-center gap-3"><CheckCircle2 className="w-5 h-5 text-primary" /> <span className="font-medium text-sm">Identified strengths</span></li>
                <li className="flex items-center gap-3"><CheckCircle2 className="w-5 h-5 text-primary" /> <span className="font-medium text-sm">Critical areas for improvement</span></li>
              </ul>
            </div>
            <div className="bg-muted/30 p-6 rounded-3xl border border-border">
              <div className="bg-card p-5 rounded-2xl shadow-sm border border-border">
                <div className="flex justify-between items-center mb-5">
                  <h4 className="font-semibold text-base">Interview Score</h4>
                  <span className="text-2xl font-bold text-primary">78<span className="text-sm text-muted-foreground">/100</span></span>
                </div>
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between text-xs mb-1.5"><span className="text-muted-foreground">Technical</span> <span className="font-medium">84</span></div>
                    <div className="w-full bg-muted rounded-full h-1.5"><div className="bg-chart-3 h-1.5 rounded-full" style={{ width: '84%' }}></div></div>
                  </div>
                  <div>
                    <div className="flex justify-between text-xs mb-1.5"><span className="text-muted-foreground">Communication</span> <span className="font-medium">71</span></div>
                    <div className="w-full bg-muted rounded-full h-1.5"><div className="bg-chart-4 h-1.5 rounded-full" style={{ width: '71%' }}></div></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* PERSONALIZED PRACTICE */}
        <section className="py-20 bg-primary text-primary-foreground relative overflow-hidden">
          <div className="max-w-5xl mx-auto px-4 text-center relative z-10">
            <BarChart className="w-10 h-10 mx-auto mb-4 opacity-90" />
            <h2 className="text-3xl font-bold mb-4">Know exactly what to practice next.</h2>
            <p className="text-primary-foreground/90 text-base max-w-2xl mx-auto mb-10">
              MockHire builds a personalized practice plan focusing exclusively on your weak spots, so every minute you spend preparing actually increases your chances.
            </p>
            
            {/* Visual Feedback Mock */}
            <div className="bg-card text-foreground rounded-2xl p-6 text-left max-w-md mx-auto shadow-2xl border border-white/10">
              <h4 className="font-semibold mb-4 text-sm uppercase tracking-wider text-muted-foreground border-b border-border pb-2">Your Practice Plan</h4>
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <span className="w-2 h-2 rounded-full bg-destructive mt-1.5 shrink-0"></span>
                  <div>
                    <p className="text-sm font-semibold">System Design</p>
                    <p className="text-xs text-muted-foreground">Practice scaling architectures and load balancers.</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <span className="w-2 h-2 rounded-full bg-chart-4 mt-1.5 shrink-0"></span>
                  <div>
                    <p className="text-sm font-semibold">Communication</p>
                    <p className="text-xs text-muted-foreground">Structure answers strictly using the STAR method.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* FINAL CTA */}
        <section className="py-24 max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">Ready to nail your next interview?</h2>
          <Link to="/setup">
            <Button size="lg" className="bg-primary text-primary-foreground hover:bg-primary/90 h-14 px-8 rounded-full text-lg shadow-lg shadow-primary/20 transition-all hover:scale-[1.02]">
              Start Your Interview <ArrowRight className="ml-2 w-5 h-5" />
            </Button>
          </Link>
          <p className="text-sm text-muted-foreground mt-4 font-medium">Takes 60 seconds to set up.</p>
        </section>
      </main>

      {/* FOOTER */}
      <footer className="border-t border-border bg-card/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="col-span-1 md:col-span-2">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-6 h-6 rounded-md bg-primary flex items-center justify-center text-primary-foreground font-bold text-xs">M</div>
                <span className="font-bold text-lg tracking-tight text-foreground">MockHire</span>
              </div>
              <p className="text-sm text-muted-foreground max-w-xs leading-relaxed">
                The ultimate AI interview coach. Practice for the job you actually want, get realistic interviews, and receive actionable feedback.
              </p>
            </div>
            <div>
              <h4 className="font-semibold text-foreground mb-3 text-sm">Product</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><Link to="/setup" className="hover:text-primary transition-colors">Start Interview</Link></li>
                <li><Link to="#" className="hover:text-primary transition-colors">ATS Checker</Link></li>
                <li><Link to="#" className="hover:text-primary transition-colors">Pricing</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-foreground mb-3 text-sm">Legal</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><Link to="#" className="hover:text-primary transition-colors">Privacy Policy</Link></li>
                <li><Link to="#" className="hover:text-primary transition-colors">Terms of Service</Link></li>
                <li><Link to="#" className="hover:text-primary transition-colors">Contact</Link></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-border mt-10 pt-6 flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-xs text-muted-foreground">© {new Date().getFullYear()} MockHire. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
