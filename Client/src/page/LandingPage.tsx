55import { useState } from "react"
import { useNavigate } from "react-router-dom"
import PaywallModal from "@/components/PaywallModal"

// ─────────────────────────────────────────────────────────────────────────────
// Constants
// ─────────────────────────────────────────────────────────────────────────────
const WAVE_HEIGHTS = [8, 20, 28, 14, 24, 10, 30, 16, 22, 12, 26, 8, 20, 18, 24, 10]

const STEPS = [
  {
    num: "01",
    title: "Upload Your Profile",
    desc: "Drop your resume PDF or paste your LinkedIn URL. MockHire extracts your full professional story in seconds.",
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
        <polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/>
        <line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/>
      </svg>
    ),
  },
  {
    num: "02",
    title: "AI Conducts The Interview",
    desc: "A real-time voice AI interviews you on your background, skills, and projects — just like a real HR round.",
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z"/>
        <path d="M19 10v2a7 7 0 0 1-14 0v-2"/>
        <line x1="12" y1="19" x2="12" y2="22"/>
      </svg>
    ),
  },
  {
    num: "03",
    title: "Get Your Full Report",
    desc: "Receive a detailed breakdown of your scores, communication style, and exact areas to improve — instantly.",
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/>
        <line x1="6" y1="20" x2="6" y2="14"/>
      </svg>
    ),
  },
]

const TESTIMONIALS = [
  {
    quote: "MockHire felt like interviewing with an actual recruiter. I went into my real interviews 10× more confident.",
    name: "Priya S.",
    role: "SDE Intern — Google",
    avatar: "PS",
    color: "#6366f1",
  },
  {
    quote: "The ATS score showed me exactly why I was getting ghosted. Fixed my resume in 20 minutes and landed 3 callbacks.",
    name: "Daniel K.",
    role: "Backend Engineer — Startup",
    avatar: "DK",
    color: "#8b5cf6",
  },
  {
    quote: "I practiced 5 times before my final round. The AI pushed back on vague answers just like a real interviewer would.",
    name: "Aayushi R.",
    role: "Product Manager — Series B",
    avatar: "AR",
    color: "#06b6d4",
  },
]

const FREE_FEATURES = ["ATS Score Checker — unlimited", "1 AI Mock Interview", "Basic performance report"]
const PRO_FEATURES_LIST = [
  "Everything in Free",
  "Unlimited AI Mock Interviews",
  "Interview Prep Coach",
  "Confidence & communication scoring",
  "Advanced analytics dashboard",
  "Priority support",
]

// ─────────────────────────────────────────────────────────────────────────────
// Sub-components
// ─────────────────────────────────────────────────────────────────────────────



// Hero visual — simulated interview in progress


