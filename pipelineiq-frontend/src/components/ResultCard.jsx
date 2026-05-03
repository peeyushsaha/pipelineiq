import { useState, useEffect } from "react";

/* ── Color Maps ─────────────────────────────────────────────────────────── */
const CATEGORY_COLORS = {
  "Build Failure":                "#ff4757",
  "Dependency Conflict":          "#ff6b35",
  "Environment Misconfiguration": "#ffa502",
  "Test Failure":                 "#a55eea",
  "Permission Error":             "#4f8eff",
  "Unknown Error":                "#747d8c",
};

const CONFIDENCE_COLORS = {
  High:   "#00ff88",
  Medium: "#ffa502",
  Low:    "#ff4757",
};

/* ── Copy Button ────────────────────────────────────────────────────────── */
function CopyButton({ text }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      /* silent fail */
    }
  };

  return (
    <button
      onClick={handleCopy}
      title={copied ? "Copied!" : "Copy"}
      style={{
        position: "absolute",
        top: "10px",
        right: "10px",
        background: "transparent",
        border: "none",
        cursor: "pointer",
        padding: "4px",
        borderRadius: "4px",
        color: copied ? "#00ff88" : "#8888aa",
        transition: "all 0.2s ease",
        animation: copied ? "pulse-glow 0.6s ease-out" : "none",
      }}
      onMouseEnter={(e) => {
        if (!copied) e.currentTarget.style.color = "#4f8eff";
      }}
      onMouseLeave={(e) => {
        if (!copied) e.currentTarget.style.color = "#8888aa";
      }}
    >
      {copied ? (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
          stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="20 6 9 17 4 12" />
        </svg>
      ) : (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
          stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
          <path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1" />
        </svg>
      )}
    </button>
  );
}

/* ── Fix Step Row ───────────────────────────────────────────────────────── */
function FixStep({ step, index, totalSteps }) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setVisible(true), index * 50);
    return () => clearTimeout(t);
  }, [index]);

  return (
    <div
      style={{
        position: "relative",
        background: "#0d0d18",
        borderRadius: "8px",
        padding: "12px 16px",
        paddingLeft: "44px",
        paddingRight: "40px",
        marginBottom: index < totalSteps - 1 ? "8px" : 0,
        opacity: visible ? 1 : 0,
        transform: visible ? "translateY(0)" : "translateY(8px)",
        transition: "opacity 0.3s ease, transform 0.3s ease",
      }}
    >
      {/* Step number badge */}
      <div
        style={{
          position: "absolute",
          left: "12px",
          top: "12px",
          width: "22px",
          height: "22px",
          borderRadius: "50%",
          background: "rgba(79, 142, 255, 0.12)",
          color: "#4f8eff",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontFamily: "var(--font-body)",
          fontWeight: 600,
          fontSize: "12px",
        }}
      >
        {index + 1}
      </div>

      {/* Step text */}
      <code
        style={{
          fontFamily: "var(--font-mono)",
          fontSize: "13px",
          color: "#e0e0ff",
          lineHeight: 1.6,
          wordBreak: "break-word",
        }}
      >
        {step}
      </code>

      <CopyButton text={step} />
    </div>
  );
}

