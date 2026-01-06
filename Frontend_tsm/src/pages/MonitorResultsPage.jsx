import React, { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import DataTable from "../components/DataTable.jsx";
import { downloadMonitoring } from "../api.js";

export default function MonitorResultsPage() {
  const nav = useNavigate();
  const jobId = sessionStorage.getItem("monitor_job") || "";

  const summary = useMemo(() => {
    const raw = sessionStorage.getItem("monitor_summary");
    return raw ? JSON.parse(raw) : null;
  }, []);

  const unmatchedPreview = useMemo(() => {
    const raw = sessionStorage.getItem("monitor_unmatched");
    return raw ? JSON.parse(raw) : null;
  }, []);

  const nilsonPreview = useMemo(() => {
    const raw = sessionStorage.getItem("monitor_nilson");
    return raw ? JSON.parse(raw) : null;
  }, []);

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <h1 style={styles.title}>Monitoring Results</h1>

        {!jobId ? (
          <div style={styles.error}>
            No monitoring job found. Please process again.
          </div>
        ) : null}

        {summary ? (
          <div style={styles.statsContainer}>
            <div style={styles.statCard}>
              <div style={styles.statLabel}>Total Spots in Schedule</div>
              <div style={styles.statValue}>{summary.totalScheduleSpots}</div>
            </div>
            <div style={styles.statCard}>
              <div style={styles.statLabel}>Total Unmatched Spots</div>
              <div style={styles.statValue}>{summary.totalUnmatched}</div>
            </div>
            <div style={styles.statCard}>
              <div style={styles.statLabel}>Matched Spots in Nilson</div>
              <div style={styles.statValue}>{summary.totalMatchedInNilson}</div>
            </div>
          </div>
        ) : null}

        <div style={styles.buttonRow}>
          <button
            style={styles.backButton}
            onClick={() => nav("/monitor")}
          >
            Go Back
          </button>
          <button
            style={styles.primaryButton}
            onClick={() => downloadMonitoring(jobId, "unmatched")}
            disabled={!jobId}
          >
            Download Unmatched CSV
          </button>
          <button
            style={styles.secondaryButton}
            onClick={() => downloadMonitoring(jobId, "nilson")}
            disabled={!jobId}
          >
            Download Nilson CSV
          </button>
          <button
              style={styles.backButton}
              onClick={() => nav("/")}
            >
              Go to Home
            </button>
        </div>

        <div style={styles.divider} />

        <div style={styles.section}>
          <h3 style={styles.sectionTitle}>Unmatched Spots</h3>
          <div style={styles.tableContainer}>
            <DataTable preview={unmatchedPreview} />
          </div>
        </div>

        <div style={styles.divider} />

        <div style={styles.section}>
          <h3 style={styles.sectionTitle}>Nilson Report with RO Number </h3>
          <div style={styles.tableContainer}>
            <DataTable preview={nilsonPreview} />
          </div>
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
  statsContainer: {
    display: 'flex',
    gap: '20px',
    marginBottom: '32px',
    flexWrap: 'wrap',
  },
  statCard: {
    flex: 1,
    backgroundColor: '#f7fafc',
    borderRadius: '8px',
    padding: '20px',
    border: '1px solid #e2e8f0',
    minWidth: '200px',
  },
  statLabel: {
    fontSize: '14px',
    color: '#718096',
    fontWeight: '500',
    marginBottom: '8px',
  },
  statValue: {
    fontSize: '24px',
    fontWeight: '700',
    color: '#2d3748',
  },
  buttonRow: {
    display: 'flex',
    gap: '20px',
    marginBottom: '24px',
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
    minWidth: '180px',
  },
  secondaryButton: {
    padding: '12px 24px',
    backgroundColor: '#48bb78',
    color: 'white',
    border: 'none',
    borderRadius: '6px',
    fontSize: '16px',
    fontWeight: '500',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    flex: 1,
    minWidth: '180px',
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
  divider: {
    border: 'none',
    borderTop: '1px solid #e2e8f0',
    margin: '32px 0',
  },
  section: {
    marginBottom: '32px',
  },
  sectionTitle: {
    color: '#2d3748',
    fontSize: '18px',
    fontWeight: '600',
    marginBottom: '16px',
  },
  tableContainer: {
    border: '1px solid #e2e8f0',
    borderRadius: '6px',
    overflow: 'hidden',
  },
};

// Add this CSS to your global styles or in a style tag for hover effects
// You can add this to your main CSS file
const hoverStyles = `
  .primaryButton:hover:not(:disabled) {
    background-color: #3182ce;
  }

  .secondaryButton:hover:not(:disabled) {
    background-color: #38a169;
  }

  .backButton:hover {
    background-color: #e2e8f0;
  }

  button:disabled {
    background-color: #cbd5e0;
    cursor: not-allowed;
    opacity: 0.6;
  }

  button:hover:disabled {
    background-color: #cbd5e0;
  }
`;