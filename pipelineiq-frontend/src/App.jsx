import { useState } from "react";
import InputForm from "./components/InputForm";
import ResultCard from "./components/ResultCard";
import SummaryBanner from "./components/SummaryBanner";
import YmlDownload from "./components/YmlDownload";

/* ── SVG Icons ──────────────────────────────────────────────────────────── */
const GithubIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" />
  </svg>
);

/* ── Loading Skeleton Cards ─────────────────────────────────────────────── */
function LoadingSkeletons() {
  return (
    <div style={{ marginTop: "32px" }}>
      {[0, 1, 2].map((i) => (
        <div
          key={i}
          style={{
            background: "#13131f",
            border: "1px solid rgba(255,255,255,0.063)",
            borderRadius: "16px",
            padding: "20px",
            marginBottom: "16px",
            animation: "fadeInUp 0.4s ease-out both",
            animationDelay: `${i * 120}ms`,
          }}
        >
          {/* Header skeleton */}
          <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "16px" }}>
            <div className="animate-shimmer" style={{ width: "120px", height: "26px", borderRadius: "999px" }} />
            <div className="animate-shimmer" style={{ flex: 1, height: "14px", borderRadius: "4px" }} />
            <div className="animate-shimmer" style={{ width: "60px", height: "18px", borderRadius: "4px" }} />
          </div>
          {/* Body skeleton */}
          <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
            <div className="animate-shimmer" style={{ width: "95%", height: "12px", borderRadius: "4px" }} />
            <div className="animate-shimmer" style={{ width: "75%", height: "12px", borderRadius: "4px" }} />
            <div className="animate-shimmer" style={{ width: "85%", height: "12px", borderRadius: "4px" }} />
          </div>
        </div>
      ))}
    </div>
  );
}

