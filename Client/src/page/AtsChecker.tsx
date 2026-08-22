import { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { BACKEND_URL } from "@/lib/config";

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
  const [result, setResult] = useState<FreeResult | null>(null);
  const [answers, setAnswers] = useState(["", ""]);
  const [weakness, setWeakness] = useState("");

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
  const handleAnalyze = async () => {
    if (!resumeFile) { setError("Please upload your resume."); return; }
    if (!jdText.trim()) { setError("Please paste the job description."); return; }

    setStep("loading");
    setError("");

    try {
      const form = new FormData();
      form.append("resume", resumeFile);
      form.append("jdText", jdText);

      const res = await axios.post(`${BACKEND_URL}/api/v1/ats/analyze`, form, {
        withCredentials: true,
        headers: { "Content-Type": "multipart/form-data" },
      });

      setResult(res.data);
      setStep("score");
    } catch (err: any) {
      setError(err?.response?.data?.message || "Something went wrong. Please try again.");
      setStep("form");
    }
  };

  // ── Step 2: user clicks continue from score ────────────────────────────────
  const handleSeeQuestions = () => setStep("questions");

  // ── Step 3: user submits answers ──────────────────────────────────────────
  const handleSubmitAnswers = () => {
    if (!answers[0].trim() || !answers[1].trim()) {
      setError("Please answer both questions before continuing.");
      return;
    }
    setError("");
    setStep("analyzing");

    // Simulate analysis (1.8s) then show weakness + paywall
    setTimeout(() => {
      const flag = result?.criticalRedFlag;
      setWeakness(
        flag?.skill
          ? `Your answers show a gap in ${flag.skill}. ${flag.reason}`
          : "Your answers reveal areas that interviewers will push on in a real screening."
      );
      setStep("paywall");
    }, 1800);
  };

  const reset = () => {
    setStep("form");
    setFileName("");
    setResumeFile(null);
    setJdText("");
    setError("");
    setResult(null);
    setAnswers(["", ""]);
    if (fileRef.current) fileRef.current.value = "";
  };

  const color = result ? scoreColor(result.score) : "#6366f1";

  // ─────────────────────────────────────────────────────────────────────────
  return (
    <div style={{ background: "#09090f", minHeight: "100vh", color: "white", fontFamily: "'Inter',system-ui,sans-serif" }}>

      {/* NAV */}
      <nav style={{
        position: "sticky", top: 0, zIndex: 50,
        background: "rgba(9,9,15,0.85)", backdropFilter: "blur(20px)",
        borderBottom: "1px solid rgba(255,255,255,0.06)",
      }}>
        <div style={{
          maxWidth: 860, margin: "0 auto", padding: "0 24px",
          height: 60, display: "flex", alignItems: "center", justifyContent: "space-between",
        }}>
          <span onClick={() => navigate("/")} style={{ fontSize: 18, fontWeight: 800, letterSpacing: "-0.03em", cursor: "pointer" }}>
            mock<span style={{ background: "linear-gradient(135deg,#6366f1,#a78bfa)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>hire</span>
            <span style={{ color: "rgba(255,255,255,0.25)", fontSize: 13 }}>.me</span>
          </span>

          {/* Step indicator */}
          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            {(["form", "score", "questions", "paywall"] as const).map((s, i) => (
              <div key={s} style={{
                width: 8, height: 8, borderRadius: "50%",
                background: ["form", "loading"].includes(step) && i === 0 ? "#6366f1"
                  : step === "score" && i === 1 ? "#6366f1"
                  : ["questions", "analyzing"].includes(step) && i === 2 ? "#6366f1"
                  : step === "paywall" && i === 3 ? "#6366f1"
                  : "rgba(255,255,255,0.12)",
                transition: "background 0.3s",
              }} />
            ))}
          </div>

          <span style={{
            fontSize: 11, fontWeight: 700, color: "#10b981",
            background: "rgba(16,185,129,0.1)", border: "1px solid rgba(16,185,129,0.25)",
            borderRadius: 999, padding: "4px 12px",
          }}>FREE</span>
        </div>
      </nav>

      <div style={{ maxWidth: 720, margin: "0 auto", padding: "56px 24px 80px" }}>

        {/* ── STEP: FORM ── */}
        {(step === "form" || step === "loading") && (
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

              <button onClick={handleAnalyze} disabled={step === "loading"} style={primaryBtn}>
                {step === "loading" ? (
                  <span style={{ display: "inline-flex", alignItems: "center", gap: 10 }}>
                    <span style={spinner} />
                    Analyzing with AI...
                  </span>
                ) : "Analyze My Resume →"}
              </button>

              <p style={{ textAlign: "center", fontSize: 11, color: "rgba(255,255,255,0.18)", marginTop: 12 }}>
                Free · No account needed · Results in ~15 seconds
              </p>
            </div>
          </>
        )}

        {/* ── STEP: SCORE ── */}
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
                    <div style={{
                      display: "inline-flex", alignItems: "center", gap: 6,
                      background: "rgba(99,102,241,0.12)", border: "1px solid rgba(99,102,241,0.25)",
                      borderRadius: 999, padding: "4px 12px",
                    }}>
                      <span style={{ fontSize: 12, color: "#818cf8", fontWeight: 700 }}>
                        Potential improvement: {result.criticalRedFlag.potentialScoreGain}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            <button onClick={handleSeeQuestions} style={primaryBtn}>
              See Your Personalized Interview Questions →
            </button>
            <p style={{ textAlign: "center", fontSize: 12, color: "rgba(255,255,255,0.2)", marginTop: 10 }}>
              2 questions · based on your resume gaps · free
            </p>
          </div>
        )}

        {/* ── STEP: QUESTIONS ── */}
        {(step === "questions" || step === "analyzing") && result && (
          <div style={{ animation: "fadeUp 0.4s ease both" }}>
            <div style={{ textAlign: "center", marginBottom: 32 }}>
              <h2 style={{ fontSize: 24, fontWeight: 800, letterSpacing: "-0.025em", marginBottom: 8 }}>
                Answer these 2 questions
              </h2>
              <p style={{ fontSize: 14, color: "rgba(255,255,255,0.35)" }}>
                Based on your resume gaps — these are the questions that will expose you in a real interview.
              </p>
            </div>

            {result.teaserQuestions.map((q, i) => (
              <div key={i} style={{ ...card, marginBottom: 16 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
                  <span style={{
                    fontSize: 11, fontWeight: 800, color: "#818cf8", fontFamily: "monospace",
                    background: "rgba(99,102,241,0.12)", border: "1px solid rgba(99,102,241,0.22)",
                    borderRadius: 6, padding: "2px 8px", flexShrink: 0,
                  }}>Q{i + 1}</span>
                  <p style={{ fontSize: 15, fontWeight: 700, color: "rgba(255,255,255,0.9)", lineHeight: 1.5 }}>{q}</p>
                </div>
                <textarea
                  value={answers[i]}
                  onChange={e => {
                    const a = [...answers];
                    a[i] = e.target.value;
                    setAnswers(a);
                  }}
                  disabled={step === "analyzing"}
                  placeholder="Type your answer here..."
                  rows={4}
                  style={{
                    width: "100%", boxSizing: "border-box", resize: "vertical",
                    background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.09)",
                    borderRadius: 10, padding: "12px 14px", fontSize: 14, lineHeight: 1.65,
                    color: "rgba(255,255,255,0.75)", outline: "none", fontFamily: "inherit",
                    opacity: step === "analyzing" ? 0.5 : 1, transition: "border-color 0.2s",
                  }}
                  onFocus={e => (e.currentTarget.style.borderColor = "rgba(99,102,241,0.4)")}
                  onBlur={e => (e.currentTarget.style.borderColor = "rgba(255,255,255,0.09)")}
                />
              </div>
            ))}

            {error && <div style={errorBox}>{error}</div>}

            <button onClick={handleSubmitAnswers} disabled={step === "analyzing"} style={primaryBtn}>
              {step === "analyzing" ? (
                <span style={{ display: "inline-flex", alignItems: "center", gap: 10 }}>
                  <span style={spinner} />
                  AI is analyzing your answers...
                </span>
              ) : "Submit Answers →"}
            </button>
          </div>
        )}

        {/* ── STEP: PAYWALL ── */}
        {step === "paywall" && result && (
          <div style={{ animation: "fadeUp 0.4s ease both" }}>

            {/* Weakness revealed */}
            <div style={{
              ...card, marginBottom: 20, textAlign: "center",
              borderColor: "rgba(251,191,36,0.25)", background: "rgba(251,191,36,0.04)",
            }}>
              <div style={{ fontSize: 32, marginBottom: 12 }}>⚠️</div>
              <p style={{ fontSize: 12, fontWeight: 700, color: "#fbbf24", letterSpacing: "0.07em", textTransform: "uppercase", marginBottom: 10 }}>
                Weakness Detected
              </p>
              <p style={{ fontSize: 16, fontWeight: 700, color: "white", marginBottom: 8, lineHeight: 1.5 }}>
                Your answer was analyzed.
              </p>
              <p style={{ fontSize: 14, color: "rgba(255,255,255,0.5)", lineHeight: 1.7, maxWidth: 440, margin: "0 auto" }}>
                {weakness}
              </p>
            </div>

            {/* What's locked */}
            <div style={{ ...card, marginBottom: 20 }}>
              <p style={{ fontSize: 12, fontWeight: 700, color: "rgba(255,255,255,0.3)", letterSpacing: "0.07em", textTransform: "uppercase", marginBottom: 16 }}>
                Locked — Unlock for ₹49
              </p>
              {[
                { icon: "📊", text: "Full keyword analysis — every missing skill with fix instructions" },
                { icon: "💡", text: "Line-by-line resume improvement suggestions" },
                { icon: "🎯", text: "Interview risk areas — what interviewers will push on" },
                { icon: "🎙️", text: "Full 6-question AI voice interview with real-time feedback" },
                { icon: "📈", text: "Interview readiness score + estimated pass-readiness" },
                { icon: "🗺️", text: "Personalized improvement plan" },
              ].map((item, i) => (
                <div key={i} style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 12 }}>
                  <span style={{ fontSize: 16 }}>{item.icon}</span>
                  <span style={{ fontSize: 14, color: "rgba(255,255,255,0.5)" }}>{item.text}</span>
                  <span style={{ marginLeft: "auto", fontSize: 16 }}>🔒</span>
                </div>
              ))}
            </div>

            {/* CTA */}
            <div style={{ textAlign: "center" }}>
              <button style={{
                ...primaryBtn,
                fontSize: 16, padding: "16px 0",
                background: "linear-gradient(135deg,#f59e0b,#ef4444)",
                boxShadow: "0 0 32px rgba(245,158,11,0.3)",
              }}>
                Unlock Full Report — ₹49 →
              </button>
              <p style={{ fontSize: 11, color: "rgba(255,255,255,0.2)", marginTop: 10 }}>
                Payment coming soon · Join waitlist to be notified
              </p>

              <div style={{ display: "flex", gap: 12, marginTop: 20 }}>
                <button onClick={reset} style={{ ...secondaryBtn, flex: 1 }}>← Try Another Resume</button>
                <button onClick={() => navigate("/")} style={{ ...secondaryBtn, flex: 1 }}>Practice AI Interview</button>
              </div>
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
