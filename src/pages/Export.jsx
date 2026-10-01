import { useMemo, useState } from "react";
import { Download, FileText } from "lucide-react";
import { useAppData } from "../context/AppDataContext";
import { monthKeyOf, monthKeyLabel } from "../lib/stats";
import { todayStr } from "../lib/format";
import { buildExportData, fileNameFor, downloadExcel, downloadCsv } from "../lib/export";
import "../styles/export.css";

const COLS = ["A", "B", "C", "D", "E", "F", "G"];

export default function Export() {
  const { videos, collabs, settings } = useAppData();
  const [range, setRange] = useState("one");
  const [monthKey, setMonthKey] = useState(monthKeyOf(todayStr()));
  const [fileType, setFileType] = useState("excel");
  const [include, setInclude] = useState({ videos: true, summary: true, collabs: true });
  const [previewTab, setPreviewTab] = useState("videos");

  const monthOptions = useMemo(() => {
    const set = new Set(videos.map((v) => monthKeyOf(v.date)));
    set.add(monthKey);
    return [...set].sort().reverse();
  }, [videos, monthKey]);

  const data = useMemo(
    () => buildExportData({ videos, collabs, range, monthKey, goal: settings.monthlyGoal }),
    [videos, collabs, range, monthKey, settings.monthlyGoal]
  );

  const fileName = fileNameFor(range, monthKey, fileType === "excel" ? "xlsx" : "csv");

  const activeTab = fileType === "csv" ? "videos" : previewTab;
  const activeSheet =
    activeTab === "videos" ? data.videosSheet : activeTab === "summary" ? data.summarySheet : data.collabsSheet;
  const headers = activeSheet.length > 0 ? Object.keys(activeSheet[0]) : [];

  function handleDownload() {
    if (fileType === "excel") {
      downloadExcel(data, fileName, include);
    } else {
      downloadCsv(data.videosSheet, fileName);
    }
  }

  return (
    <div>
      <div className="page-header">
        <div>
          <div className="page-eyebrow">Export</div>
          <h1 className="page-title">Download your results</h1>
        </div>
      </div>

      <div className="export-layout">
        <div className="card export-settings">
          <div className="export-field-group">
            <label>Time range</label>
            <div className="range-toggle">
              <button
                type="button"
                className={range === "one" ? "selected" : ""}
                onClick={() => setRange("one")}
              >
                One month
              </button>
              <button
                type="button"
                className={range === "last6" ? "selected" : ""}
                onClick={() => setRange("last6")}
              >
                Last 6 months
              </button>
            </div>
          </div>

          <div className="export-field-group">
            <label htmlFor="export-month">Month</label>
            <select id="export-month" value={monthKey} onChange={(e) => setMonthKey(e.target.value)}>
              {monthOptions.map((m) => (
                <option key={m} value={m}>
                  {monthKeyLabel(m)}
                </option>
              ))}
            </select>
          </div>

          <div className="export-field-group">
            <label>File type</label>
            <label className={`filetype-option${fileType === "excel" ? " selected" : ""}`}>
              <input
                type="radio"
                name="filetype"
                checked={fileType === "excel"}
                onChange={() => setFileType("excel")}
              />
              <span>
                <strong>Excel (.xlsx)</strong>
                <span>3 tabs. Opens in Excel and Google Sheets.</span>
              </span>
            </label>
            <label className={`filetype-option${fileType === "csv" ? " selected" : ""}`}>
              <input
                type="radio"
                name="filetype"
                checked={fileType === "csv"}
                onChange={() => setFileType("csv")}
              />
              <span>
                <strong>CSV (.csv)</strong>
                <span>One simple table of videos.</span>
              </span>
            </label>
          </div>

          {fileType === "excel" && (
            <div className="export-field-group">
              <label>Include</label>
              <div className="include-row">
                <label>
                  <input
                    type="checkbox"
                    checked={include.videos}
                    onChange={(e) => setInclude((i) => ({ ...i, videos: e.target.checked }))}
                  />
                  Videos
                </label>
                <span className="count">{data.videosSheet.length} rows</span>
              </div>
              <div className="include-row">
                <label>
                  <input
                    type="checkbox"
                    checked={include.summary}
                    onChange={(e) => setInclude((i) => ({ ...i, summary: e.target.checked }))}
                  />
                  Monthly summary
                </label>
                <span className="count">Goal, counts</span>
              </div>
              <div className="include-row">
                <label>
                  <input
                    type="checkbox"
                    checked={include.collabs}
                    onChange={(e) => setInclude((i) => ({ ...i, collabs: e.target.checked }))}
                  />
                  Collabs
                </label>
                <span className="count">{data.collabsSheet.length} rows</span>
              </div>
            </div>
          )}

          <button type="button" className="btn btn-primary" onClick={handleDownload} style={{ height: 48 }}>
            <Download size={16} />
            Download {fileType === "excel" ? "Excel" : "CSV"} file
          </button>
          <span style={{ fontSize: 12, color: "var(--text-2)", textAlign: "center" }}>{fileName}</span>
        </div>

        <div className="card">
          <div className="export-preview-header">
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <FileText size={18} color="var(--text-2)" />
              <div>
                <div style={{ fontWeight: 700, fontSize: 14 }}>Preview</div>
                <div className="export-preview-name">{fileName}</div>
              </div>
            </div>
          </div>

          <div className="export-preview-table-wrap">
            <table className="export-preview-table">
              <thead>
                <tr>
                  <th></th>
                  {headers.map((_, i) => (
                    <th key={i}>{COLS[i] ?? i}</th>
                  ))}
                </tr>
                <tr>
                  <th>1</th>
                  {headers.map((h) => (
                    <th key={h}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {activeSheet.map((row, i) => (
                  <tr key={i}>
                    <th>{i + 2}</th>
                    {headers.map((h) => (
                      <td key={h}>{row[h]}</td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {fileType === "excel" && (
            <div className="export-preview-tabs">
              {include.videos && (
                <button
                  type="button"
                  className={`export-preview-tab${activeTab === "videos" ? " selected" : ""}`}
                  onClick={() => setPreviewTab("videos")}
                >
                  Videos
                </button>
              )}
              {include.summary && (
                <button
                  type="button"
                  className={`export-preview-tab${activeTab === "summary" ? " selected" : ""}`}
                  onClick={() => setPreviewTab("summary")}
                >
                  Summary
                </button>
              )}
              {include.collabs && (
                <button
                  type="button"
                  className={`export-preview-tab${activeTab === "collabs" ? " selected" : ""}`}
                  onClick={() => setPreviewTab("collabs")}
                >
                  Collabs
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