/* ── Main ResultCard Component ──────────────────────────────────────────── */
export default function ResultCard({ error, index = 0 }) {
  const [expanded, setExpanded] = useState(index === 0);
  const [hovered, setHovered] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setMounted(true), index * 100);
    return () => clearTimeout(t);
  }, [index]);

  const cat = error.category || "Unknown Error";
  const catColor = CATEGORY_COLORS[cat] || "#747d8c";
  const confColor = CONFIDENCE_COLORS[error.confidence] || "#ff4757";
  const errorPreview =
    error.error_line?.length > 60
      ? error.error_line.slice(0, 60) + "..."
      : error.error_line || "";

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        display: "flex",
        borderRadius: "16px",
        overflow: "hidden",
        background: "#13131f",
        border: `1px solid ${hovered ? "rgba(255,255,255,0.15)" : "rgba(255,255,255,0.063)"}`,
        boxShadow: hovered ? "0 8px 32px rgba(0,0,0,0.3)" : "none",
        marginBottom: "16px",
        opacity: mounted ? 1 : 0,
        transform: mounted ? "translateY(0)" : "translateY(20px)",
        transition: "opacity 0.5s ease-out, transform 0.5s ease-out, border-color 0.3s ease, box-shadow 0.3s ease",
      }}
    >
      {/* ── Left Accent Bar ───────────────────────────────────────── */}
      <div
        style={{
          width: "4px",
          flexShrink: 0,
          background: catColor,
        }}
      />

      {/* ── Card Content ──────────────────────────────────────────── */}
      <div style={{ flex: 1, minWidth: 0 }}>
        {/* ── Header (always visible, clickable) ──────────────────── */}
        <button
          onClick={() => setExpanded(!expanded)}
          style={{
            width: "100%",
            display: "flex",
            alignItems: "flex-start",
            justifyContent: "space-between",
            gap: "12px",
            padding: "20px",
            background: "transparent",
            border: "none",
            cursor: "pointer",
            textAlign: "left",
          }}
        >
          {/* Left: badge + error preview */}
          <div style={{ flex: 1, minWidth: 0 }}>
            {/* Category badge */}
            <span
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "6px",
                padding: "4px 10px",
                borderRadius: "999px",
                background: `${catColor}26`,
                border: `1px solid ${catColor}4D`,
                fontFamily: "var(--font-body)",
                fontWeight: 500,
                fontSize: "13px",
                color: catColor,
                whiteSpace: "nowrap",
              }}
            >
              <span
                style={{
                  width: "6px",
                  height: "6px",
                  borderRadius: "50%",
                  background: catColor,
                  flexShrink: 0,
                }}
              />
              {cat}
            </span>

            {/* Error line preview */}
            <p
              style={{
                marginTop: "8px",
                fontFamily: "var(--font-mono)",
                fontSize: "12px",
                color: "#8888aa",
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
                maxWidth: "100%",
              }}
            >
              {errorPreview}
            </p>
          </div>

          {/* Right: confidence + chevron */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "12px",
              flexShrink: 0,
            }}
          >
            {/* Confidence */}
            <span
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "5px",
                fontFamily: "var(--font-body)",
                fontWeight: 500,
                fontSize: "12px",
                color: confColor,
                whiteSpace: "nowrap",
              }}
            >
              <span
                style={{
                  width: "6px",
                  height: "6px",
                  borderRadius: "50%",
                  background: confColor,
                }}
              />
              {error.confidence || "Low"}
            </span>

            {/* Chevron */}
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#8888aa"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              style={{
                transition: "transform 0.3s ease",
                transform: expanded ? "rotate(180deg)" : "rotate(0deg)",
                flexShrink: 0,
              }}
            >
              <polyline points="6 9 12 15 18 9" />
            </svg>
          </div>
        </button>

        {/* ── Body (collapsible) ───────────────────────────────────── */}
        <div
          style={{
            maxHeight: expanded ? "2000px" : "0",
            opacity: expanded ? 1 : 0,
            overflow: "hidden",
            transition: "max-height 0.4s ease-in-out, opacity 0.3s ease",
          }}
        >
          {/* Divider */}
          <div
            style={{
              height: "1px",
              background: "rgba(255,255,255,0.03)",
              margin: "0 20px",
            }}
          />

          <div style={{ padding: "20px" }}>
            {/* ── Section: What Went Wrong ──────────────────────────── */}
            <div style={{ marginBottom: "24px" }}>
              <h4
                style={{
                  fontFamily: "var(--font-body)",
                  fontWeight: 500,
                  fontSize: "11px",
                  textTransform: "uppercase",
                  letterSpacing: "0.1em",
                  color: "#8888aa",
                  marginBottom: "12px",
                }}
              >
                What Went Wrong
              </h4>

              {/* Error line code block */}
              <div
                style={{
                  background: "#0d0d18",
                  borderLeft: `3px solid ${catColor}`,
                  borderRadius: "8px",
                  padding: "12px 16px",
                  overflowX: "auto",
                  position: "relative",
                }}
              >
                <code
                  style={{
                    fontFamily: "var(--font-mono)",
                    fontSize: "13px",
                    color: "#e0e0ff",
                    lineHeight: 1.6,
                    whiteSpace: "pre-wrap",
                    wordBreak: "break-word",
                  }}
                >
                  {error.error_line}
                </code>
                <CopyButton text={error.error_line} />
              </div>

              {/* Explanation */}
              <p
                style={{
                  marginTop: "12px",
                  fontFamily: "var(--font-body)",
                  fontSize: "15px",
                  color: "#ccccdd",
                  lineHeight: 1.7,
                }}
              >
                {error.explanation}
              </p>
            </div>

            {/* ── Section: How To Fix It ────────────────────────────── */}
            {error.fix_steps && error.fix_steps.length > 0 && (
              <div style={{ marginBottom: "16px" }}>
                <h4
                  style={{
                    fontFamily: "var(--font-body)",
                    fontWeight: 500,
                    fontSize: "11px",
                    textTransform: "uppercase",
                    letterSpacing: "0.1em",
                    color: "#8888aa",
                    marginBottom: "12px",
                  }}
                >
                  How To Fix It
                </h4>

                {error.fix_steps.map((step, i) => (
                  <FixStep
                    key={i}
                    step={step}
                    index={i}
                    totalSteps={error.fix_steps.length}
                  />
                ))}
              </div>
            )}

            {/* ── Footer Warning ────────────────────────────────────── */}
            <div
              style={{
                borderTop: "1px solid rgba(255,255,255,0.03)",
                paddingTop: "12px",
                display: "flex",
                alignItems: "center",
                gap: "8px",
              }}
            >
              <span style={{ fontSize: "14px", lineHeight: 1 }}>⚠️</span>
              <span
                style={{
                  fontFamily: "var(--font-body)",
                  fontSize: "12px",
                  color: "#8888aa",
                }}
              >
                AI-generated suggestion — verify before applying
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
