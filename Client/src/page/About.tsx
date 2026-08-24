import { SEO } from "@/components/seo/SEO";
import { motion } from "framer-motion";

const About = () => {
  return (
    <>
      <SEO 
        title="About Us"
        description="Learn about the MockHire mission to democratize interview preparation using advanced AI, helping software engineers land their dream jobs."
        canonical="/about"
      />
      <div className="min-h-screen bg-background pt-24 pb-16">
        <div className="container mx-auto px-4 md:px-6 max-w-3xl">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-8"
          >
            <div className="text-center space-y-4 mb-12">
              <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-foreground">
                About MockHire
              </h1>
              <p className="text-xl text-muted-foreground">
                Leveling the playing field for software engineering interviews.
              </p>
            </div>

            <div className="prose prose-neutral dark:prose-invert max-w-none space-y-6 text-muted-foreground">
              <p className="text-lg">
                MockHire was built with a single goal: to help candidates walk into their interviews with total confidence. We believe that acing an interview is a separate skill from doing the job, and it's a skill that requires deliberate practice.
              </p>
              
              <h2 className="text-2xl font-semibold text-foreground pt-4">The Problem</h2>
              <p>
                Traditional mock interviews are hard to schedule, expensive, and often biased. On the other hand, practicing in front of a mirror or recording yourself lacks the dynamic, unpredictable nature of a real conversation. As a result, many brilliant engineers fail to showcase their true potential simply because they freeze up under pressure.
              </p>

              <h2 className="text-2xl font-semibold text-foreground pt-4">The Solution</h2>
              <p>
                By leveraging advanced LLMs and real-time voice technology, MockHire simulates the stress, unpredictability, and conversational flow of a real technical or behavioral interview. Our platform analyzes your resume against a specific job description to generate highly relevant questions—just like a real hiring manager would.
              </p>

              <h2 className="text-2xl font-semibold text-foreground pt-4">Our Vision</h2>
              <p>
                We envision a hiring ecosystem where every candidate is judged on their actual merit and preparedness, not on their ability to afford a $200/hour interview coach. MockHire is your 24/7 AI interview coach, always ready to help you practice, fail safely, and learn.
              </p>
            </div>
          </motion.div>
        </div>
      </div>
    </>
  );
};

export default About;
