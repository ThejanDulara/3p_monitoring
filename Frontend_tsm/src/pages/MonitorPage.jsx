import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { runMonitoring } from "../api.js";

export default function MonitorPage() {
  const nav = useNavigate();
  const token = sessionStorage.getItem("extract_token") || "";

  const [nilsonFile, setNilsonFile] = useState(null);
  const [roNumber, setRoNumber] = useState("");
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");

  async function onProcess() {
    setErr("");
    if (!token) return setErr("No extracted schedule found. Please extract schedule first.");
    if (!nilsonFile) return setErr("Please upload Nilson report.");
    if (!roNumber.trim()) return setErr("Please enter RO Number.");

    setLoading(true);
    try {
      const res = await runMonitoring({ token, nilsonFile, roNumber: roNumber.trim() });
      sessionStorage.setItem("monitor_job", res.job_id);
      sessionStorage.setItem("monitor_summary", JSON.stringify(res.summary));
      sessionStorage.setItem("monitor_unmatched", JSON.stringify(res.unmatchedPreview));
      sessionStorage.setItem("monitor_nilson", JSON.stringify(res.nilsonPreview));
      nav("/monitor/results");
    } catch (e) {
      setErr(String(e));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <h1 style={styles.title}>Monitoring</h1>

        {err ? <div style={styles.error}>{err}</div> : null}

        <div style={styles.row}>
          <div style={styles.column}>
            <label style={styles.label}>Upload Nilson Report</label>
            <input
              type="file"
              accept=".xlsx,.xls"
              onChange={(e) => setNilsonFile(e.target.files?.[0] || null)}
              style={styles.input}
            />
            <div style={styles.smallText}>
              Upload exactly as downloaded from Nilson (no changes).
            </div>
          </div>

          <div style={styles.column}>
            <label style={styles.label}>RO Number</label>
            <input
              value={roNumber}
              onChange={(e) => setRoNumber(e.target.value)}
              placeholder="Enter RO Number"
              style={styles.input}
            />
            <div style={styles.smallText}>
              Extracted schedule is reused automatically (no re-upload).
            </div>
          </div>
        </div>

        <hr style={styles.divider} />

        <div style={styles.buttonRow}>
          <button
            style={styles.primaryButton}
            onClick={onProcess}
            disabled={loading}
          >
            {loading ? "Processing..." : "Process"}
          </button>
          <button
            style={styles.backButton}
            onClick={() => nav("/extract/results")}
          >
            Go Back
          </button>
        </div>
      </div>
    </div>
  );
}

const styles = {
  container: {
    padding: '32px',
    backgroundColor: '#d5e9f7',
    minHeight: '100vh',
  },
  card: {
    maxWidth: '1400px',
    margin: '0 auto',
    backgroundColor: 'white',
    borderRadius: '12px',
    boxShadow: '0 2px 10px rgba(0, 0, 0, 0.05)',
    padding: '32px',
  },
  title: {
    color: '#2d3748',
    fontSize: '24px',
    fontWeight: '600',
    marginBottom: '24px',
    paddingBottom: '16px',
    borderBottom: '1px solid #e2e8f0',
  },
  error: {
    color: 'crimson',
    backgroundColor: '#fff5f5',
    padding: '12px 16px',
    borderRadius: '6px',
    marginBottom: '20px',
    border: '1px solid #fed7d7',
  },
  row: {
    display: 'flex',
    gap: '32px',
    marginBottom: '24px',
    flexWrap: 'wrap',
  },
  column: {
    flex: 1,
    minWidth: '260px',
  },
  label: {
    display: 'block',
    color: '#4a5568',
    fontSize: '14px',
    fontWeight: '600',
    marginBottom: '8px',
  },
  input: {
    width: '100%',
    padding: '10px 12px',
    border: '1px solid #e2e8f0',
    borderRadius: '6px',
    fontSize: '14px',
    backgroundColor: '#f7fafc',
    transition: 'border-color 0.2s ease',
    boxSizing: 'border-box',
  },
  smallText: {
    fontSize: '12px',
    color: '#718096',
    marginTop: '6px',
    fontStyle: 'italic',
  },
  divider: {
    border: 'none',
    borderTop: '1px solid #e2e8f0',
    margin: '24px 0',
  },
  buttonRow: {
    display: 'flex',
    gap: '20px',
    marginTop: '32px',
    flexWrap: 'wrap',
  },
  primaryButton: {
    padding: '12px 24px',
    backgroundColor: '#4299e1',
    color: 'white',
    border: 'none',
    borderRadius: '6px',
    fontSize: '16px',
    fontWeight: '500',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    flex: 1,
    minWidth: '120px',
  },
  backButton: {
    padding: '12px 24px',
    backgroundColor: '#edf2f7',
    color: '#2d3748',
    border: 'none',
    borderRadius: '6px',
    fontSize: '16px',
    fontWeight: '500',
    cursor: 'pointer',
    transition: 'background-color 0.2s ease',
    flex: 1,
    minWidth: '120px',
  },
};

// Note: For hover effects, you might want to use CSS classes or a CSS-in-JS library.
// Here's a CSS approach you can add to your global CSS or a style tag:
const hoverStyles = `
  button:hover {
    opacity: 0.9;
  }
  
  input:focus {
    outline: none;
    border-color: #4299e1;
    box-shadow: 0 0 0 3px rgba(66, 153, 225, 0.15);
  }
  
  button:disabled {
    background-color: #cbd5e0;
    cursor: not-allowed;
  }
  
  .primaryButton:hover:not(:disabled) {
    background-color: #3182ce;
  }
  
  .backButton:hover {
    background-color: #e2e8f0;
  }
`;