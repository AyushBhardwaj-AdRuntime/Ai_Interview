import { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Upload, ChevronRight, FileText, CheckCircle2, AlertTriangle, AlertCircle, Sparkles, PlusCircle, Loader2 } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { useAtsAnalysis } from "@/hooks/useAts";

// ─── Types ────────────────────────────────────────────────────────────────────
type Step = "form" | "loading" | "score" | "questions" | "analyzing" | "paywall";

type RedFlag = {
  skill: string;
  reason: string;
  potentialScoreGain: string;
};

type AtsAnalysisResult = {
  score: number;
  matchStatus: "High" | "Medium" | "Low";
  criticalRedFlag: RedFlag | null;
  teaserQuestions: string[];
  candidateName: string;
  resultId: string;
};

// ─── Score ring ───────────────────────────────────────────────────────────────
function ScoreRing({ value, color }: { value: number; color: string }) {
  const r = 52;
  const circ = 2 * Math.PI * r;
  const offset = circ - (value / 100) * circ;
  return (
    <svg width="130" height="130" style={{ transform: "rotate(-90deg)" }}>
      <circle cx="65" cy="65" r={r} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="9" />
      <circle
        cx="65" cy="65" r={r} fill="none" stroke={color}
        strokeWidth="9" strokeLinecap="round"
        strokeDasharray={circ} strokeDashoffset={offset}
        style={{ transition: "stroke-dashoffset 1.2s cubic-bezier(.4,0,.2,1)" }}
      />
    </svg>
  );
}

function scoreColor(v: number) {
  return v >= 75 ? "#10b981" : v >= 50 ? "#f59e0b" : "#ef4444";
}

