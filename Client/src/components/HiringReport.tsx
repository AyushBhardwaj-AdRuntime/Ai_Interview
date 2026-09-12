import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CheckCircle2, AlertTriangle, HelpCircle, UserX, UserCheck } from 'lucide-react';

interface HiringReportProps {
  report: any;
}



const HiringReport: React.FC<HiringReportProps> = ({ report }) => {
  if (!report) return null;

  const isStrong = report.readinessScore >= 75;
  const isRisky = report.readinessScore < 50;

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      
      {/* Top Section */}
      <div className="flex flex-col md:flex-row gap-6">
        <Card className="flex-shrink-0 w-full md:w-64 shadow-md border-border bg-gradient-to-b from-card to-secondary/5">
          <CardHeader className="text-center pb-2">
            <CardTitle className="text-muted-foreground uppercase text-xs font-bold tracking-wider">Candidate Score</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col items-center justify-center">
            <div className={`text-6xl font-black mb-2 ${isStrong ? 'text-green-500' : isRisky ? 'text-red-500' : 'text-yellow-500'}`}>
              {report.readinessScore}
            </div>
            <Badge variant="outline" className="mt-2">
              {isStrong ? <><UserCheck className="w-3 h-3 mr-1 text-green-500"/> Strong Match</> : isRisky ? <><UserX className="w-3 h-3 mr-1 text-red-500"/> High Risk</> : 'Borderline'}
            </Badge>
          </CardContent>
        </Card>

        <Card className="flex-grow shadow-md border-border">
          <CardHeader>
            <CardTitle>Evaluation Summary</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-foreground/90 leading-relaxed">{report.summary}</p>
            
            <div className="mt-6 p-4 bg-muted/30 rounded-lg border border-border">
              <h4 className="font-semibold text-sm mb-2 flex items-center gap-2"><AlertTriangle className="w-4 h-4 text-destructive" /> Identified Risk Areas</h4>
              <ul className="space-y-1">
                {report.riskAreas?.map((risk: string, i: number) => (
                  <li key={i} className="text-sm text-muted-foreground flex items-start gap-2">
                    <span className="text-destructive mt-0.5">•</span> {risk}
                  </li>
                ))}
                {(!report.riskAreas || report.riskAreas.length === 0) && (
                  <li className="text-sm text-muted-foreground italic">No major risks identified.</li>
                )}
              </ul>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Verified vs Unverified Skills */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="shadow-sm border-border">
          <CardHeader>
            <CardTitle className="text-green-500 flex items-center gap-2"><CheckCircle2 className="w-5 h-5" /> Verified Skills</CardTitle>
            <CardDescription>Skills backed by technical assessment or strong GitHub evidence.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {report.verifiedSkills?.map((skill: string, i: number) => (
                <Badge key={i} variant="secondary" className="px-3 py-1 bg-green-500/10 text-green-600 hover:bg-green-500/20">{skill}</Badge>
              ))}
              {(!report.verifiedSkills || report.verifiedSkills.length === 0) && (
                <span className="text-sm text-muted-foreground italic">No skills conclusively verified.</span>
              )}
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-sm border-border">
          <CardHeader>
            <CardTitle className="text-yellow-500 flex items-center gap-2"><HelpCircle className="w-5 h-5" /> Unverified Claims</CardTitle>
            <CardDescription>Claims made on resume but not evaluated or demonstrated.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {report.unverifiedClaims?.map((claim: string, i: number) => (
                <Badge key={i} variant="outline" className="px-3 py-1 border-yellow-500/30 text-yellow-600">{claim}</Badge>
              ))}
              {(!report.unverifiedClaims || report.unverifiedClaims.length === 0) && (
                <span className="text-sm text-muted-foreground italic">All critical claims verified.</span>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Interview & Next Steps */}
      <Card className="shadow-sm border-border">
        <CardHeader>
          <CardTitle>Recommended Human Interview Questions</CardTitle>
          <CardDescription>Targeted questions to probe remaining gaps during a live interview.</CardDescription>
        </CardHeader>
        <CardContent>
          <ul className="space-y-3">
            {report.recommendedVerificationQuestions?.map((q: string, i: number) => (
              <li key={i} className="flex gap-3 items-start bg-card p-3 rounded-md border border-border">
                <span className="flex-shrink-0 w-6 h-6 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xs font-bold">{i+1}</span>
                <span className="text-sm pt-0.5">{q}</span>
              </li>
            ))}
            {(!report.recommendedVerificationQuestions || report.recommendedVerificationQuestions.length === 0) && (
              <li className="text-sm text-muted-foreground italic">No specific questions recommended.</li>
            )}
          </ul>
        </CardContent>
      </Card>
      
    </div>
  );
};

export default HiringReport;
