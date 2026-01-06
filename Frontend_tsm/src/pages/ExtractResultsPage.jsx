import React, { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import DataTable from "../components/DataTable.jsx";
import { downloadExtracted } from "../api.js";

export default function ExtractResultsPage() {
  const nav = useNavigate();
  const token = sessionStorage.getItem("extract_token") || "";

  const preview = useMemo(() => {
    const raw = sessionStorage.getItem("extract_preview");
    return raw ? JSON.parse(raw) : null;
  }, []);

  // --- STYLES (OPT-like results page) ---
  const styles = {
    page: {
      minHeight: "100vh",
      backgroundColor: "#d5e9f7",
      padding: "32px",
      display: "flex",
      justifyContent: "center",
      fontFamily: "sans-serif"
    },
    container: {
      width: "100%",
      maxWidth: "1400px"
    },
    card: {
      backgroundColor: "white",
      borderRadius: "12px",
      padding: "24px",
      border: "1px solid #e2e8f0",
      boxShadow: "0 6px 18px rgba(0,0,0,0.06)"
    },
    title: {
      color: "#2d3748",
      fontSize: "24px",
      fontWeight: "600",
      marginBottom: "24px",
      marginTop: 0
    },
    buttonRow: {
      display: "flex",
      gap: "12px",
      flexWrap: "wrap",
      justifyContent: "flex-start",
      marginTop: "32px"
    },
    btnBack: {
      padding: "12px 24px",
      backgroundColor: "#edf2f7",
      color: "#2d3748",
      border: "1px solid #cbd5e0",
      borderRadius: "6px",
      fontSize: "16px",
      fontWeight: "500",
      cursor: "pointer"
    },
    btnDownload: {
      padding: "12px 24px",
      backgroundColor: "#38a169",
      color: "white",
      border: "none",
      borderRadius: "6px",
      fontSize: "16px",
      fontWeight: "500",
      cursor: "pointer"
    },
    btnPrimary: {
      padding: "12px 24px",
      backgroundColor: "#4299e1",
      color: "white",
      border: "none",
      borderRadius: "6px",
      fontSize: "16px",
      fontWeight: "500",
      cursor: "pointer"
    },
    errorText: {
      color: "crimson",
      marginBottom: "16px",
      fontWeight: "500"
    }
  };

  return (
    <div style={styles.page}>
      <div style={styles.container}>
        <div style={styles.card}>
          <h1 style={styles.title}>
            Extracted Schedule (Row-level Spots)
          </h1>

          {!token && (
            <div style={styles.errorText}>
              No extracted data found. Go back and extract again.
            </div>
          )}

          {/* TABLE */}
          <div style={{ marginTop: "16px" }}>
            <DataTable preview={preview} />
          </div>

          {/* ACTION BUTTONS – BOTTOM */}
          <div style={styles.buttonRow}>
            <button
              style={styles.btnBack}
              onClick={() => nav("/extract")}
            >
              Go Back
            </button>

            <button
              style={{ ...styles.btnDownload, opacity: !token ? 0.6 : 1 }}
              onClick={() => downloadExtracted(token)}
              disabled={!token}
            >
              Download Extracted Excel
            </button>

            <button
              style={{ ...styles.btnPrimary, opacity: !token ? 0.6 : 1 }}
              onClick={() => nav("/monitor")}
              disabled={!token}
            >
              Proceed to Monitoring
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
