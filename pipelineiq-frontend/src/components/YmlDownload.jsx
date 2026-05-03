import { useState } from "react";
import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8001';

/* ── Syntax Highlighter (line-by-line, no library) ──────────────────────── */
function highlightYaml(text) {
  if (!text) return null;
  const keyPattern = /^(\s*)([\w-]+)(:)(.*)/;
  return text.split("\n").map((line, i) => {
    /* Comments */
    if (/^\s*#/.test(line)) {
      return (
        <span key={i} style={{ color: "#4a4a6a" }}>
          {line}
          {"\n"}
        </span>
      );
    }
    /* Key: value pairs */
    const kv = line.match(keyPattern);
    if (kv) {
      const [, indent, key, colon, value] = kv;
      /* Detect value type */
      let valColor = "#00ff88"; /* strings default green */
      const trimmed = value.trim();
      if (/^\d+$/.test(trimmed)) valColor = "#ffa502"; /* numbers orange */
      if (trimmed === "true" || trimmed === "false") valColor = "#ffa502";
      if (trimmed === "" || trimmed.startsWith("|") || trimmed.startsWith(">"))
        valColor = "#e0e0ff";
      return (
        <span key={i}>
          {indent}
          <span style={{ color: "#00d4ff" }}>{key}</span>
          <span style={{ color: "#555570" }}>{colon}</span>
          <span style={{ color: valColor }}>{value}</span>
          {"\n"}
        </span>
      );
    }
    /* List items */
    if (/^\s*-\s/.test(line)) {
      return (
        <span key={i} style={{ color: "#ffa502" }}>
          {line}
          {"\n"}
        </span>
      );
    }
    /* Default */
    return (
      <span key={i} style={{ color: "#8888aa" }}>
        {line}
        {"\n"}
      </span>
    );
  });
}

/* ── Loading Skeleton ───────────────────────────────────────────────────── */
function Skeleton() {
  const widths = [85, 60, 90, 45, 70, 55, 80, 40];
  return (
    <div style={{ padding: "20px" }}>
      {widths.map((w, i) => (
        <div
          key={i}
          className="animate-shimmer"
          style={{
            height: "14px",
            borderRadius: "4px",
            marginBottom: "10px",
            width: `${w}%`,
          }}
        />
      ))}
    </div>
  );
}

