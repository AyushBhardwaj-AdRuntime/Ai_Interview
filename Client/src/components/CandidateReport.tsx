import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CheckCircle2, XCircle, AlertCircle, HelpCircle } from 'lucide-react';

interface CandidateReportProps {
  report: any;
}

const getStatusBadge = (status: string) => {
  switch (status) {
    case 'SUPPORTED':
      return <Badge className="bg-green-500 hover:bg-green-600"><CheckCircle2 className="w-3 h-3 mr-1" /> Supported</Badge>;
    case 'PARTIALLY':
      return <Badge className="bg-yellow-500 hover:bg-yellow-600"><AlertCircle className="w-3 h-3 mr-1" /> Partially Supported</Badge>;
    case 'CONTRADICTED':
      return <Badge className="bg-red-500 hover:bg-red-600"><XCircle className="w-3 h-3 mr-1" /> Contradicted</Badge>;
    default:
      return <Badge className="bg-gray-500 hover:bg-gray-600"><HelpCircle className="w-3 h-3 mr-1" /> Unverified</Badge>;
  }
};

const CandidateReport: React.FC<CandidateReportProps> = ({ report }) => {
  if (!report) return null;

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      
      {/* Top Section: Score & Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="col-span-1 shadow-md border-border bg-gradient-to-br from-card to-secondary/5">
          <CardHeader className="text-center pb-2">
            <CardTitle className="text-muted-foreground uppercase text-sm font-bold tracking-wider">Job Readiness</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col items-center justify-center">
            <div className="text-7xl font-black text-primary mb-2">{report.readinessScore}</div>
            <span className="text-muted-foreground font-medium">out of 100</span>
          </CardContent>
        </Card>

        <Card className="col-span-1 md:col-span-2 shadow-md border-border">
          <CardHeader>
            <CardTitle>Executive Summary</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-foreground/90 leading-relaxed text-lg">{report.summary}</p>
          </CardContent>
        </Card>
      </div>

      {/* Grid: Strengths & Skill Gaps */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="shadow-sm border-border">
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><CheckCircle2 className="text-green-500" /> Verified Strengths</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-3">
              {report.strengths?.map((strength: string, i: number) => (
                <li key={i} className="flex items-start gap-2">
                  <span className="text-green-500 mt-1">•</span>
                  <span className="text-foreground/80">{strength}</span>
                </li>
              ))}
              {(!report.strengths || report.strengths.length === 0) && (
                <li className="text-muted-foreground italic">No specific strengths highlighted.</li>
              )}
            </ul>
          </CardContent>
        </Card>

        <Card className="shadow-sm border-border">
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><AlertCircle className="text-yellow-500" /> Skill Gaps</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-4">
              {report.skillGaps?.map((gap: any, i: number) => (
                <li key={i} className="bg-muted/30 p-3 rounded-lg border border-border/50">
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-semibold">{gap.skill}</span>
                    <Badge variant={gap.severity === 'high' ? 'destructive' : 'secondary'}>
                      {gap.severity} severity
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">{gap.reason}</p>
                </li>
              ))}
              {(!report.skillGaps || report.skillGaps.length === 0) && (
                <li className="text-muted-foreground italic">No significant skill gaps identified!</li>
              )}
            </ul>
          </CardContent>
        </Card>
      </div>

      {/* Claim Verification Status */}
      <Card className="shadow-sm border-border">
        <CardHeader>
          <CardTitle>Evidence Verification Status</CardTitle>
          <CardDescription>How your resume claims held up against technical validation.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-border">
                  <th className="py-3 px-4 font-semibold text-muted-foreground">Claim</th>
                  <th className="py-3 px-4 font-semibold text-muted-foreground">Skill</th>
                  <th className="py-3 px-4 font-semibold text-muted-foreground">Status</th>
                  <th className="py-3 px-4 font-semibold text-muted-foreground">Sources</th>
                  <th className="py-3 px-4 font-semibold text-muted-foreground">Explanation</th>
                </tr>
              </thead>
              <tbody>
                {report.claimVerification?.map((claim: any, i: number) => (
                  <tr key={i} className="border-b border-border/50 hover:bg-muted/10 transition-colors">
                    <td className="py-4 px-4 font-medium max-w-[200px] truncate" title={claim.claim}>{claim.claim}</td>
                    <td className="py-4 px-4"><Badge variant="outline">{claim.skill}</Badge></td>
                    <td className="py-4 px-4">{getStatusBadge(claim.status)}</td>
                    <td className="py-4 px-4">
                      <div className="flex gap-1">
                        {claim.sources?.map((src: any, idx: number) => (
                          <Badge key={idx} variant="secondary" className={`text-[10px] uppercase ${src.type === 'github' ? 'bg-blue-500/10 text-blue-600' : src.type === 'interview' ? 'bg-purple-500/10 text-purple-600' : ''}`}>
                            {src.type}
                          </Badge>
                        ))}
                      </div>
                    </td>
                    <td className="py-4 px-4 text-sm text-muted-foreground">{claim.explanation}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            {(!report.claimVerification || report.claimVerification.length === 0) && (
              <p className="text-muted-foreground italic p-4 text-center">No claims verified.</p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Interview Summary & Recommended Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="shadow-sm border-border bg-primary/5">
          <CardHeader>
            <CardTitle>Interview Summary</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-foreground/80 leading-relaxed text-sm">{report.interviewSummary}</p>
          </CardContent>
        </Card>

        <Card className="shadow-sm border-border bg-secondary/5">
          <CardHeader>
            <CardTitle>Recommended Actions</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {report.recommendedActions?.map((action: string, i: number) => (
                <li key={i} className="flex items-start gap-2 text-sm text-foreground/80">
                  <ArrowRightIcon className="w-4 h-4 text-secondary mt-0.5 flex-shrink-0" />
                  <span>{action}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      </div>
      
      {/* Evidence Verification Pipeline Visual Trace */}
      <Card className="shadow-md border-border overflow-hidden bg-gradient-to-b from-card to-secondary/5 mt-8 relative">
        <div className="absolute top-0 right-0 p-32 opacity-10 blur-3xl rounded-full bg-primary pointer-events-none" />
        <div className="absolute bottom-0 left-0 p-32 opacity-10 blur-3xl rounded-full bg-blue-500 pointer-events-none" />
        <CardHeader className="relative z-10">
          <CardTitle className="text-2xl font-bold bg-gradient-to-r from-primary to-blue-500 bg-clip-text text-transparent inline-block">The MockHire Verification Pipeline</CardTitle>
          <CardDescription>How this AI system evaluated your readiness in real-time.</CardDescription>
        </CardHeader>
        <CardContent className="relative z-10 overflow-x-auto pb-8">
          <div className="flex items-center justify-between min-w-[800px] mt-6 px-4">
            
            {/* CLAIM */}
            <div className="flex flex-col items-center flex-1">
              <div className="w-14 h-14 rounded-full bg-card border-2 border-primary/30 flex items-center justify-center mb-3 shadow-lg">
                <FileTextIcon className="w-6 h-6 text-primary" />
              </div>
              <p className="text-sm font-bold uppercase tracking-wider text-foreground">1. Claim</p>
              <p className="text-xs text-muted-foreground text-center mt-1">Extracted from Resume</p>
            </div>
            
            <ArrowRightIcon className="w-6 h-6 text-muted-foreground/30 mx-2 flex-shrink-0" />
            
            {/* GITHUB EVIDENCE */}
            <div className="flex flex-col items-center flex-1">
              <div className="w-14 h-14 rounded-full bg-card border-2 border-blue-500/30 flex items-center justify-center mb-3 shadow-lg">
                <GithubIcon className="w-6 h-6 text-blue-500" />
              </div>
              <p className="text-sm font-bold uppercase tracking-wider text-foreground">2. GitHub</p>
              <p className="text-xs text-muted-foreground text-center mt-1">Static Evidence Analyzed</p>
            </div>

            <ArrowRightIcon className="w-6 h-6 text-muted-foreground/30 mx-2 flex-shrink-0" />
            
            {/* TARGETED QUESTION */}
            <div className="flex flex-col items-center flex-1">
              <div className="w-14 h-14 rounded-full bg-card border-2 border-purple-500/30 flex items-center justify-center mb-3 shadow-lg">
                <MicIcon className="w-6 h-6 text-purple-500" />
              </div>
              <p className="text-sm font-bold uppercase tracking-wider text-foreground">3. Probe</p>
              <p className="text-xs text-muted-foreground text-center mt-1">AI generates targeted question</p>
            </div>

            <ArrowRightIcon className="w-6 h-6 text-muted-foreground/30 mx-2 flex-shrink-0" />
            
            {/* CANDIDATE ANSWER */}
            <div className="flex flex-col items-center flex-1">
              <div className="w-14 h-14 rounded-full bg-card border-2 border-green-500/30 flex items-center justify-center mb-3 shadow-lg">
                <MessageSquareIcon className="w-6 h-6 text-green-500" />
              </div>
              <p className="text-sm font-bold uppercase tracking-wider text-foreground">4. Answer</p>
              <p className="text-xs text-muted-foreground text-center mt-1">Real-time candidate response</p>
            </div>

            <ArrowRightIcon className="w-6 h-6 text-muted-foreground/30 mx-2 flex-shrink-0" />
            
            {/* AI VERIFICATION */}
            <div className="flex flex-col items-center flex-1">
              <div className="w-14 h-14 rounded-full bg-card border-2 border-orange-500/30 flex items-center justify-center mb-3 shadow-lg">
                <BrainCircuitIcon className="w-6 h-6 text-orange-500" />
              </div>
              <p className="text-sm font-bold uppercase tracking-wider text-foreground">5. Verify</p>
              <p className="text-xs text-muted-foreground text-center mt-1">LLM validates technical depth</p>
            </div>

            <ArrowRightIcon className="w-6 h-6 text-muted-foreground/30 mx-2 flex-shrink-0" />
            
            {/* FINAL STATUS */}
            <div className="flex flex-col items-center flex-1">
              <div className="w-14 h-14 rounded-full bg-primary text-primary-foreground flex items-center justify-center mb-3 shadow-lg shadow-primary/20">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <p className="text-sm font-bold uppercase tracking-wider text-foreground">6. Status</p>
              <p className="text-xs text-muted-foreground text-center mt-1">Final Evidence Computed</p>
            </div>

          </div>
        </CardContent>
      </Card>

    </div>
  );
};

const ArrowRightIcon = (props: any) => (
  <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M5 12h14" />
    <path d="m12 5 7 7-7 7" />
  </svg>
)

const FileTextIcon = (props: any) => (
  <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z"/><path d="M14 2v4a2 2 0 0 0 2 2h4"/><path d="M10 9H8"/><path d="M16 13H8"/><path d="M16 17H8"/></svg>
)

const GithubIcon = (props: any) => (
  <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M15 22v-4a4.8 4.8 0 0 0-1-3.2c3 0 6-2 6-5.6 0-1.4-.5-2.5-1.5-3.4.1-.3.4-1.6-.1-3.4 0 0-1-.3-3.3 1.6a11.5 11.5 0 0 0-6 0C5.3 2.2 4.3 2.5 4.3 2.5c-.5 1.8-.2 3.1-.1 3.4-1 1-1.5 2-1.5 3.4 0 3.6 3 5.6 6 5.6a4.8 4.8 0 0 0-1 3.2v4"/><path d="M9 18c-4.5 1-5-2.5-5-2.5"/></svg>
)

const MicIcon = (props: any) => (
  <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z"/><path d="M19 10v2a7 7 0 0 1-14 0v-2"/><line x1="12" x2="12" y1="19" y2="22"/></svg>
)

const MessageSquareIcon = (props: any) => (
  <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
)

const BrainCircuitIcon = (props: any) => (
  <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 5a3 3 0 1 0-5.997.125 4 4 0 0 0-2.526 5.77 4 4 0 0 0 .556 6.588A4 4 0 1 0 12 18Z"/><path d="M9 13a4.5 4.5 0 0 0 3-4"/><path d="M6.003 5.125A3 3 0 0 0 6.401 6.5"/><path d="M3.477 10.896a4 4 0 0 1 .585-.396"/><path d="M6 18a4 4 0 0 1-1.968-3.038"/><path d="M12 5a3 3 0 1 1 5.997.125 4 4 0 0 1 2.526 5.77 4 4 0 0 1-.556 6.588A4 4 0 1 1 12 18Z"/><path d="M15 13a4.5 4.5 0 0 1-3-4"/><path d="M17.997 5.125A3 3 0 0 1 17.599 6.5"/><path d="M20.523 10.896a4 4 0 0 0-.585-.396"/><path d="M18 18a4 4 0 0 0 1.968-3.038"/></svg>
)

export default CandidateReport;
