import { useMemo } from "react";

const API = (import.meta.env.VITE_API_URL || "http://localhost:5000").trim();

export default function ReportDownload({ issueType, schoolName, from, to }) {
  const base = useMemo(() => API, []);

  function download(format) {
    const params = new URLSearchParams();

    if (issueType) params.set("issueType", issueType);
    if (schoolName) params.set("schoolName", schoolName);

    // from/to should be "YYYY-MM-DD"
    if (from) params.set("from", from);
    if (to) params.set("to", to);

    const qs = params.toString();
    const url = `${base}/api/reports/tickets.${format}${qs ? `?${qs}` : ""}`;

    // ✅ debug (remove later)
    console.log("Downloading:", url);

    window.open(url, "_blank", "noopener,noreferrer");
  }

  return (
    <div className="reportBox">
      <div className="reportTitle">Download Report</div>
      <div className="reportHint">Download by School / Issue / Date range.</div>

      <div className="reportActions">
        <button className="btn secondary" type="button" onClick={() => download("csv")}>
          Download CSV
        </button>

        <button className="btn" type="button" onClick={() => download("xlsx")}>
          Download Excel
        </button>

        <button className="btn secondary" type="button" onClick={() => download("pdf")}>
          Download PDF
        </button>
      </div>
    </div>
  );
}