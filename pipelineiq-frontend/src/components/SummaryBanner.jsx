import { useState, useEffect } from "react";

const CATEGORY_COLORS = {
  "Build Failure": "#ff4757",
  "Dependency Conflict": "#ff6b35",
  "Environment Misconfiguration": "#ffa502",
  "Test Failure": "#a55eea",
  "Permission Error": "#4f8eff",
  "Unknown Error": "#747d8c",
};

function getErrorCountColor(n) {
  if (n === 0) return "#00ff88";
  if (n <= 2) return "#ffa502";
  return "#ff4757";
}

/* ── Download Icon ──────────────────────────────────────────────────────── */
const DownloadIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" />
    <polyline points="7 10 12 15 17 10" />
    <line x1="12" y1="15" x2="12" y2="3" />
  </svg>
);

/* ── Clock Icon ─────────────────────────────────────────────────────────── */
const ClockIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none"
    stroke="#4f8eff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10" />
    <polyline points="12 6 12 12 16 14" />
  </svg>
);

export default function SummaryBanner({ data }) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setVisible(true), 80);
    return () => clearTimeout(t);
  }, []);

  if (!data) return null;

  const { total_errors = 0, errors = [], estimated_fix_time = "N/A" } = data;
  const countColor = getErrorCountColor(total_errors);

  /* Unique categories with counts */
  const catMap = {};
  errors.forEach((e) => {
    const c = e.category || "Unknown Error";
    catMap[c] = (catMap[c] || 0) + 1;
  });
  const categories = Object.entries(catMap);

  /* Export as .txt */
  const handleExport = () => {
    const date = new Date().toLocaleString();
    let txt = `PipelineIQ Analysis Report\nGenerated: ${date}\nTotal Errors: ${total_errors}\n---\n`;
    errors.forEach((e, i) => {
      txt += `\nCategory: ${e.category || "Unknown"}\n`;
      txt += `Error: ${e.error_line || ""}\n`;
      txt += `Explanation: ${e.explanation || ""}\n`;
      txt += `Fix Steps:\n`;
      (e.fix_steps || []).forEach((s, j) => {
        txt += `  ${j + 1}. ${s}\n`;
      });
      txt += `Confidence: ${e.confidence || "Low"}\n`;
      txt += `---\n`;
    });
    const blob = new Blob([txt], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "pipelineiq-report.txt";
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div
      style={{
        background: "#13131f",
        border: "1px solid rgba(255,255,255,0.063)",
        borderRadius: "16px",
        padding: "24px",
        marginBottom: "24px",
        opacity: visible ? 1 : 0,
        transform: visible ? "translateY(0)" : "translateY(-16px)",
        transition: "opacity 0.5s ease-out, transform 0.5s ease-out",
      }}
    >
      {/* ── Top Row ────────────────────────────────────────────────── */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          flexWrap: "wrap",
          gap: "12px",
          marginBottom: "20px",
        }}
      >
        {/* Heading with pulse dot */}
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <span
            style={{
              width: "8px",
              height: "8px",
              borderRadius: "50%",
              background: "#00ff88",
              boxShadow: "0 0 6px #00ff88",
              animation: "pulse-glow 2s ease-in-out infinite",
              flexShrink: 0,
            }}
          />
          <h2
            style={{
              fontFamily: "var(--font-display)",
              fontWeight: 700,
              fontSize: "20px",
              color: "#fff",
              margin: 0,
            }}
          >
            Analysis Complete
          </h2>
        </div>

        {/* Export button */}
        <button
          onClick={handleExport}
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "6px",
            padding: "8px 16px",
            borderRadius: "8px",
            border: "1px solid rgba(255,255,255,0.12)",
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
            e.currentTarget.style.borderColor = "rgba(255,255,255,0.12)";
            e.currentTarget.style.color = "#8888aa";
          }}
        >
          <DownloadIcon /> Export Report
        </button>
      </div>

      {/* ── Stats Row ──────────────────────────────────────────────── */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
          gap: "16px",
        }}
      >
        {/* Card 1: Total Errors */}
        <div
          style={{
            background: `${countColor}14`,
            border: `1px solid ${countColor}33`,
            borderRadius: "12px",
            padding: "20px",
          }}
        >
          <span
            style={{
              fontFamily: "var(--font-body)",
              fontWeight: 500,
              fontSize: "11px",
              textTransform: "uppercase",
              letterSpacing: "0.08em",
              color: "#8888aa",
            }}
          >
            Errors Found
          </span>
          <div
            style={{
              fontFamily: "var(--font-display)",
              fontWeight: 700,
              fontSize: "36px",
              color: countColor,
              lineHeight: 1.2,
              marginTop: "4px",
            }}
          >
            {total_errors}
          </div>
        </div>

        {/* Card 2: Categories */}
        <div
          style={{
            background: "rgba(255,255,255,0.025)",
            border: "1px solid rgba(255,255,255,0.05)",
            borderRadius: "12px",
            padding: "20px",
          }}
        >
          <span
            style={{
              fontFamily: "var(--font-body)",
              fontWeight: 500,
              fontSize: "11px",
              textTransform: "uppercase",
              letterSpacing: "0.08em",
              color: "#8888aa",
              display: "block",
              marginBottom: "10px",
            }}
          >
            Categories
          </span>
          <div style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>
            {categories.length === 0 && (
              <span style={{ fontSize: "13px", color: "#555570" }}>None</span>
            )}
            {categories.map(([cat, count]) => {
              const c = CATEGORY_COLORS[cat] || "#747d8c";
              return (
                <span
                  key={cat}
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "4px",
                    padding: "3px 8px",
                    borderRadius: "999px",
                    background: `${c}20`,
                    color: c,
                    fontFamily: "var(--font-body)",
                    fontWeight: 500,
                    fontSize: "11px",
                    whiteSpace: "nowrap",
                  }}
                >
                  {count}× {cat}
                </span>
              );
            })}
          </div>
        </div>

        {/* Card 3: Est. Fix Time */}
        <div
          style={{
            background: "rgba(255,255,255,0.025)",
            border: "1px solid rgba(255,255,255,0.05)",
            borderRadius: "12px",
            padding: "20px",
          }}
        >
          <span
            style={{
              fontFamily: "var(--font-body)",
              fontWeight: 500,
              fontSize: "11px",
              textTransform: "uppercase",
              letterSpacing: "0.08em",
              color: "#8888aa",
              display: "block",
              marginBottom: "8px",
            }}
          >
            Est. Fix Time
          </span>
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <ClockIcon />
            <span
              style={{
                fontFamily: "var(--font-display)",
                fontWeight: 700,
                fontSize: "20px",
                color: "#4f8eff",
              }}
            >
              {estimated_fix_time}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
