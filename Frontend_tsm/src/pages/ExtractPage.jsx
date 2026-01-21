import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { getSheets, extractSchedule } from "../api.js";

const CHANNELS = ["Tv - Derana", "Tv - Swarnavahini", "Tv - Hiru TV"];
const ADVERTISERS = ["Seylan Bank", "Singer", "cargills" , "Lanka Lubricants Ltd"];

export default function ExtractPage() {
  const nav = useNavigate();

  const [file, setFile] = useState(null);
  const [sheets, setSheets] = useState([]);
  const [sheet, setSheet] = useState("");
  const [channel, setChannel] = useState(CHANNELS[0]);
  const [advertiser, setAdvertiser] = useState(ADVERTISERS[0]);

  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");

  async function onLoadSheets() {
    setErr("");
    if (!file) return setErr("Please choose the schedule Excel file.");
    setLoading(true);
    try {
      const data = await getSheets(file);
      setSheets(data.sheets || []);
      setSheet((data.sheets || [])[0] || "");
    } catch (e) {
      setErr(String(e));
    } finally {
      setLoading(false);
    }
  }

  async function onExtract() {
    setErr("");
    if (!file) return setErr("Please choose the schedule Excel file.");
    if (!sheet) return setErr("Please select a sheet.");
    setLoading(true);
    try {
      const res = await extractSchedule({ file, sheet, channel, advertiser });
      sessionStorage.setItem("extract_token", res.token);
      sessionStorage.setItem("extract_preview", JSON.stringify(res.preview));
      nav("/extract/results");
    } catch (e) {
      setErr(String(e));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <h1 style={styles.title}>Extract Schedule</h1>

        {err ? <div style={styles.error}>{err}</div> : null}

        <div style={styles.row}>
          <div style={styles.column}>
            <label style={styles.label}>Upload Schedule Excel</label>
            <input
              type="file"
              accept=".xlsx,.xls"
              onChange={(e) => setFile(e.target.files?.[0] || null)}
              style={styles.input}
            />
            <div style={styles.smallText}>
              We will read the grid and expand spot counts into row-level spots.
            </div>
          </div>

          <div style={styles.column}>
            <label style={styles.label}>Channel</label>
            <select
              value={channel}
              onChange={(e) => setChannel(e.target.value)}
              style={styles.select}
            >
              {CHANNELS.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>

            <div style={styles.spacer} />

            <label style={styles.label}>Advertiser</label>
            <select
              value={advertiser}
              onChange={(e) => setAdvertiser(e.target.value)}
              style={styles.select}
            >
              {ADVERTISERS.map((a) => (
                <option key={a} value={a}>{a}</option>
              ))}
            </select>
          </div>
        </div>

        <hr style={styles.divider} />

        <div style={styles.row}>
          <button
            style={styles.button}
            onClick={onLoadSheets}
            disabled={loading}
          >
            {loading ? "Loading..." : "Load Sheets"}
          </button>

          <div style={styles.column}>
            <label style={styles.label}>Select Sheet</label>
            <select
              value={sheet}
              onChange={(e) => setSheet(e.target.value)}
              disabled={!sheets.length}
              style={styles.select}
            >
              {sheets.map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>
        </div>

        <div style={styles.buttonRow}>
          <button
            style={styles.primaryButton}
            onClick={onExtract}
            disabled={loading}
          >
            {loading ? "Processing..." : "Extract"}
          </button>
          <button
            style={styles.backButton}
            onClick={() => nav("/start")}
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
    ':focus': {
      outline: 'none',
      borderColor: '#4299e1',
      boxShadow: '0 0 0 3px rgba(66, 153, 225, 0.15)',
    },
  },
  select: {
    width: '100%',
    padding: '10px 12px',
    border: '1px solid #e2e8f0',
    borderRadius: '6px',
    fontSize: '14px',
    backgroundColor: '#f7fafc',
    color: '#4a5568',
    cursor: 'pointer',
    transition: 'border-color 0.2s ease',
    ':focus': {
      outline: 'none',
      borderColor: '#4299e1',
      boxShadow: '0 0 0 3px rgba(66, 153, 225, 0.15)',
    },
    ':disabled': {
      backgroundColor: '#edf2f7',
      cursor: 'not-allowed',
      color: '#a0aec0',
    },
  },
  smallText: {
    fontSize: '12px',
    color: '#718096',
    marginTop: '6px',
    fontStyle: 'italic',
  },
  spacer: {
    height: '10px',
  },
  divider: {
    border: 'none',
    borderTop: '1px solid #e2e8f0',
    margin: '24px 0',
  },
  button: {
    padding: '10px 20px',
    backgroundColor: '#edf2f7',
    color: '#2d3748',
    border: 'none',
    borderRadius: '6px',
    fontSize: '14px',
    fontWeight: '500',
    cursor: 'pointer',
    transition: 'background-color 0.2s ease',
    alignSelf: 'flex-end',
    height: '42px',
    ':hover': {
      backgroundColor: '#e2e8f0',
    },
    ':disabled': {
      backgroundColor: '#cbd5e0',
      cursor: 'not-allowed',
      color: '#a0aec0',
    },
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
    ':hover': {
      backgroundColor: '#3182ce',
    },
    ':disabled': {
      backgroundColor: '#cbd5e0',
      cursor: 'not-allowed',
    },
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
    ':hover': {
      backgroundColor: '#e2e8f0',
    },
  },
};

// Note: For pseudo-classes like :hover, :focus, etc. in inline styles,
// you would typically use CSS-in-JS libraries or separate CSS.
// The above styles object follows the pattern but would need adaptation
// for actual hover effects in production.