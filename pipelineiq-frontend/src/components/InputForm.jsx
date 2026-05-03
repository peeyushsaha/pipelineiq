import { useState, useEffect } from "react";
import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8001';
const MAX_CHARS = 10000;

const SAMPLES = [
  {
    label: "⚡ Dep Conflict",
    text: "npm ERR! code ERESOLVE\nnpm ERR! ERESOLVE unable to resolve dependency tree\nnpm ERR! While resolving: my-app@1.0.0\nnpm ERR! Found: react@18.2.0\nnpm ERR! peer react@\"^16.8.0\" from react-router-dom@5.3.0\nnpm ERR! Could not resolve dependency:\nnpm ERR! Conflicting peer dependency: react@16.14.0\nnpm ERR! Fix the upstream dependency conflict\nProcess exited with code 1",
  },
  {
    label: "⚡ Build Error",
    text: "Error: Cannot find module './components/App'\nRequire stack:\n- /app/src/index.js\nModule not found: Error: Can't resolve './utils/helpers' in '/app/src'\nwebpack compiled with 2 errors\nProcess exited with code 1\nBuild failed",
  },
  {
    label: "⚡ Test Fail",
    text: "FAIL src/App.test.js\n● Test suite failed to run\nJest encountered an unexpected token\nSyntaxError: Cannot use import statement outside a module\n\nTest Suites: 1 failed, 1 total\nTests:       0 total\nProcess exited with exit code 1",
  },
];

const GithubIcon = () => (
  <svg
    width="18"
    height="18"
    viewBox="0 0 24 24"
    fill="currentColor"
    style={{ flexShrink: 0, color: "var(--text-muted)" }}
  >
    <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" />
  </svg>
);

