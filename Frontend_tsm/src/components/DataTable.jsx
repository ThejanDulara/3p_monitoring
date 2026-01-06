import React from "react";

export default function DataTable({ preview }) {
  if (!preview) return null;

  const { columns = [], rows = [], totalRows = 0 } = preview;

  // Hide internal columns
  const hiddenColumns = ["Date_dt"];

  const visibleColumns = columns.filter(
    (c) => !hiddenColumns.includes(c)
  );

  // Formatter
  const format2 = (v) => {
    if (v === null || v === undefined || v === "") return "";
    const n = Number(v);
    return isNaN(n) ? v : n.toFixed(2);
  };

  const twoDecimalColumns = ["Rate Card Rate", "Negotiated Rate"];

  return (
    <div style={{ overflowX: "auto" }}>
      <div className="small" style={{ marginBottom: 8 }}>
        Showing {rows.length} rows (Total: {totalRows})
      </div>

      <table
        style={{
          width: "100%",
          borderCollapse: "collapse",
          background: "#fff"
        }}
      >
        <thead>
          <tr>
            {/* 🔢 Row number header */}
            <th
              style={{
                textAlign: "right",
                padding: 8,
                borderBottom: "1px solid #eee",
                whiteSpace: "nowrap",
                width: 50
              }}
            >
              #
            </th>

            {visibleColumns.map((c) => (
              <th
                key={c}
                style={{
                  textAlign: "left",
                  padding: 8,
                  borderBottom: "1px solid #eee",
                  whiteSpace: "nowrap"
                }}
              >
                {c}
              </th>
            ))}
          </tr>
        </thead>

        <tbody>
          {rows.map((r, idx) => (
            <tr key={idx}>
              {/* 🔢 Row number cell */}
              <td
                style={{
                  textAlign: "right",
                  padding: 8,
                  borderBottom: "1px solid #f2f2f2",
                  color: "#718096",
                  fontSize: "13px"
                }}
              >
                {idx + 1}
              </td>

              {visibleColumns.map((c) => (
                <td
                  key={c}
                  style={{
                    padding: 8,
                    borderBottom: "1px solid #f2f2f2",
                    whiteSpace: "nowrap",
                    textAlign: twoDecimalColumns.includes(c)
                      ? "right"
                      : "left"
                  }}
                >
                  {twoDecimalColumns.includes(c)
                    ? format2(r[c])
                    : String(r[c] ?? "")}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
