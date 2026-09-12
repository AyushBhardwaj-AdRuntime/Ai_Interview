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
                  <th className="py-3 px-4 font-semibold text-muted-foreground">Explanation</th>
                </tr>
              </thead>
              <tbody>
                {report.claimVerification?.map((claim: any, i: number) => (
                  <tr key={i} className="border-b border-border/50 hover:bg-muted/10 transition-colors">
                    <td className="py-4 px-4 font-medium max-w-[200px] truncate" title={claim.claim}>{claim.claim}</td>
                    <td className="py-4 px-4"><Badge variant="outline">{claim.skill}</Badge></td>
                    <td className="py-4 px-4">{getStatusBadge(claim.status)}</td>
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

    </div>
  );
};

const ArrowRightIcon = (props: any) => (
  <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M5 12h14" />
    <path d="m12 5 7 7-7 7" />
  </svg>
)

export default CandidateReport;