export default function InputForm({ onResults, onLoading, onError }) {
  const [activeTab, setActiveTab] = useState("raw_log");
  const [logText, setLogText] = useState("");
  const [repoUrl, setRepoUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [heroVisible, setHeroVisible] = useState(false);
  const [urlError, setUrlError] = useState("");

  const charCount = logText.length;
  const overLimit = charCount > MAX_CHARS;
  const charPercent = Math.min((charCount / MAX_CHARS) * 100, 100);

  useEffect(() => {
    const t = setTimeout(() => setHeroVisible(true), 100);
    return () => clearTimeout(t);
  }, []);

  const validateUrl = (url) => {
    if (!url) {
      setUrlError("");
      return true;
    }
    if (!/^https?:\/\/(www\.)?github\.com\/[^/]+\/[^/]+/.test(url)) {
      setUrlError("Please enter a valid GitHub repository URL");
      return false;
    }
    setUrlError("");
    return true;
  };

  const handleSubmit = async () => {
    const content =
      activeTab === "raw_log"
        ? logText.trim().slice(0, MAX_CHARS)
        : repoUrl.trim();

    if (!content) {
      onError?.("Please provide a log or repository URL.");
      return;
    }
    if (activeTab === "repo_url" && !validateUrl(content)) return;

    setLoading(true);
    onLoading?.(true);
    onError?.(null);

    try {
      const { data } = await axios.post(`${API_URL}/analyze`, {
        input_type: activeTab,
        content,
      });
      onResults?.(data);
    } catch (err) {
      const msg =
        err.response?.data?.detail ||
        err.message ||
        "Something went wrong. Please try again.";
      onError?.(msg);
    } finally {
      setLoading(false);
      onLoading?.(false);
    }
  };

  return (
    <div style={{ width: "100%" }}>
      {/* ── Hero ──────────────────────────────────────────────────── */}
      <div
        style={{
          textAlign: "center",
          marginBottom: "48px",
          position: "relative",
        }}
      >
        {/* Background orb */}
        <div
          style={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            width: "400px",
            height: "400px",
            pointerEvents: "none",
            zIndex: -1,
            background:
              "radial-gradient(circle, rgba(79,142,255,0.08) 0%, transparent 70%)",
            animation: "float-orb 8s ease-in-out infinite",
            filter: "blur(120px)",
          }}
        />

        <h1
          style={{
            fontFamily: "var(--font-display)",
            fontWeight: 800,
            fontSize: "clamp(2rem, 5vw, 3.5rem)",
            lineHeight: 1.1,
            letterSpacing: "-0.03em",
            color: "#fff",
            margin: "0 0 20px 0",
            opacity: heroVisible ? 1 : 0,
            transform: heroVisible ? "translateY(0)" : "translateY(20px)",
            transition: "all 0.7s ease-out",
          }}
        >
          Debug Pipelines
          <br />
          <span
            style={{
              background: "linear-gradient(135deg, #4f8eff, #00d4ff)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
            }}
          >
            Instantly
          </span>
        </h1>

        <p
          style={{
            color: "var(--text-secondary)",
            fontSize: "clamp(0.9rem, 1.8vw, 1.1rem)",
            lineHeight: 1.7,
            maxWidth: "480px",
            margin: "0 auto",
            opacity: heroVisible ? 1 : 0,
            transform: heroVisible ? "translateY(0)" : "translateY(16px)",
            transition: "all 0.7s ease-out 0.2s",
          }}
        >
          Drop your CI/CD logs. Get root cause analysis and fix suggestions
          powered by AI.
        </p>
      </div>

      {/* ── Form Card ─────────────────────────────────────────────── */}
      <div
        style={{
          background: "var(--bg-card)",
          border: "1px solid var(--border-subtle)",
          borderRadius: "16px",
          padding: "28px",
          opacity: heroVisible ? 1 : 0,
          transform: heroVisible ? "translateY(0)" : "translateY(20px)",
          transition: "all 0.7s ease-out 0.3s",
        }}
      >
        {/* ── Tab Switcher ────────────────────────────────────────── */}
        <div
          style={{
            display: "inline-flex",
            background: "var(--bg-input)",
            border: "1px solid var(--border-subtle)",
            borderRadius: "12px",
            padding: "4px",
            marginBottom: "24px",
          }}
        >
          {[
            { key: "raw_log", label: "Paste Log" },
            { key: "repo_url", label: "GitHub URL" },
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => {
                setActiveTab(tab.key);
                setUrlError("");
              }}
              style={{
                padding: "8px 20px",
                fontSize: "13px",
                fontWeight: activeTab === tab.key ? 600 : 400,
                fontFamily: "var(--font-body)",
                borderRadius: "8px",
                border: "none",
                cursor: "pointer",
                transition: "all 0.2s ease",
                background:
                  activeTab === tab.key
                    ? "linear-gradient(135deg, #4f8eff, #00d4ff)"
                    : "transparent",
                color: activeTab === tab.key ? "#fff" : "var(--text-secondary)",
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* ── Tab Content ─────────────────────────────────────────── */}
        {activeTab === "raw_log" ? (
          <div>
            {/* Sample buttons */}
            <div
              style={{
                display: "flex",
                gap: "8px",
                flexWrap: "wrap",
                marginBottom: "12px",
              }}
            >
              {SAMPLES.map((s, i) => (
                <button
                  key={i}
                  onClick={() => setLogText(s.text)}
                  style={{
                    padding: "6px 14px",
                    fontSize: "12px",
                    fontFamily: "var(--font-body)",
                    borderRadius: "999px",
                    border: "1px solid var(--border-subtle)",
                    background: "transparent",
                    color: "var(--text-secondary)",
                    cursor: "pointer",
                    transition: "all 0.2s ease",
                  }}
                  onMouseEnter={(e) => {
                    e.target.style.background =
                      "linear-gradient(135deg, rgba(79,142,255,0.15), rgba(0,212,255,0.1))";
                    e.target.style.borderColor = "rgba(79,142,255,0.4)";
                    e.target.style.color = "#fff";
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.background = "transparent";
                    e.target.style.borderColor = "var(--border-subtle)";
                    e.target.style.color = "var(--text-secondary)";
                  }}
                >
                  {s.label}
                </button>
              ))}
            </div>

            {/* Textarea */}
            <textarea
              value={logText}
              onChange={(e) => setLogText(e.target.value)}
              placeholder="Paste your CI/CD log here..."
              spellCheck={false}
              style={{
                width: "100%",
                minHeight: "200px",
                padding: "16px",
                background: "var(--bg-input)",
                border: "1px solid var(--border-subtle)",
                borderRadius: "8px",
                color: "var(--text-primary)",
                fontFamily: "var(--font-mono)",
                fontSize: "13px",
                lineHeight: 1.7,
                resize: "vertical",
                outline: "none",
                caretColor: "var(--accent)",
                transition: "border-color 0.2s, box-shadow 0.2s",
              }}
              onFocus={(e) => {
                e.target.style.borderColor = "rgba(79,142,255,0.4)";
                e.target.style.boxShadow = "0 0 0 2px rgba(79,142,255,0.15)";
              }}
              onBlur={(e) => {
                e.target.style.borderColor = "var(--border-subtle)";
                e.target.style.boxShadow = "none";
              }}
            />

            {/* Character counter */}
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginTop: "8px",
                fontSize: "11px",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                <span
                  style={{
                    color: overLimit ? "var(--error)" : "var(--text-muted)",
                    fontFamily: "var(--font-mono)",
                  }}
                >
                  {charCount.toLocaleString()} / {MAX_CHARS.toLocaleString()}
                </span>
                <div
                  style={{
                    width: "80px",
                    height: "3px",
                    borderRadius: "999px",
                    background: "var(--bg-input)",
                    overflow: "hidden",
                  }}
                >
                  <div
                    style={{
                      height: "100%",
                      borderRadius: "999px",
                      width: `${charPercent}%`,
                      background: overLimit
                        ? "var(--error)"
                        : "linear-gradient(90deg, var(--accent), var(--accent-cyan))",
                      transition: "width 0.3s ease",
                    }}
                  />
                </div>
              </div>
              {overLimit && (
                <span
                  style={{
                    color: "var(--error)",
                    fontFamily: "var(--font-body)",
                    fontSize: "11px",
                  }}
                >
                  ⚠ Will be trimmed to 10,000 chars
                </span>
              )}
            </div>
          </div>
        ) : (
          <div>
            {/* URL Input */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "12px",
                padding: "14px 16px",
                background: "var(--bg-input)",
                border: `1px solid ${urlError ? "var(--error)" : "var(--border-subtle)"}`,
                borderRadius: "8px",
                transition: "border-color 0.2s",
              }}
            >
              <GithubIcon />
              <input
                type="url"
                value={repoUrl}
                onChange={(e) => {
                  setRepoUrl(e.target.value);
                  if (e.target.value) validateUrl(e.target.value);
                }}
                placeholder="https://github.com/owner/repo"
                style={{
                  flex: 1,
                  background: "transparent",
                  border: "none",
                  outline: "none",
                  color: "var(--text-primary)",
                  fontFamily: "var(--font-body)",
                  fontSize: "14px",
                }}
              />
            </div>
            <p
              style={{
                marginTop: "8px",
                fontSize: "12px",
                color: urlError ? "var(--error)" : "var(--text-muted)",
                fontFamily: "var(--font-body)",
              }}
            >
              {urlError || "Fetches latest failed workflow run automatically"}
            </p>
          </div>
        )}

        {/* ── Analyze Button ──────────────────────────────────────── */}
        <button
          onClick={handleSubmit}
          disabled={loading}
          style={{
            width: "100%",
            height: "52px",
            marginTop: "24px",
            borderRadius: "12px",
            border: "none",
            cursor: loading ? "not-allowed" : "pointer",
            background: loading
              ? "linear-gradient(270deg, #4f8eff, #00d4ff, #4f8eff)"
              : "linear-gradient(135deg, #4f8eff, #00d4ff)",
            backgroundSize: loading ? "400% 100%" : "100% 100%",
            animation: loading ? "gradient-sweep 2s ease infinite" : "none",
            color: "#fff",
            fontSize: "15px",
            fontWeight: 600,
            fontFamily: "var(--font-body)",
            boxShadow: loading ? "none" : "0 4px 20px rgba(79,142,255,0.25)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "10px",
            opacity: loading ? 0.7 : 1,
            transition: "all 0.2s ease",
          }}
          onMouseEnter={(e) => {
            if (!loading) {
              e.currentTarget.style.filter = "brightness(1.1)";
              e.currentTarget.style.boxShadow =
                "0 4px 30px rgba(79,142,255,0.35)";
            }
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.filter = "brightness(1)";
            e.currentTarget.style.boxShadow = loading
              ? "none"
              : "0 4px 20px rgba(79,142,255,0.25)";
          }}
        >
          {loading ? (
            <>
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                style={{ animation: "spin 1s linear infinite" }}
              >
                <circle
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="white"
                  strokeWidth="3"
                  opacity="0.25"
                />
                <path
                  d="M4 12a8 8 0 018-8"
                  stroke="white"
                  strokeWidth="3"
                  strokeLinecap="round"
                />
              </svg>
              Analyzing...
            </>
          ) : (
            "Analyze Pipeline"
          )}
        </button>
      </div>
    </div>
  );
}