// ─── Main page ────────────────────────────────────────────────────────────────
export default function AtsChecker() {
  const navigate = useNavigate();
  const fileRef = useRef<HTMLInputElement>(null);

  const [step, setStep] = useState<Step>("form");
  const [fileName, setFileName] = useState("");
  const [resumeFile, setResumeFile] = useState<File | null>(null);
  const [jdText, setJdText] = useState("");
  const [dragOver, setDragOver] = useState(false);
  const [error, setError] = useState("");

  // result state
  const [result, setResult] = useState<any>(null);

  // ── File handling ──────────────────────────────────────────────────────────
  const handleFile = (file: File) => {
    setFileName(file.name);
    setResumeFile(file);
    setError("");
  };
  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const f = e.dataTransfer.files?.[0];
    if (f) handleFile(f);
  };

  // ── Step 1: submit form → API call ─────────────────────────────────────────
  const { mutateAsync: analyzeResume } = useAtsAnalysis();

  const handleAnalyze = async () => {
    if (!resumeFile) { setError("Please upload your resume."); return; }
    if (!jdText.trim()) { setError("Please paste the job description."); return; }

    setStep("loading");
    setError("");

    try {
      const form = new FormData();
      form.append("resume", resumeFile);
      form.append("jdText", jdText);

      const data = await analyzeResume(form);

      setResult(data);
      setStep("score");
    } catch (err: any) {
      setError(err?.response?.data?.message || "Something went wrong. Please try again.");
      setStep("form");
    }
  };

  const handlePracticeJob = () => {
    navigate("/setup", {
      state: {
        jdText,
        // The backend uses the logged-in user's latest resume, so we don't strictly need resumeId,
        // but we can pass it if we add it to the AtsResult response later.
      }
    });
  };

  const reset = () => {
    setStep("form");
    setFileName("");
    setResumeFile(null);
    setJdText("");
    setError("");
    setResult(null);
    if (fileRef.current) fileRef.current.value = "";
  };

  const color = result ? scoreColor(result.score) : "#6366f1";

  // ─────────────────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-background text-foreground pt-28 pb-20 px-6">
      <div className="max-w-3xl mx-auto">

        {/* ── STEP: FORM ── */}
        {step === "form" && (
          <>
            <div className="text-center mb-10">
              <h1 className="text-3xl md:text-5xl font-black tracking-tight mb-3">
                Upload your resume.<br />
                <span className="bg-gradient-to-r from-primary to-blue-500 bg-clip-text text-transparent">
                  Add the job. See the truth.
                </span>
              </h1>
              <p className="text-muted-foreground text-base">
                See your match. Find your weaknesses. Practice the interview.
              </p>
            </div>

            <div className="bg-card border border-border rounded-2xl p-6 shadow-sm">
              {/* Upload */}
              <label className="block text-xs font-bold tracking-wider uppercase text-muted-foreground mb-3">1 — Your Resume</label>
              <div
                onClick={() => fileRef.current?.click()}
                onDragOver={e => { e.preventDefault(); setDragOver(true); }}
                onDragLeave={() => setDragOver(false)}
                onDrop={onDrop}
                className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all mb-6 ${
                  fileName ? "border-green-500/50 bg-green-500/5" : dragOver ? "border-primary/50 bg-primary/5" : "border-border hover:border-primary/50 hover:bg-muted/50"
                }`}
              >
                <input ref={fileRef} type="file" accept=".pdf,.doc,.docx" className="hidden" onChange={e => { const f = e.target.files?.[0]; if (f) handleFile(f); }} />
                {fileName ? (
                  <div className="flex items-center justify-center gap-2">
                    <CheckCircle2 className="w-5 h-5 text-green-500" />
                    <span className="text-sm font-semibold text-green-600 dark:text-green-500">{fileName}</span>
                    <button onClick={e => { e.stopPropagation(); reset(); }} className="ml-2 text-muted-foreground hover:text-foreground">✕</button>
                  </div>
                ) : (
                  <>
                    <FileText className="w-8 h-8 mx-auto mb-2 text-muted-foreground" />
                    <p className="text-sm text-muted-foreground">
                      Drag & drop or <span className="text-primary underline">browse</span>
                    </p>
                    <p className="text-xs text-muted-foreground/60 mt-1">PDF · DOC · DOCX</p>
                  </>
                )}
              </div>

              {/* JD */}
              <label className="block text-xs font-bold tracking-wider uppercase text-muted-foreground mb-3">2 — Job Description</label>
              <textarea
                value={jdText}
                onChange={e => setJdText(e.target.value)}
                placeholder="Paste the full job posting here..."
                rows={6}
                className="w-full bg-background border border-input rounded-xl p-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary mb-6 transition-colors"
              />

              {error && <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-3 mb-4 text-sm text-destructive flex items-center gap-2"><AlertCircle className="w-4 h-4" />{error}</div>}

              <button onClick={handleAnalyze} className="w-full bg-primary text-primary-foreground font-bold text-sm py-3.5 rounded-xl hover:opacity-90 active:scale-[0.98] transition-all shadow-md">
                Analyze My Resume →
              </button>

              <p className="text-center text-xs text-muted-foreground mt-4">
                Free · No account needed · Results in ~15 seconds
              </p>
            </div>
          </>
        )}

        {/* ── STEP: LOADING ── */}
        {step === "loading" && (
          <div className="text-center animate-in fade-in slide-in-from-bottom-4 duration-500">
            <h2 className="text-2xl font-bold mb-8 flex items-center justify-center gap-3">
              <Loader2 className="w-6 h-6 animate-spin text-primary" /> Analyzing Resume Match...
            </h2>
            <div className="bg-card border border-border rounded-2xl p-6 mb-6">
              <Skeleton className="h-32 w-32 rounded-full mx-auto mb-6" />
              <Skeleton className="h-6 w-48 rounded-md mx-auto" />
            </div>
            <div className="bg-card border border-border rounded-2xl p-6">
              <Skeleton className="h-6 w-32 rounded-md mb-4" />
              <div className="space-y-3">
                <Skeleton className="h-4 w-full rounded-md" />
                <Skeleton className="h-4 w-5/6 rounded-md" />
                <Skeleton className="h-4 w-4/6 rounded-md" />
              </div>
            </div>
          </div>
        )}

        {/* ── STEP: SCORE & FULL REPORT ── */}
        {step === "score" && result && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="text-center mb-4">
              <p className="text-sm font-semibold text-muted-foreground">
                {result.candidateName && `Results for ${result.candidateName} · `} ATS Match Score
              </p>
            </div>

            {/* Score ring card */}
            <div className="bg-card border border-border rounded-2xl p-8 text-center mb-6 relative overflow-hidden shadow-sm">
              <div 
                className="absolute top-[-50px] left-1/2 -translate-x-1/2 w-64 h-40 pointer-events-none opacity-20"
                style={{ background: `radial-gradient(ellipse,${color} 0%,transparent 70%)` }}
              />
              
              <div className="relative inline-block mb-4">
                <ScoreRing value={result.score} color={color} />
                <span className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-4xl font-black font-mono">
                  {result.score}
                </span>
              </div>
              
              <div className="mb-2">
                <span 
                  className="inline-block text-xs font-bold px-4 py-1 rounded-full border"
                  style={{ color: color, backgroundColor: `${color}18`, borderColor: `${color}44` }}
                >
                  {result.matchStatus} Match
                </span>
              </div>
              
              <p className="text-sm text-muted-foreground">
                {result.score >= 75 ? "Strong match — you're likely to pass ATS screening."
                  : result.score >= 50 ? "Moderate match — some key gaps are holding you back."
                  : "Weak match — your resume will likely be filtered out automatically."}
              </p>
            </div>

            {/* Feedback & Keywords */}
            <div className="bg-card border border-border rounded-2xl p-6 mb-6 shadow-sm">
              <h3 className="text-lg font-bold mb-3">Overall Feedback</h3>
              <p className="text-sm text-muted-foreground leading-relaxed mb-6">{result.feedback}</p>
              
              <div className="flex flex-col gap-5">
                {result.missingKeywords && result.missingKeywords.length > 0 && (
                  <div>
                    <h4 className="text-xs font-bold text-destructive uppercase tracking-wider mb-2">Missing Keywords</h4>
                    <div className="flex flex-wrap gap-2">
                      {result.missingKeywords.map((kw: string, i: number) => (
                        <span key={i} className="text-xs font-medium bg-destructive/10 text-destructive border border-destructive/20 px-2.5 py-1 rounded-md">{kw}</span>
                      ))}
                    </div>
                  </div>
                )}
                
                {result.matchingKeywords && result.matchingKeywords.length > 0 && (
                  <div>
                    <h4 className="text-xs font-bold text-green-600 dark:text-green-500 uppercase tracking-wider mb-2">Matching Keywords</h4>
                    <div className="flex flex-wrap gap-2">
                      {result.matchingKeywords.map((kw: string, i: number) => (
                        <span key={i} className="text-xs font-medium bg-green-500/10 text-green-600 dark:text-green-400 border border-green-500/20 px-2.5 py-1 rounded-md">{kw}</span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Critical red flag */}
            {result.criticalRedFlag && (
              <div className="bg-destructive/5 border border-destructive/20 rounded-2xl p-6 mb-6">
                <div className="flex items-start gap-4">
                  <AlertTriangle className="w-6 h-6 text-destructive shrink-0 mt-0.5" />
                  <div>
                    <p className="text-xs font-bold text-destructive uppercase tracking-wider mb-1">
                      Critical Gap
                    </p>
                    <p className="text-base font-bold mb-1">
                      {result.criticalRedFlag.skill}
                    </p>
                    <p className="text-sm text-muted-foreground leading-relaxed mb-2">
                      {result.criticalRedFlag.reason}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Practice Handoff CTA */}
            <div className="text-center mt-10">
              <button 
                onClick={handlePracticeJob} 
                className="w-full bg-primary text-primary-foreground font-bold text-sm py-3.5 rounded-xl hover:opacity-90 active:scale-[0.98] transition-all shadow-md mb-3"
              >
                Practice this Job in AI Interview →
              </button>
              <button 
                onClick={reset} 
                className="w-full bg-transparent border border-border text-muted-foreground font-bold text-sm py-3.5 rounded-xl hover:bg-muted/50 active:scale-[0.98] transition-all"
              >
                Analyze another resume
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
