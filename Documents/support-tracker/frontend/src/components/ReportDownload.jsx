const API = import.meta.env.VITE_API_URL;

export default function ReportDownload({ issueTypes, issueType }) {
  function download(format) {
    const params = new URLSearchParams();
    if (issueType) params.set("issueType", issueType);

    const url = `${API}/api/reports/${format}?${params.toString()}`;
    window.open(url, "_blank");
  }

  return (
    <div className="reportBox">
      <div className="reportTitle">Download Report</div>
      <div className="reportHint">
        Download tickets for selected Issue Type as CSV / Excel / PDF.
      </div>

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