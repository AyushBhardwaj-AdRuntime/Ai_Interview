import { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { BACKEND_URL } from "@/lib/config";
import { Upload, ChevronRight, FileText, CheckCircle2, AlertTriangle, AlertCircle, Sparkles, PlusCircle } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { useAtsAnalysis } from "@/hooks/useAts";

// ─── Types ────────────────────────────────────────────────────────────────────
type Step = "form" | "loading" | "score" | "questions" | "analyzing" | "paywall";

type RedFlag = {
  skill: string;
  reason: string;
  potentialScoreGain: string;
};

type FreeResult = {
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
  const { mutateAsync: analyzeResume, isPending } = useAtsAnalysis();

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
    <div style={{ background: "#09090f", minHeight: "100vh", color: "white", fontFamily: "'Inter',system-ui,sans-serif" }}>

      <div style={{ maxWidth: 720, margin: "0 auto", padding: "56px 24px 80px" }}>

        {/* ── STEP: FORM ── */}
        {step === "form" && (
          <>
            <div style={{ textAlign: "center", marginBottom: 40 }}>
              <h1 style={{ fontSize: "clamp(28px,4.5vw,48px)", fontWeight: 900, letterSpacing: "-0.035em", lineHeight: 1.1, marginBottom: 12 }}>
                Upload your resume.<br />
                <span style={{ background: "linear-gradient(135deg,#6366f1,#a78bfa,#ec4899)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
                  Add the job. See the truth.
                </span>
              </h1>
              <p style={{ fontSize: 15, color: "rgba(255,255,255,0.4)", lineHeight: 1.7 }}>
                See your match. Find your weaknesses. Practice the interview.
              </p>
            </div>

            <div style={card}>
              {/* Upload */}
              <label style={labelStyle}>1 — Your Resume</label>
              <div
                onClick={() => fileRef.current?.click()}
                onDragOver={e => { e.preventDefault(); setDragOver(true); }}
                onDragLeave={() => setDragOver(false)}
                onDrop={onDrop}
                style={{
                  border: `2px dashed ${fileName ? "rgba(16,185,129,0.45)" : dragOver ? "rgba(99,102,241,0.5)" : "rgba(255,255,255,0.1)"}`,
                  borderRadius: 12, padding: "28px 20px", textAlign: "center",
                  cursor: "pointer", transition: "all 0.2s", marginBottom: 24,
                  background: fileName ? "rgba(16,185,129,0.04)" : "rgba(255,255,255,0.02)",
                }}
              >
                <input ref={fileRef} type="file" accept=".pdf,.doc,.docx" style={{ display: "none" }} onChange={e => { const f = e.target.files?.[0]; if (f) handleFile(f); }} />
                {fileName ? (
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 10 }}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>
                    <span style={{ fontSize: 14, color: "#10b981", fontWeight: 600 }}>{fileName}</span>
                    <button onClick={e => { e.stopPropagation(); reset(); }} style={{ background: "none", border: "none", cursor: "pointer", color: "rgba(255,255,255,0.3)", fontSize: 15 }}>✕</button>
                  </div>
                ) : (
                  <>
                    <div style={{ fontSize: 26, marginBottom: 8 }}>📄</div>
                    <p style={{ fontSize: 13, color: "rgba(255,255,255,0.4)" }}>
                      Drag & drop or <span style={{ color: "#818cf8", textDecoration: "underline" }}>browse</span>
                    </p>
                    <p style={{ fontSize: 11, color: "rgba(255,255,255,0.2)", marginTop: 4 }}>PDF · DOC · DOCX</p>
                  </>
                )}
              </div>

              {/* JD */}
              <label style={labelStyle}>2 — Job Description</label>
              <textarea
                value={jdText}
                onChange={e => setJdText(e.target.value)}
                placeholder="Paste the full job posting here..."
                rows={6}
                style={{
                  width: "100%", boxSizing: "border-box", resize: "vertical",
                  background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.09)",
                  borderRadius: 10, padding: "12px 14px", fontSize: 14, lineHeight: 1.65,
                  color: "rgba(255,255,255,0.75)", outline: "none", fontFamily: "inherit",
                  marginBottom: 24, transition: "border-color 0.2s",
                }}
                onFocus={e => (e.currentTarget.style.borderColor = "rgba(99,102,241,0.4)")}
                onBlur={e => (e.currentTarget.style.borderColor = "rgba(255,255,255,0.09)")}
              />

              {error && <div style={errorBox}>{error}</div>}

              <button onClick={handleAnalyze} style={primaryBtn} className="hover:scale-105 active:scale-95 transition-all">
                Analyze My Resume →
              </button>

              <p style={{ textAlign: "center", fontSize: 11, color: "rgba(255,255,255,0.18)", marginTop: 12 }}>
                Free · No account needed · Results in ~15 seconds
              </p>
            </div>
          </>
        )}

        {/* ── STEP: LOADING ── */}
        {step === "loading" && (
          <div style={{ animation: "fadeUp 0.4s ease both", textAlign: "center" }}>
            <h2 style={{ fontSize: 24, fontWeight: 700, marginBottom: 32, display: "flex", alignItems: "center", justifyContent: "center", gap: 12 }}>
              <span style={spinner} /> Analyzing Resume Match...
            </h2>
            <div style={{ ...card, position: "relative", overflow: "hidden", marginBottom: 20 }}>
              <Skeleton className="h-32 w-32 rounded-full mx-auto mb-6 bg-muted/20" />
              <Skeleton className="h-6 w-48 rounded-md mx-auto bg-muted/20" />
            </div>
            <div style={{ ...card, marginBottom: 20 }}>
              <Skeleton className="h-6 w-32 rounded-md mb-4 bg-muted/20" />
              <div className="space-y-3">
                <Skeleton className="h-4 w-full rounded-md bg-muted/20" />
                <Skeleton className="h-4 w-5/6 rounded-md bg-muted/20" />
                <Skeleton className="h-4 w-4/6 rounded-md bg-muted/20" />
              </div>
            </div>
          </div>
        )}

        {/* ── STEP: SCORE & FULL REPORT ── */}
        {step === "score" && result && (
          <div style={{ animation: "fadeUp 0.4s ease both" }}>
            <div style={{ textAlign: "center", marginBottom: 10 }}>
              <p style={{ fontSize: 13, color: "rgba(255,255,255,0.35)", fontWeight: 600, marginBottom: 4 }}>
                {result.candidateName && `Results for ${result.candidateName} ·`} ATS Match Score
              </p>
            </div>

            {/* Score ring card */}
            <div style={{
              ...card, textAlign: "center", marginBottom: 20,
              position: "relative", overflow: "hidden",
            }}>
              <div style={{
                position: "absolute", top: -50, left: "50%", transform: "translateX(-50%)",
                width: 260, height: 160,
                background: `radial-gradient(ellipse,${color}22 0%,transparent 70%)`,
                pointerEvents: "none",
              }} />
              <div style={{ position: "relative", display: "inline-block", marginBottom: 14 }}>
                <ScoreRing value={result.score} color={color} />
                <span style={{
                  position: "absolute", top: "50%", left: "50%",
                  transform: "translate(-50%,-50%)",
                  fontSize: 32, fontWeight: 900, color: "white", fontFamily: "monospace",
                }}>{result.score}</span>
              </div>
              <div style={{
                display: "inline-block", fontSize: 12, fontWeight: 700,
                color: color, background: `${color}18`, border: `1px solid ${color}44`,
                borderRadius: 999, padding: "4px 14px", marginBottom: 6,
              }}>
                {result.matchStatus} Match
              </div>
              <p style={{ fontSize: 13, color: "rgba(255,255,255,0.35)" }}>
                {result.score >= 75 ? "Strong match — you're likely to pass ATS screening."
                  : result.score >= 50 ? "Moderate match — some key gaps are holding you back."
                  : "Weak match — your resume will likely be filtered out automatically."}
              </p>
            </div>

            {/* Feedback & Keywords */}
            <div style={{ ...card, marginBottom: 20 }}>
              <h3 style={{ fontSize: 16, fontWeight: 600, marginBottom: 12 }}>Overall Feedback</h3>
              <p style={{ fontSize: 14, color: "rgba(255,255,255,0.7)", lineHeight: 1.6, marginBottom: 20 }}>{result.feedback}</p>
              
              <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                {result.missingKeywords && result.missingKeywords.length > 0 && (
                  <div>
                    <h4 style={{ fontSize: 13, fontWeight: 600, color: "#f87171", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 8 }}>Missing Keywords</h4>
                    <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                      {result.missingKeywords.map((kw: string, i: number) => (
                        <span key={i} style={{ fontSize: 12, background: "rgba(239,68,68,0.1)", color: "#fca5a5", padding: "4px 10px", borderRadius: 6, border: "1px solid rgba(239,68,68,0.2)" }}>{kw}</span>
                      ))}
                    </div>
                  </div>
                )}
                
                {result.matchingKeywords && result.matchingKeywords.length > 0 && (
                  <div>
                    <h4 style={{ fontSize: 13, fontWeight: 600, color: "#34d399", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 8 }}>Matching Keywords</h4>
                    <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                      {result.matchingKeywords.map((kw: string, i: number) => (
                        <span key={i} style={{ fontSize: 12, background: "rgba(16,185,129,0.1)", color: "#6ee7b7", padding: "4px 10px", borderRadius: 6, border: "1px solid rgba(16,185,129,0.2)" }}>{kw}</span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Critical red flag */}
            {result.criticalRedFlag && (
              <div style={{
                ...card, marginBottom: 20,
                borderColor: "rgba(239,68,68,0.2)", background: "rgba(239,68,68,0.04)",
              }}>
                <div style={{ display: "flex", alignItems: "flex-start", gap: 14 }}>
                  <span style={{ fontSize: 22, flexShrink: 0 }}>🔴</span>
                  <div>
                    <p style={{ fontSize: 11, fontWeight: 700, color: "#f87171", letterSpacing: "0.07em", textTransform: "uppercase", marginBottom: 6 }}>
                      Critical Gap
                    </p>
                    <p style={{ fontSize: 15, fontWeight: 700, color: "white", marginBottom: 6 }}>
                      {result.criticalRedFlag.skill}
                    </p>
                    <p style={{ fontSize: 13, color: "rgba(255,255,255,0.5)", lineHeight: 1.65, marginBottom: 10 }}>
                      {result.criticalRedFlag.reason}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Practice Handoff CTA */}
            <div style={{ textAlign: "center", marginTop: 32 }}>
              <button onClick={handlePracticeJob} style={{
                ...primaryBtn,
                background: "linear-gradient(135deg, #6366f1, #a78bfa)",
                boxShadow: "0 4px 20px rgba(99,102,241,0.25)"
              }} className="hover:scale-105 active:scale-95 transition-all">
                Practice this Job in AI Interview →
              </button>
              <button onClick={reset} style={{
                ...secondaryBtn,
                marginTop: 12,
                display: "block",
                width: "100%"
              }} className="hover:scale-105 active:scale-95 transition-all">
                Analyze another resume
              </button>
            </div>
          </div>
        )}

      </div>

      <style>{`
        @keyframes fadeUp { from { opacity:0; transform:translateY(18px); } to { opacity:1; transform:translateY(0); } }
        @keyframes spin   { to { transform:rotate(360deg); } }
      `}</style>
    </div>
  );
}

// ─── Shared styles ─────────────────────────────────────────────────────────────
const card: React.CSSProperties = {
  background: "rgba(255,255,255,0.03)",
  border: "1px solid rgba(255,255,255,0.08)",
  borderRadius: 16, padding: "24px",
};

const labelStyle: React.CSSProperties = {
  display: "block", fontSize: 11, fontWeight: 700, letterSpacing: "0.07em",
  textTransform: "uppercase", color: "rgba(255,255,255,0.35)", marginBottom: 10,
};

const primaryBtn: React.CSSProperties = {
  width: "100%", background: "linear-gradient(135deg,#6366f1,#8b5cf6)",
  border: "none", borderRadius: 12, padding: "14px 0",
  fontSize: 15, fontWeight: 700, color: "white", cursor: "pointer",
  fontFamily: "inherit", boxShadow: "0 0 28px rgba(99,102,241,0.3)",
  transition: "all 0.2s",
};

const secondaryBtn: React.CSSProperties = {
  background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)",
  borderRadius: 12, padding: "13px 0", fontSize: 14, fontWeight: 700,
  color: "rgba(255,255,255,0.6)", cursor: "pointer", fontFamily: "inherit",
};

const errorBox: React.CSSProperties = {
  background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.25)",
  borderRadius: 10, padding: "12px 16px", marginBottom: 16,
  fontSize: 13, color: "#f87171",
};

const spinner: React.CSSProperties = {
  width: 15, height: 15, borderRadius: "50%",
  border: "2px solid rgba(255,255,255,0.2)", borderTopColor: "white",
  animation: "spin 0.7s linear infinite", display: "inline-block",
};
