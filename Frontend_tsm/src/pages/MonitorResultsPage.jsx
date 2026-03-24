import React, { useMemo, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import DataTable from "../components/DataTable.jsx";
import { downloadMonitoring, downloadFullNilson } from "../api.js";

export default function MonitorResultsPage() {
  const nav = useNavigate();
  const currentJobId = sessionStorage.getItem("monitor_current_job") || "";
  const sessionId = sessionStorage.getItem("monitor_session_id") || "";
  
  const jobs = useMemo(() => {
    const raw = sessionStorage.getItem("monitor_jobs");
    return raw ? JSON.parse(raw) : [];
  }, []);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const summary = useMemo(() => {
    const raw = sessionStorage.getItem("monitor_summary");
    return raw ? JSON.parse(raw) : null;
  }, []);

  const unmatchedPreview = useMemo(() => {
    const raw = sessionStorage.getItem("monitor_unmatched");
    return raw ? JSON.parse(raw) : null;
  }, []);

  function proceedNextChannel() {
    nav("/extract");
  }

  function handleGoHome() {
    sessionStorage.removeItem("monitor_session_id");
    sessionStorage.removeItem("monitor_jobs");
    sessionStorage.removeItem("monitor_current_job");
    nav("/");
  }

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <h1 style={styles.title}>Monitoring Results</h1>

        {!currentJobId ? (
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
            onClick={proceedNextChannel}
          >
            Proceed to next channel
          </button>
          
          <button
            style={{ ...styles.primaryButton, backgroundColor: '#805ad5' }}
            onClick={() => downloadFullNilson(sessionId)}
            disabled={!sessionId}
          >
            Download Full Nilson CSV
          </button>
          
          <button
            style={styles.backButton}
            onClick={handleGoHome}
          >
            End Session & Go Home
          </button>
        </div>

        <div style={styles.divider} />
        
        <div style={styles.section}>
          <h3 style={styles.sectionTitle}>Session Channels</h3>
          <div style={styles.tableContainer}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
              <thead style={{ backgroundColor: '#edf2f7', color: '#4a5568', borderBottom: '2px solid #e2e8f0' }}>
                <tr>
                  <th style={{ padding: '12px 16px' }}>Channel</th>
                  <th style={{ padding: '12px 16px' }}>RO Number</th>
                  <th style={{ padding: '12px 16px' }}>Unmatched</th>
                  <th style={{ padding: '12px 16px' }}>Matched</th>
                  <th style={{ padding: '12px 16px' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {jobs.map((job, idx) => (
                  <tr key={job.jobId} style={{ borderBottom: '1px solid #e2e8f0', backgroundColor: idx % 2 === 0 ? 'white' : '#f7fafc' }}>
                    <td style={{ padding: '12px 16px' }}>{job.channel}</td>
                    <td style={{ padding: '12px 16px' }}>{job.roNumber}</td>
                    <td style={{ padding: '12px 16px' }}>{job.summary?.totalUnmatched || 0}</td>
                    <td style={{ padding: '12px 16px' }}>{job.summary?.totalMatchedInNilson || 0}</td>
                    <td style={{ padding: '12px 16px' }}>
                       <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                          <button style={{ ...styles.smallActionBtn, backgroundColor: '#4299e1' }} onClick={() => downloadMonitoring(job.jobId, "unmatched")}>Unmatched CSV</button>
                          <button style={{ ...styles.smallActionBtn, backgroundColor: '#4299e1' }} onClick={() => downloadMonitoring(job.jobId, "all")}>All Data CSV</button>
                          <button style={{ ...styles.smallActionBtn, backgroundColor: '#48bb78' }} onClick={() => downloadMonitoring(job.jobId, "nilson")}>Nilson CSV</button>
                       </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div style={styles.divider} />

        <div style={styles.section}>
          <h3 style={styles.sectionTitle}>Unmatched Spots</h3>
          <div style={styles.tableContainer}>
            <DataTable preview={unmatchedPreview} />
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
  smallActionBtn: {
    padding: '6px 12px',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    fontSize: '12px',
    fontWeight: '500',
    cursor: 'pointer',
    transition: 'opacity 0.2s ease',
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