export default function YmlDownload({ errors }) {
  const [yml, setYml] = useState("");
  const [loading, setLoading] = useState(false);
  const [generated, setGenerated] = useState(false);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState("");

  const handleGenerate = async () => {
    if (!errors || errors.length === 0) return;
    setLoading(true);
    setError("");
    try {
      const { data } = await axios.post(`${API_URL}/generate-yml`, { errors });
      setYml(data.yml_content || "");
      setGenerated(true);
    } catch (err) {
      setError(err.response?.data?.detail || "Failed to generate YAML");
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = () => {
    const blob = new Blob([yml], { type: "text/yaml" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "fixed-pipeline.yml";
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(yml);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      /* silent */
    }
  };

  return (
    <div
      style={{
        background: "#13131f",
        border: "1px solid rgba(255,255,255,0.063)",
        borderRadius: "16px",
        padding: "24px",
        marginTop: "24px",
        animation: "fade-in-up 0.5s ease-out both",
        animationDelay: "200ms",
      }}
    >
      {/* ── Header ─────────────────────────────────────────────────── */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          flexWrap: "wrap",
          gap: "10px",
          marginBottom: "20px",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <span style={{ fontSize: "18px" }}>📄</span>
          <h3
            style={{
              fontFamily: "var(--font-display)",
              fontWeight: 700,
              fontSize: "18px",
              color: "#fff",
              margin: 0,
            }}
          >
            Generated Fix File
          </h3>
        </div>

        <span
          style={{
            padding: "4px 10px",
            borderRadius: "999px",
            background: "rgba(79,142,255,0.12)",
            color: "#4f8eff",
            fontFamily: "var(--font-body)",
            fontWeight: 500,
            fontSize: "11px",
          }}
        >
          GitHub Actions
        </span>
      </div>

      {/* ── Generate Button (before generation) ────────────────────── */}
      {!generated && !loading && !error && (
        <button
          onClick={handleGenerate}
          style={{
            width: "100%",
            height: "52px",
            borderRadius: "12px",
            border: "none",
            cursor: "pointer",
            background: "linear-gradient(135deg, #4f8eff, #00d4ff)",
            color: "#fff",
            fontSize: "15px",
            fontWeight: 600,
            fontFamily: "var(--font-body)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "8px",
            boxShadow: "0 4px 20px rgba(79,142,255,0.2)",
            transition: "all 0.2s ease",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.filter = "brightness(1.1)";
            e.currentTarget.style.boxShadow =
              "0 4px 28px rgba(79,142,255,0.35)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.filter = "brightness(1)";
            e.currentTarget.style.boxShadow =
              "0 4px 20px rgba(79,142,255,0.2)";
          }}
        >
          ⚡ Generate Fixed .yml File
        </button>
      )}

      {/* ── Loading Skeleton ───────────────────────────────────────── */}
      {loading && (
        <div
          style={{
            background: "#0a0a0f",
            border: "1px solid rgba(255,255,255,0.063)",
            borderRadius: "12px",
            overflow: "hidden",
          }}
        >
          <Skeleton />
          <div
            style={{
              textAlign: "center",
              padding: "0 0 16px",
              fontFamily: "var(--font-body)",
              fontSize: "13px",
              color: "#8888aa",
            }}
          >
            Generating with Gemini...
          </div>
        </div>
      )}

      {/* ── Error ──────────────────────────────────────────────────── */}
      {error && (
        <div
          style={{
            padding: "12px 16px",
            borderRadius: "8px",
            background: "rgba(255,71,87,0.08)",
            border: "1px solid rgba(255,71,87,0.2)",
            color: "#ff4757",
            fontFamily: "var(--font-body)",
            fontSize: "13px",
          }}
        >
          {error}
        </div>
      )}

      {/* ── YML Code Block (after generation) ──────────────────────── */}
      {generated && yml && (
        <>
          <div
            style={{
              background: "#0a0a0f",
              border: "1px solid rgba(255,255,255,0.063)",
              borderRadius: "12px",
              padding: "20px",
              maxHeight: "400px",
              overflowY: "auto",
              overflowX: "auto",
            }}
          >
            <pre
              style={{
                margin: 0,
                fontFamily: "var(--font-mono)",
                fontSize: "13px",
                lineHeight: 1.65,
                whiteSpace: "pre",
              }}
            >
              {highlightYaml(yml)}
            </pre>
          </div>

          {/* ── Action Buttons ─────────────────────────────────────── */}
          <div
            style={{
              display: "flex",
              gap: "12px",
              marginTop: "16px",
              flexWrap: "wrap",
            }}
          >
            {/* Download */}
            <button
              onClick={handleDownload}
              style={{
                flex: "1 1 200px",
                height: "44px",
                borderRadius: "10px",
                border: "none",
                cursor: "pointer",
                background: "linear-gradient(135deg, #4f8eff, #00d4ff)",
                color: "#fff",
                fontSize: "13px",
                fontWeight: 600,
                fontFamily: "var(--font-body)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "6px",
                transition: "all 0.2s ease",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.filter = "brightness(1.1)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.filter = "brightness(1)";
              }}
            >
              ⬇ Download fixed-pipeline.yml
            </button>

            {/* Copy */}
            <button
              onClick={handleCopy}
              style={{
                flex: "1 1 200px",
                height: "44px",
                borderRadius: "10px",
                border: "1px solid rgba(255,255,255,0.12)",
                cursor: "pointer",
                background: "transparent",
                color: copied ? "#00ff88" : "#8888aa",
                fontSize: "13px",
                fontWeight: 500,
                fontFamily: "var(--font-body)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "6px",
                transition: "all 0.2s ease",
              }}
              onMouseEnter={(e) => {
                if (!copied) {
                  e.currentTarget.style.borderColor = "#4f8eff";
                  e.currentTarget.style.color = "#4f8eff";
                }
              }}
              onMouseLeave={(e) => {
                if (!copied) {
                  e.currentTarget.style.borderColor = "rgba(255,255,255,0.12)";
                  e.currentTarget.style.color = "#8888aa";
                }
              }}
            >
              {copied ? "✓ Copied!" : "⎘ Copy to Clipboard"}
            </button>
          </div>

          {/* ── Warning Banner ─────────────────────────────────────── */}
          <div
            style={{
              marginTop: "16px",
              background: "rgba(255,165,2,0.06)",
              borderLeft: "3px solid #ffa502",
              borderRadius: "8px",
              padding: "12px 16px",
              display: "flex",
              alignItems: "flex-start",
              gap: "8px",
            }}
          >
            <span style={{ fontSize: "14px", lineHeight: 1, marginTop: "1px" }}>
              ⚠️
            </span>
            <span
              style={{
                fontFamily: "var(--font-body)",
                fontSize: "14px",
                color: "#ffa502",
                lineHeight: 1.5,
              }}
            >
              Review this file carefully before committing to your repository
            </span>
          </div>
        </>
      )}
    </div>
  );
}
