import React, { useState } from 'react';
import { Mail, ArrowRight, CheckCircle2, Send } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';

import { SEO } from "@/components/seo/SEO";

export default function Contact() {
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // Web3Forms Integration - Free & requires no backend
    // To make this work: Go to https://web3forms.com/, get your free access key, and paste it below
    const formData = new FormData(e.currentTarget);
    formData.append("access_key", "e0b78000-c036-46d5-ac56-07f46fc674a1"); 

    try {
      const res = await fetch("https://api.web3forms.com/submit", {
        method: "POST",
        body: formData
      });
      const data = await res.json();
      if (data.success) {
        setIsSubmitted(true);
      }
    } catch (error) {
      console.error("Error submitting form", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-background pt-24 pb-16">
      <SEO 
        title="Contact Us"
        description="Get in touch with the MockHire team for support, feedback, or business inquiries."
        canonical="/contact"
      />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header section */}
        <div className="text-center max-w-2xl mx-auto mb-16 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-secondary/10 border border-secondary/20 text-sm font-medium text-secondary mb-6">
            <span className="w-2 h-2 rounded-full bg-secondary animate-pulse"></span>
            Open to work & networking
          </div>
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-4">Let's Connect</h1>
          <p className="text-lg text-muted-foreground leading-relaxed">
            Hi, I'm <span className="font-semibold text-foreground">Ayush</span>. I built MockHire to help people nail their interviews. Whether you're a recruiter, a fellow developer, or a user with feedback, I'd love to hear from you!
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-12 lg:gap-20">
          {/* Contact Information */}
          <div className="space-y-8 animate-in fade-in slide-in-from-left-8 duration-700 delay-100">
            <div>
              <h2 className="text-2xl font-bold mb-6">Where to find me</h2>
              <div className="space-y-6">
                
                {/* Email */}
                <a href="mailto:your.email@gmail.com" className="flex items-start gap-4 group cursor-pointer transition-all hover:bg-muted/30 p-3 -m-3 rounded-2xl">
                  <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center shrink-0 border border-primary/20 group-hover:scale-105 transition-transform">
                    <Mail className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg mb-1 group-hover:text-primary transition-colors">Email</h3>
                    <p className="text-muted-foreground mb-1 text-sm">Direct to my inbox.</p>
                    <p className="text-foreground font-medium">your.email@gmail.com</p>
                  </div>
                </a>

                {/* LinkedIn */}
                <a href="https://www.linkedin.com/in/ayushbhardwaj-dev/" target="_blank" rel="noreferrer" className="flex items-start gap-4 group cursor-pointer transition-all hover:bg-muted/30 p-3 -m-3 rounded-2xl">
                  <div className="w-12 h-12 rounded-2xl bg-[#0a66c2]/10 flex items-center justify-center shrink-0 border border-[#0a66c2]/20 group-hover:scale-105 transition-transform">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5 text-[#0a66c2]"><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"/><rect width="4" height="12" x="2" y="9"/><circle cx="4" cy="4" r="2"/></svg>
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg mb-1 group-hover:text-[#0a66c2] transition-colors">LinkedIn</h3>
                    <p className="text-muted-foreground mb-1 text-sm">Let's connect professionally.</p>
                    <p className="text-foreground font-medium">Connect on LinkedIn</p>
                  </div>
                </a>
                
                {/* GitHub */}
                <a href="https://github.com/AyushBhardwaj-AdRuntime" target="_blank" rel="noreferrer" className="flex items-start gap-4 group cursor-pointer transition-all hover:bg-muted/30 p-3 -m-3 rounded-2xl">
                  <div className="w-12 h-12 rounded-2xl bg-secondary/20 flex items-center justify-center shrink-0 border border-secondary/30 group-hover:scale-105 transition-transform">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5 text-secondary"><path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4"/><path d="M9 18c-4.51 2-5-2-7-2"/></svg>
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg mb-1 group-hover:text-secondary transition-colors">GitHub</h3>
                    <p className="text-muted-foreground mb-1 text-sm">Check out my code and other projects.</p>
                    <p className="text-foreground font-medium">View GitHub Profile</p>
                  </div>
                </a>

              </div>
            </div>

            <div className="p-6 bg-muted/30 rounded-3xl border border-border mt-8 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full blur-2xl -mr-10 -mt-10"></div>
              <h3 className="font-bold text-lg mb-2 relative z-10">Looking to hire?</h3>
              <p className="text-sm text-muted-foreground mb-4 relative z-10">
                I'm currently exploring new opportunities in Software Engineering and Full Stack Development. I'd love to chat about how my skills can bring value to your team.
              </p>
              <a href="https://linkedin.com/in/your-profile" target="_blank" rel="noreferrer">
                <Button variant="outline" className="w-full rounded-full border-secondary/50 hover:bg-secondary/10 hover:text-secondary relative z-10">
                  View my Resume on LinkedIn
                </Button>
              </a>
            </div>
          </div>

          {/* Contact Form */}
          <div className="animate-in fade-in slide-in-from-right-8 duration-700 delay-200">
            <div className="bg-card rounded-3xl p-8 border border-border shadow-sm relative overflow-hidden">
              <h2 className="text-2xl font-bold mb-6">Send a direct message</h2>
              
              {isSubmitted ? (
                <div className="text-center py-12">
                  <div className="w-16 h-16 bg-secondary/20 rounded-full flex items-center justify-center mx-auto mb-4 animate-in zoom-in duration-300">
                    <CheckCircle2 className="w-8 h-8 text-secondary" />
                  </div>
                  <h3 className="text-xl font-bold mb-2">Message sent!</h3>
                  <p className="text-muted-foreground mb-6">Thanks for reaching out! I'll get back to you as soon as I can.</p>
                  <Button onClick={() => setIsSubmitted(false)} variant="outline" className="rounded-full">
                    Send another message
                  </Button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4 relative z-10">
                  {/* Hidden subject field for Web3Forms email formatting */}
                  <input type="hidden" name="subject" value="New message from MockHire Contact Form!" />
                  <input type="hidden" name="from_name" value="MockHire Platform" />
                  
                  <div className="space-y-2">
                    <label htmlFor="name" className="text-sm font-medium">Your Name</label>
                    <Input id="name" name="name" placeholder="John Doe" required className="rounded-xl h-11 bg-background" />
                  </div>
                  
                  <div className="space-y-2">
                    <label htmlFor="email" className="text-sm font-medium">Your Email</label>
                    <Input id="email" name="email" type="email" placeholder="john@example.com" required className="rounded-xl h-11 bg-background" />
                  </div>
                  
                  <div className="space-y-2">
                    <label htmlFor="message" className="text-sm font-medium">Message</label>
                    <Textarea 
                      id="message" 
                      name="message"
                      placeholder="Hi Ayush, I really liked MockHire and wanted to chat about..." 
                      rows={5}
                      required 
                      className="rounded-xl resize-none bg-background"
                    />
                  </div>
                  
                  <Button type="submit" disabled={isSubmitting} className="w-full h-12 rounded-full bg-primary text-primary-foreground hover:bg-primary/90 mt-2 text-base font-medium transition-all group">
                    {isSubmitting ? 'Sending...' : (
                      <>
                        Send Message <Send className="ml-2 w-4 h-4 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                      </>
                    )}
                  </Button>
                </form>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