/* ── Error State Card ───────────────────────────────────────────────────── */
function ErrorCard({ message, onRetry }) {
  return (
    <div
      style={{
        marginTop: "32px",
        background: "#13131f",
        border: "1px solid rgba(255,71,87,0.25)",
        borderRadius: "16px",
        padding: "40px 32px",
        textAlign: "center",
        animation: "fadeInUp 0.4s ease-out both",
      }}
    >
      <div style={{ fontSize: "40px", marginBottom: "12px" }}>❌</div>
      <h3
        style={{
          fontFamily: "var(--font-display)",
          fontWeight: 700,
          fontSize: "20px",
          color: "#ff4757",
          marginBottom: "8px",
        }}
      >
        Analysis Failed
      </h3>
      <p
        style={{
          fontFamily: "var(--font-body)",
          fontSize: "14px",
          color: "#8888aa",
          lineHeight: 1.6,
          maxWidth: "400px",
          margin: "0 auto 24px",
        }}
      >
        {message}
      </p>
      <button
        onClick={onRetry}
        style={{
          padding: "10px 28px",
          borderRadius: "10px",
          border: "1px solid rgba(255,71,87,0.3)",
          background: "rgba(255,71,87,0.08)",
          color: "#ff4757",
          fontFamily: "var(--font-body)",
          fontWeight: 600,
          fontSize: "14px",
          cursor: "pointer",
          transition: "all 0.2s ease",
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.background = "rgba(255,71,87,0.15)";
          e.currentTarget.style.borderColor = "rgba(255,71,87,0.5)";
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.background = "rgba(255,71,87,0.08)";
          e.currentTarget.style.borderColor = "rgba(255,71,87,0.3)";
        }}
      >
        Try Again
      </button>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════════════════
   APP COMPONENT
   ══════════════════════════════════════════════════════════════════════════ */
export default function App() {
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleReset = () => {
    setResults(null);
    setError(null);
    setLoading(false);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column", background: "#0a0a0f" }}>

      {/* ══ BACKGROUND LAYER ═══════════════════════════════════════════ */}
      {/* Orb 1 — top-left blue */}
      <div
        style={{
          position: "fixed",
          top: "-100px",
          left: "-150px",
          width: "600px",
          height: "600px",
          borderRadius: "50%",
          background: "radial-gradient(circle, rgba(79,142,255,0.06) 0%, transparent 70%)",
          filter: "blur(120px)",
          animation: "float 20s ease-in-out infinite",
          pointerEvents: "none",
          zIndex: 0,
        }}
      />
      {/* Orb 2 — bottom-right cyan */}
      <div
        style={{
          position: "fixed",
          bottom: "-100px",
          right: "-150px",
          width: "500px",
          height: "500px",
          borderRadius: "50%",
          background: "radial-gradient(circle, rgba(0,212,255,0.04) 0%, transparent 70%)",
          filter: "blur(100px)",
          animation: "float 25s ease-in-out infinite reverse",
          pointerEvents: "none",
          zIndex: 0,
        }}
      />
      {/* Noise texture overlay */}
      <div
        style={{
          position: "fixed",
          inset: 0,
          opacity: 0.03,
          pointerEvents: "none",
          zIndex: 0,
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
          backgroundRepeat: "repeat",
        }}
      />

      {/* ══ FIXED NAVBAR ═══════════════════════════════════════════════ */}
      <nav
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          height: "64px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          paddingLeft: "24px",
          paddingRight: "24px",
          background: "rgba(10,10,15,0.8)",
          backdropFilter: "blur(20px)",
          WebkitBackdropFilter: "blur(20px)",
          borderBottom: "1px solid rgba(255,255,255,0.03)",
          zIndex: 100,
          animation: "slideDown 0.4s ease-out both",
        }}
      >
        {/* Logo */}
        <div
          style={{
            fontFamily: "var(--font-display)",
            fontWeight: 800,
            fontSize: "22px",
            display: "flex",
            alignItems: "center",
            gap: "2px",
          }}
        >
          <span
            style={{
              background: "linear-gradient(135deg, #4f8eff, #00d4ff)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
            }}
          >
            Pipeline
          </span>
          <span style={{ color: "#fff" }}>IQ</span>
        </div>

        {/* GitHub link */}
        <a
          href="https://github.com"
          target="_blank"
          rel="noopener noreferrer"
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "6px",
            padding: "6px 14px",
            borderRadius: "999px",
            border: "1px solid rgba(255,255,255,0.1)",
            background: "transparent",
            color: "#8888aa",
            fontFamily: "var(--font-body)",
            fontWeight: 500,
            fontSize: "13px",
            textDecoration: "none",
            cursor: "pointer",
            transition: "all 0.2s ease",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.borderColor = "#4f8eff";
            e.currentTarget.style.color = "#4f8eff";
            e.currentTarget.style.boxShadow = "0 0 12px rgba(79,142,255,0.15)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.borderColor = "rgba(255,255,255,0.1)";
            e.currentTarget.style.color = "#8888aa";
            e.currentTarget.style.boxShadow = "none";
          }}
        >
          <GithubIcon />
          <span>GitHub</span>
        </a>
      </nav>

      {/* ══ MAIN CONTENT ═══════════════════════════════════════════════ */}
      <main
        style={{
          flex: 1,
          width: "100%",
          maxWidth: "860px",
          marginLeft: "auto",
          marginRight: "auto",
          paddingTop: "120px",
          paddingBottom: "80px",
          paddingLeft: "clamp(16px, 4vw, 40px)",
          paddingRight: "clamp(16px, 4vw, 40px)",
          position: "relative",
          zIndex: 1,
        }}
      >
        {/* ── Input Form Section ──────────────────────────────────── */}
        <InputForm
          onResults={(data) => {
            setResults(data);
            setError(null);
          }}
          onLoading={setLoading}
          onError={(msg) => {
            setError(msg);
            setResults(null);
          }}
        />

        {/* ── Loading State ───────────────────────────────────────── */}
        {loading && <LoadingSkeletons />}

        {/* ── Error State ─────────────────────────────────────────── */}
        {error && !loading && (
          <ErrorCard message={error} onRetry={handleReset} />
        )}

        {/* ── Results Section ─────────────────────────────────────── */}
        {results && !loading && (
          <div
            style={{
              marginTop: "32px",
              animation: "fadeInUp 0.4s ease-out both",
            }}
          >
            {/* Summary Banner (fades in first) */}
            <SummaryBanner data={results} />

            {/* Reset Button */}
            <div
              style={{
                display: "flex",
                justifyContent: "flex-end",
                marginBottom: "16px",
              }}
            >
              <button
                onClick={handleReset}
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "6px",
                  padding: "8px 16px",
                  borderRadius: "8px",
                  border: "1px solid rgba(255,255,255,0.1)",
                  background: "transparent",
                  color: "#8888aa",
                  fontFamily: "var(--font-body)",
                  fontWeight: 500,
                  fontSize: "13px",
                  cursor: "pointer",
                  transition: "all 0.2s ease",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = "#4f8eff";
                  e.currentTarget.style.color = "#4f8eff";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = "rgba(255,255,255,0.1)";
                  e.currentTarget.style.color = "#8888aa";
                }}
              >
                ↺ New Analysis
              </button>
            </div>

            {/* Error Cards (staggered via ResultCard index prop) */}
            {(results.errors || []).map((err, i) => (
              <ResultCard key={i} error={err} index={i} />
            ))}

            {/* YML Download (fades in last) */}
            <YmlDownload errors={results.errors} />
          </div>
        )}
      </main>

      {/* ══ FOOTER ═════════════════════════════════════════════════════ */}
      <footer
        style={{
          textAlign: "center",
          padding: "32px 16px",
          marginTop: "auto",
          borderTop: "1px solid rgba(255,255,255,0.03)",
          zIndex: 1,
        }}
      >
        <p
          style={{
            fontFamily: "var(--font-body)",
            fontSize: "13px",
            color: "#4a4a6a",
          }}
        >
          PipelineIQ &nbsp;·&nbsp; Powered by Gemini API and GitHub REST API
        </p>
      </footer>
    </div>
  );
}