// ─────────────────────────────────────────────────────────────────────────────
// Section: Navbar
// ─────────────────────────────────────────────────────────────────────────────
function Navbar({ onGetStarted }: { onGetStarted: () => void }) {
  return (
    <nav style={{
      position: "sticky", top: 0, zIndex: 50,
      background: "rgba(9,9,15,0.88)",
      borderBottom: "1px solid rgba(255,255,255,0.06)",
      backdropFilter: "blur(20px)",
      WebkitBackdropFilter: "blur(20px)",
    }}>
      <div style={{
        maxWidth: 1160, margin: "0 auto", padding: "0 28px",
        height: 64, display: "flex", alignItems: "center", justifyContent: "space-between",
      }}>
        {/* Logo */}
        <a href="/" style={{ textDecoration: "none", display: "flex", alignItems: "center" }}>
          <span style={{ fontSize: 20, fontWeight: 800, color: "white", letterSpacing: "-0.03em" }}>
            mock
            <span style={{
              background: "linear-gradient(135deg, #6366f1, #a78bfa)",
              WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
            }}>hire</span>
            <span style={{ color: "rgba(255,255,255,0.28)", fontSize: 15, fontWeight: 600 }}>.me</span>
          </span>
        </a>

        {/* Nav links */}
        <div style={{ display: "flex", alignItems: "center", gap: 36 }}>
          {["Products", "How It Works", "Pricing"].map(label => (
            <a
              key={label}
              href={`#${label.toLowerCase().replace(/ /g, "-")}`}
              style={{
                fontSize: 14, fontWeight: 500,
                color: "rgba(255,255,255,0.5)",
                textDecoration: "none",
                transition: "color 0.2s",
              }}
              onMouseEnter={e => (e.currentTarget.style.color = "rgba(255,255,255,0.9)")}
              onMouseLeave={e => (e.currentTarget.style.color = "rgba(255,255,255,0.5)")}
            >
              {label}
            </a>
          ))}
        </div>

        {/* CTA */}
        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          <a
            href="#pricing"
            style={{ fontSize: 14, color: "rgba(255,255,255,0.45)", textDecoration: "none" }}
          >
            Pricing
          </a>
          <button
            onClick={onGetStarted}
            style={{
              background: "linear-gradient(135deg, #6366f1, #8b5cf6)",
              color: "white", border: "none", borderRadius: 9,
              padding: "9px 20px", fontSize: 14, fontWeight: 700,
              cursor: "pointer", fontFamily: "inherit",
              boxShadow: "0 0 20px rgba(99,102,241,0.3)",
              transition: "box-shadow 0.2s, transform 0.15s",
            }}
            onMouseEnter={e => {
              (e.currentTarget as HTMLButtonElement).style.boxShadow = "0 0 28px rgba(99,102,241,0.55)"
              ;(e.currentTarget as HTMLButtonElement).style.transform = "translateY(-1px)"
            }}
            onMouseLeave={e => {
              (e.currentTarget as HTMLButtonElement).style.boxShadow = "0 0 20px rgba(99,102,241,0.3)"
              ;(e.currentTarget as HTMLButtonElement).style.transform = "translateY(0)"
            }}
          >
            Get Started Free
          </button>
        </div>
      </div>
    </nav>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// Section: Hero
// ─────────────────────────────────────────────────────────────────────────────
function Hero({ onCTA }: { onCTA: () => void }) {
  return (
    <section style={{ position: "relative", overflow: "hidden", paddingTop: 110, paddingBottom: 100 }}>
      {/* Radial glow behind headline */}
      <div style={{
        position: "absolute", inset: 0, zIndex: 0, pointerEvents: "none",
        background: "radial-gradient(ellipse 90% 55% at 50% -5%, rgba(99,102,241,0.2) 0%, transparent 65%)",
      }} />
      {/* Dot grid */}
      <div className="dot-grid" style={{ position: "absolute", inset: 0, zIndex: 0, pointerEvents: "none" }} />

      <div style={{ maxWidth: 1160, margin: "0 auto", padding: "0 28px", position: "relative", zIndex: 1 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 56, justifyContent: "space-between" }}>

          {/* Left content */}
          <div style={{ flex: 1, maxWidth: 600 }}>
            {/* Pill badge */}
            <div style={{
              display: "inline-flex", alignItems: "center", gap: 8,
              background: "rgba(99,102,241,0.12)", border: "1px solid rgba(99,102,241,0.28)",
              borderRadius: 999, padding: "6px 16px", marginBottom: 30,
            }}>
              <span style={{
                fontSize: 11, color: "#818cf8", fontWeight: 700,
                letterSpacing: "0.07em", textTransform: "uppercase",
              }}>✦ AI-Powered Career Platform</span>
            </div>

            {/* Headline */}
            <h1 style={{
              fontSize: "clamp(44px, 5.8vw, 70px)",
              fontWeight: 900, lineHeight: 1.08,
              letterSpacing: "-0.035em",
              color: "white", marginBottom: 22,
              margin: "0 0 22px 0",
            }}>
              Land Your Dream Job.
              <br />
              <span className="gradient-text">Before The Real Interview.</span>
            </h1>

            {/* Body */}
            <p style={{
              fontSize: 18, color: "rgba(255,255,255,0.52)",
              lineHeight: 1.68, maxWidth: 480, marginBottom: 38,
            }}>
              AI mock interviews, ATS resume scoring, and personalized prep — one platform
              built to get you hired faster.
            </p>

            {/* CTAs */}
            <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 42 }}>
              <button
                onClick={onCTA}
                style={{
                  background: "linear-gradient(135deg, #6366f1, #8b5cf6)",
                  color: "white", border: "none", borderRadius: 11,
                  padding: "14px 28px", fontSize: 15, fontWeight: 700,
                  cursor: "pointer", fontFamily: "inherit",
                  boxShadow: "0 0 28px rgba(99,102,241,0.45)",
                  transition: "transform 0.15s, box-shadow 0.2s",
                }}
                onMouseEnter={e => {
                  (e.currentTarget as HTMLButtonElement).style.transform = "translateY(-2px)"
                  ;(e.currentTarget as HTMLButtonElement).style.boxShadow = "0 0 40px rgba(99,102,241,0.65)"
                }}
                onMouseLeave={e => {
                  (e.currentTarget as HTMLButtonElement).style.transform = "translateY(0)"
                  ;(e.currentTarget as HTMLButtonElement).style.boxShadow = "0 0 28px rgba(99,102,241,0.45)"
                }}
              >
                Start for Free →
              </button>
              <a
                href="#how-it-works"
                style={{
                  fontSize: 14, fontWeight: 500,
                  color: "rgba(255,255,255,0.48)",
                  textDecoration: "none",
                  display: "flex", alignItems: "center", gap: 6,
                }}
              >
                See How It Works ↓
              </a>
            </div>

            {/* Social proof */}
            <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
              <div style={{ display: "flex" }}>
                {["#6366f1", "#8b5cf6", "#06b6d4", "#10b981"].map((color, i) => (
                  <div key={i} style={{
                    width: 30, height: 30, borderRadius: "50%",
                    border: "2px solid #09090f",
                    background: color,
                    marginLeft: i > 0 ? -10 : 0,
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontSize: 11, fontWeight: 800, color: "white",
                  }}>
                    {["P", "D", "A", "R"][i]}
                  </div>
                ))}
              </div>
              <p style={{ fontSize: 13, color: "rgba(255,255,255,0.38)", margin: 0 }}>
                Trusted by{" "}
                <strong style={{ color: "rgba(255,255,255,0.65)" }}>500+</strong>
                {" "}job seekers this month
              </p>
            </div>
          </div>

          {/* Right — Interview widget */}
          <div style={{ flexShrink: 0, display: "flex", flexDirection: "column", gap: 16, alignItems: "flex-end" }}>
            <InterviewWidget />
            {/* Floating ATS score mini card */}
            <div
              className="glass-card"
              style={{
                borderRadius: 14, padding: "14px 18px",
                display: "flex", alignItems: "center", gap: 12,
                alignSelf: "flex-start", marginLeft: 32,
                animation: "float 4s ease-in-out 1.5s infinite",
              }}
            >
              <div style={{
                width: 44, height: 44, borderRadius: 12,
                background: "rgba(16,185,129,0.15)",
                border: "1px solid rgba(16,185,129,0.25)",
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: 16, fontWeight: 800, color: "#10b981", fontFamily: "monospace",
              }}>82</div>
              <div>
                <div style={{ fontSize: 12, fontWeight: 700, color: "rgba(255,255,255,0.85)", marginBottom: 2 }}>ATS Score</div>
                <div style={{ fontSize: 11, color: "rgba(255,255,255,0.35)" }}>Resume passes filter ✓</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// Section: Products
// ─────────────────────────────────────────────────────────────────────────────
function Products({
  onInterview,
  onPrep,
  onAts,
}: {
  onInterview: () => void
  onPrep: () => void
  onAts: () => void
}) {
  return (
    <section id="products" style={{ padding: "100px 0" }}>
      <div style={{ maxWidth: 1160, margin: "0 auto", padding: "0 28px" }}>
        {/* Heading */}
        <div style={{ textAlign: "center", marginBottom: 64 }}>
          <p style={{ fontSize: 12, color: "#818cf8", fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 14 }}>
            The Suite
          </p>
          <h2 style={{ fontSize: "clamp(32px, 4vw, 50px)", fontWeight: 900, color: "white", letterSpacing: "-0.03em", marginBottom: 16, lineHeight: 1.1 }}>
            One platform. Three powerful tools.
          </h2>
          <p style={{ fontSize: 17, color: "rgba(255,255,255,0.45)", maxWidth: 440, margin: "0 auto" }}>
            Pick what you need today. Start for free, upgrade when you're ready.
          </p>
        </div>

        {/* Cards */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1.08fr 1fr", gap: 20, alignItems: "stretch" }}>

          {/* ── ATS Card ── */}
          <div
            className="glass-card"
            style={{ borderRadius: 18, padding: "30px 28px", display: "flex", flexDirection: "column" }}
          >
            {/* Icon */}
            <div style={{
              width: 48, height: 48, borderRadius: 14,
              background: "rgba(16,185,129,0.12)", border: "1px solid rgba(16,185,129,0.2)",
              display: "flex", alignItems: "center", justifyContent: "center",
              color: "#10b981", marginBottom: 20,
            }}>
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                <polyline points="14 2 14 8 20 8"/>
                <polyline points="9 15 11 17 15 13"/>
              </svg>
            </div>

            {/* Badge */}
            <div style={{
              display: "inline-flex", alignItems: "center",
              background: "rgba(16,185,129,0.12)", border: "1px solid rgba(16,185,129,0.25)",
              borderRadius: 999, padding: "3px 10px", marginBottom: 14, width: "fit-content",
            }}>
              <span style={{ fontSize: 11, color: "#10b981", fontWeight: 700 }}>FREE — Unlimited</span>
            </div>

            <h3 style={{ fontSize: 20, fontWeight: 800, color: "white", marginBottom: 10, letterSpacing: "-0.02em" }}>
              ATS Score Checker
            </h3>
            <p style={{ fontSize: 14, color: "rgba(255,255,255,0.5)", lineHeight: 1.6, marginBottom: 24, flex: 1 }}>
              Instantly see how your resume scores against any job description. Beat automated filters before a human ever sees your application.
            </p>

            {/* Mock ATS visual */}
            <div style={{
              background: "rgba(0,0,0,0.25)", borderRadius: 10,
              padding: "12px 14px", marginBottom: 24,
            }}>
              {[
                { label: "Keyword Match", score: 78, color: "#10b981" },
                { label: "Format Score", score: 91, color: "#6366f1" },
                { label: "Section Coverage", score: 85, color: "#06b6d4" },
              ].map(row => (
                <div key={row.label} style={{ marginBottom: 8 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                    <span style={{ fontSize: 11, color: "rgba(255,255,255,0.4)" }}>{row.label}</span>
                    <span style={{ fontSize: 11, color: row.color, fontWeight: 700, fontFamily: "monospace" }}>{row.score}</span>
                  </div>
                  <div style={{ height: 3, background: "rgba(255,255,255,0.06)", borderRadius: 999 }}>
                    <div style={{ width: `${row.score}%`, height: "100%", background: row.color, borderRadius: 999, opacity: 0.8 }} />
                  </div>
                </div>
              ))}
            </div>

            <button
              onClick={onAts}
              style={{
                background: "rgba(16,185,129,0.12)", border: "1px solid rgba(16,185,129,0.25)",
                color: "#10b981", borderRadius: 10, padding: "11px 0", fontSize: 14, fontWeight: 700,
                cursor: "pointer", fontFamily: "inherit", width: "100%",
                transition: "background 0.2s",
              }}
              onMouseEnter={e => (e.currentTarget.style.background = "rgba(16,185,129,0.22)")}
              onMouseLeave={e => (e.currentTarget.style.background = "rgba(16,185,129,0.12)")}
            >
              Check My Resume →
            </button>
          </div>

          {/* ── AI Interview Card (featured) ── */}
        

          {/* ── Prep Coach Card ── */}
              
        </div>
      </div>
    </section>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// Section: How It Works
// ─────────────────────────────────────────────────────────────────────────────
function HowItWorks() {
  return (
    <section id="how-it-works" style={{ padding: "100px 0" }}>
      <div style={{ maxWidth: 1160, margin: "0 auto", padding: "0 28px" }}>
        {/* Heading */}
        <div style={{ textAlign: "center", marginBottom: 72 }}>
          <p style={{ fontSize: 12, color: "#818cf8", fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 14 }}>
            The Process
          </p>
          <h2 style={{ fontSize: "clamp(30px, 3.8vw, 48px)", fontWeight: 900, color: "white", letterSpacing: "-0.03em", marginBottom: 16, lineHeight: 1.1 }}>
            Go from resume to offer-ready
            <br />
            <span className="gradient-text">in under an hour.</span>
          </h2>
          <p style={{ fontSize: 17, color: "rgba(255,255,255,0.42)", maxWidth: 420, margin: "0 auto" }}>
            Three steps. Real AI. Zero fluff.
          </p>
        </div>

        {/* Steps row */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 40px 1fr 40px 1fr", alignItems: "start", marginBottom: 72, gap: 0 }}>
          {STEPS.map((step, i) => (
            <>
              <div key={step.num} className="glass-card" style={{ borderRadius: 16, padding: "28px 24px" }}>
                {/* Number + icon */}
                <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 18 }}>
                  <span style={{
                    fontSize: 38, fontWeight: 900, color: "rgba(99,102,241,0.2)",
                    fontFamily: "monospace", lineHeight: 1, letterSpacing: "-0.04em",
                  }}>{step.num}</span>
                  <div style={{
                    width: 36, height: 36, borderRadius: 10,
                    background: "rgba(99,102,241,0.12)", border: "1px solid rgba(99,102,241,0.2)",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    color: "#818cf8",
                  }}>{step.icon}</div>
                </div>
                <h3 style={{ fontSize: 17, fontWeight: 800, color: "white", marginBottom: 8, letterSpacing: "-0.02em" }}>
                  {step.title}
                </h3>
                <p style={{ fontSize: 13.5, color: "rgba(255,255,255,0.45)", lineHeight: 1.6, margin: 0 }}>
                  {step.desc}
                </p>
              </div>
              {/* Connector line — only between steps */}
              {i < 2 && (
                <div key={`arrow-${i}`} style={{
                  display: "flex", alignItems: "center", justifyContent: "center",
                  paddingTop: 40,
                }}>
                  <svg width="28" height="16" viewBox="0 0 28 16" fill="none">
                    <path d="M0 8h22M18 4l6 4-6 4" stroke="rgba(99,102,241,0.4)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>
              )}
            </>
          ))}
        </div>

        {/* Video Placeholder */}
        <div style={{
          position: "relative",
          borderRadius: 20,
          overflow: "hidden",
          background: "#0c0c18",
          border: "1px solid rgba(255,255,255,0.08)",
          aspectRatio: "16/9",
          maxHeight: 540,
          display: "flex", alignItems: "center", justifyContent: "center",
          boxShadow: "0 0 80px rgba(99,102,241,0.08)",
        }}>
          {/* Gradient bg */}
          <div style={{
            position: "absolute", inset: 0,
            background: "radial-gradient(ellipse 60% 60% at 50% 50%, rgba(99,102,241,0.08) 0%, transparent 70%)",
          }} />

          {/* Grid overlay */}
          <div style={{
            position: "absolute", inset: 0,
            backgroundImage: "linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px)",
            backgroundSize: "48px 48px",
          }} />

          {/* Center content */}
          <div style={{ textAlign: "center", position: "relative", zIndex: 1 }}>
            {/* Play button */}
            <div style={{
              width: 72, height: 72, borderRadius: "50%",
              background: "linear-gradient(135deg, #6366f1, #8b5cf6)",
              display: "flex", alignItems: "center", justifyContent: "center",
              margin: "0 auto 20px",
              boxShadow: "0 0 40px rgba(99,102,241,0.5)",
              cursor: "pointer",
              transition: "transform 0.2s, box-shadow 0.2s",
            }}
              onMouseEnter={e => {
                (e.currentTarget as HTMLDivElement).style.transform = "scale(1.08)"
                ;(e.currentTarget as HTMLDivElement).style.boxShadow = "0 0 60px rgba(99,102,241,0.7)"
              }}
              onMouseLeave={e => {
                (e.currentTarget as HTMLDivElement).style.transform = "scale(1)"
                ;(e.currentTarget as HTMLDivElement).style.boxShadow = "0 0 40px rgba(99,102,241,0.5)"
              }}
            >
              <svg width="26" height="26" viewBox="0 0 24 24" fill="white">
                <polygon points="5 3 19 12 5 21 5 3"/>
              </svg>
            </div>
            <p style={{ fontSize: 17, fontWeight: 700, color: "rgba(255,255,255,0.8)", marginBottom: 6 }}>
              Watch MockHire in Action
            </p>
            <p style={{ fontSize: 13, color: "rgba(255,255,255,0.3)" }}>Demo video coming soon</p>
          </div>

          {/* Corner badge */}
          <div style={{
            position: "absolute", bottom: 20, right: 20,
            background: "rgba(0,0,0,0.6)", border: "1px solid rgba(255,255,255,0.1)",
            borderRadius: 8, padding: "6px 12px",
            fontSize: 11, color: "rgba(255,255,255,0.5)", fontFamily: "monospace",
          }}>
            mockhire.me · 2025
          </div>
        </div>
      </div>
    </section>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// Section: Testimonials
// ─────────────────────────────────────────────────────────────────────────────
function Testimonials() {
  return (
    <section style={{ padding: "80px 0" }}>
      <div style={{ maxWidth: 1160, margin: "0 auto", padding: "0 28px" }}>
        <div style={{ textAlign: "center", marginBottom: 56 }}>
          <p style={{ fontSize: 12, color: "#818cf8", fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 14 }}>
            Real Results
          </p>
          <h2 style={{ fontSize: "clamp(28px, 3.5vw, 44px)", fontWeight: 900, color: "white", letterSpacing: "-0.03em" }}>
            People who got hired with MockHire
          </h2>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 20 }}>
          {TESTIMONIALS.map(t => (
            <div key={t.name} className="glass-card" style={{ borderRadius: 16, padding: "28px 26px" }}>
              {/* Stars */}
              <div style={{ display: "flex", gap: 3, marginBottom: 16 }}>
                {Array.from({ length: 5 }).map((_, i) => (
                  <svg key={i} width="14" height="14" viewBox="0 0 24 24" fill="#f59e0b">
                    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
                  </svg>
                ))}
              </div>
              <p style={{ fontSize: 14, color: "rgba(255,255,255,0.65)", lineHeight: 1.7, marginBottom: 22, fontStyle: "italic" }}>
                "{t.quote}"
              </p>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <div style={{
                  width: 36, height: 36, borderRadius: "50%",
                  background: `${t.color}22`, border: `1px solid ${t.color}44`,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: 12, fontWeight: 800, color: t.color,
                }}>{t.avatar}</div>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 700, color: "white" }}>{t.name}</div>
                  <div style={{ fontSize: 11.5, color: "rgba(255,255,255,0.35)" }}>{t.role}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// Section: Pricing
// ─────────────────────────────────────────────────────────────────────────────
function Pricing({ onPro }: { onPro: () => void }) {
  const CheckIcon = () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="20 6 9 17 4 12" />
    </svg>
  )

  return (
    <section id="pricing" style={{ padding: "100px 0" }}>
      <div style={{ maxWidth: 1160, margin: "0 auto", padding: "0 28px" }}>
        <div style={{ textAlign: "center", marginBottom: 64 }}>
          <p style={{ fontSize: 12, color: "#818cf8", fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 14 }}>
            Pricing
          </p>
          <h2 style={{ fontSize: "clamp(30px, 3.8vw, 48px)", fontWeight: 900, color: "white", letterSpacing: "-0.03em", marginBottom: 14, lineHeight: 1.1 }}>
            Simple pricing. No surprises.
          </h2>
          <p style={{ fontSize: 16, color: "rgba(255,255,255,0.42)" }}>
            Start free. Upgrade when you need more.
          </p>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20, maxWidth: 820, margin: "0 auto" }}>


          

          {/* Pro plan */}
          <div
            className="glass-card-featured"
            style={{ borderRadius: 20, padding: "36px 32px", position: "relative", overflow: "hidden" }}
          >
            <div style={{
              position: "absolute", top: -30, right: -30,
              width: 160, height: 160,
              background: "radial-gradient(ellipse, rgba(99,102,241,0.35) 0%, transparent 70%)",
              pointerEvents: "none",
            }} />

            <div style={{ marginBottom: 28, position: "relative", zIndex: 1 }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
                <div style={{ fontSize: 14, fontWeight: 700, color: "rgba(255,255,255,0.5)", textTransform: "uppercase", letterSpacing: "0.05em" }}>Pro</div>
                <div style={{
                  fontSize: 11, color: "#818cf8", fontWeight: 700,
                  background: "rgba(99,102,241,0.15)", border: "1px solid rgba(99,102,241,0.3)",
                  borderRadius: 999, padding: "3px 10px",
                }}>Most Popular</div>
              </div>
              <div style={{ display: "flex", alignItems: "baseline", gap: 4 }}>
                <span style={{ fontSize: 52, fontWeight: 900, color: "white", letterSpacing: "-0.05em" }}>$12</span>
                <span style={{ fontSize: 15, color: "rgba(255,255,255,0.35)" }}>/month</span>
              </div>
            </div>

            <div style={{ height: 1, background: "rgba(99,102,241,0.2)", marginBottom: 28, position: "relative", zIndex: 1 }} />

            <div style={{ display: "flex", flexDirection: "column", gap: 12, marginBottom: 32, position: "relative", zIndex: 1 }}>
              {PRO_FEATURES_LIST.map(f => (
                <div key={f} style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <div style={{
                    width: 18, height: 18, borderRadius: "50%",
                    background: "rgba(99,102,241,0.15)", border: "1px solid rgba(99,102,241,0.3)",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    color: "#818cf8", flexShrink: 0,
                  }}><CheckIcon /></div>
                  <span style={{ fontSize: 14, color: "rgba(255,255,255,0.7)" }}>{f}</span>
                </div>
              ))}
            </div>

            <button
              onClick={onPro}
              style={{
                width: "100%",
                background: "linear-gradient(135deg, #6366f1, #8b5cf6)",
                color: "white", border: "none", borderRadius: 10,
                padding: "13px 0", fontSize: 14, fontWeight: 700,
                cursor: "pointer", fontFamily: "inherit",
                boxShadow: "0 0 24px rgba(99,102,241,0.4)",
                position: "relative", zIndex: 1,
              }}
            >
              Get Pro Access →
            </button>
          </div>
        </div>
      </div>
    </section>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// Section: Footer
// ─────────────────────────────────────────────────────────────────────────────
function Footer() {
  return (
    <footer style={{
      borderTop: "1px solid rgba(255,255,255,0.06)",
      padding: "48px 28px",
    }}>
      <div style={{
        maxWidth: 1160, margin: "0 auto",
        display: "flex", alignItems: "center", justifyContent: "space-between",
      }}>
        {/* Logo + tagline */}
        <div>
          <a href="/" style={{ textDecoration: "none" }}>
            <span style={{ fontSize: 18, fontWeight: 800, color: "white", letterSpacing: "-0.03em" }}>
              mock
              <span style={{ background: "linear-gradient(135deg, #6366f1, #a78bfa)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>hire</span>
              <span style={{ color: "rgba(255,255,255,0.25)", fontSize: 14 }}>.me</span>
            </span>
          </a>
          <p style={{ fontSize: 13, color: "rgba(255,255,255,0.3)", marginTop: 6, maxWidth: 280 }}>
            AI-powered interview prep for the modern job seeker.
          </p>
        </div>

        {/* Links */}
        <div style={{ display: "flex", gap: 28 }}>
          {["Products", "How It Works", "Pricing"].map(link => (
            <a key={link} href={`#${link.toLowerCase().replace(/ /g, "-")}`}
              style={{ fontSize: 13, color: "rgba(255,255,255,0.4)", textDecoration: "none" }}>
              {link}
            </a>
          ))}
        </div>

        {/* Copyright */}
        <p style={{ fontSize: 12, color: "rgba(255,255,255,0.22)" }}>
          © 2025 MockHire.me · All rights reserved
        </p>
      </div>
    </footer>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// Root: LandingPage
// ─────────────────────────────────────────────────────────────────────────────
export default function LandingPage() {
  const navigate = useNavigate()
  const [paywallOpen, setPaywallOpen] = useState(false)
  const [paywallReason, setPaywallReason] = useState<"interview" | "prep">("interview")

  const checkAndNavigate = () => {
    const used = localStorage.getItem("mockhire_interview_used")
    if (used) {
      setPaywallReason("interview")
      setPaywallOpen(true)
    } else {
      navigate("/app")
    }
  }

  const openPrepPaywall = () => {
    setPaywallReason("prep")
    setPaywallOpen(true)
  }

  const openProPaywall = () => {
    setPaywallReason("interview")
    setPaywallOpen(true)
  }

  return (
    <div style={{ background: "#09090f", minHeight: "100vh", color: "white", fontFamily: "inherit" }}>
      <Navbar onGetStarted={checkAndNavigate} />
      <Hero onCTA={checkAndNavigate} />

      {/* Stats bar */}
      <div style={{
        borderTop: "1px solid rgba(255,255,255,0.06)",
        borderBottom: "1px solid rgba(255,255,255,0.06)",
        padding: "28px 0",
      }}>
        <div style={{
          maxWidth: 1160, margin: "0 auto", padding: "0 28px",
          display: "flex", justifyContent: "space-around", alignItems: "center",
        }}>
          {[
            { value: "10,000+", label: "Interviews Conducted" },
            { value: "94%", label: "Improved Their Score" },
            { value: "50+", label: "Job Roles Covered" },
            { value: "< 60s", label: "Setup Time" },
          ].map(stat => (
            <div key={stat.label} style={{ textAlign: "center" }}>
              <div style={{ fontSize: 26, fontWeight: 900, color: "white", letterSpacing: "-0.03em", marginBottom: 4 }}>
                {stat.value}
              </div>
              <div style={{ fontSize: 12, color: "rgba(255,255,255,0.35)", fontWeight: 500 }}>{stat.label}</div>
            </div>
          ))}
        </div>
      </div>

      <Products
        onInterview={checkAndNavigate}
        onPrep={openPrepPaywall}
        onAts={() => navigate("/ats")}
      />
      <HowItWorks />
      <Testimonials />
      <Pricing onPro={openProPaywall} />
      <Footer />

      <PaywallModal
        open={paywallOpen}
        reason={paywallReason}
        onClose={() => setPaywallOpen(false)}
      />
    </div>
  )
}
