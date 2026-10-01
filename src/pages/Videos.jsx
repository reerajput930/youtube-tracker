import { useMemo, useState } from "react";
import { useOutletContext } from "react-router-dom";
import { Search, Plus } from "lucide-react";
import { useAppData } from "../context/AppDataContext";
import VideoTable from "../components/VideoTable";
import { isSponsored, monthKeyLabel, monthKeyOf } from "../lib/stats";
import "../styles/videos.css";

const TYPE_FILTERS = [
  { id: "all", label: "All" },
  { id: "long", label: "Long" },
  { id: "short", label: "Shorts" },
  { id: "sponsored", label: "Sponsored" },
];

export default function Videos() {
  const { videos, collabs, loadSample } = useAppData();
  const { openAddVideo, openEditVideo } = useOutletContext();

  const monthOptions = useMemo(() => {
    const set = new Set(videos.map((v) => monthKeyOf(v.date)));
    return [...set].sort().reverse();
  }, [videos]);

  const [search, setSearch] = useState("");
  const [month, setMonth] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");
  const [platformFilter, setPlatformFilter] = useState("all");
  const [collabFilter, setCollabFilter] = useState("all");

  const collabById = useMemo(
    () => Object.fromEntries(collabs.map((c) => [c.id, c])),
    [collabs]
  );

  const filtered = useMemo(() => {
    return videos
      .filter((v) => (search ? v.title.toLowerCase().includes(search.toLowerCase()) : true))
      .filter((v) => (month === "all" ? true : monthKeyOf(v.date) === month))
      .filter((v) => {
        if (typeFilter === "all") return true;
        if (typeFilter === "sponsored") return isSponsored(v);
        return v.type === typeFilter;
      })
      .filter((v) => (platformFilter === "all" ? true : v.platform === platformFilter))
      .filter((v) => (collabFilter === "all" ? true : v.collabId === collabFilter))
      .sort((a, b) => b.date.localeCompare(a.date));
  }, [videos, search, month, typeFilter, platformFilter, collabFilter]);

  const footerCounts = useMemo(() => {
    const long = filtered.filter((v) => v.type === "long").length;
    const short = filtered.filter((v) => v.type === "short").length;
    const sponsored = filtered.filter(isSponsored).length;
    return { long, short, sponsored };
  }, [filtered]);

  const scopeLabel = month === "all" ? "total" : monthKeyLabel(month);

  return (
    <div>
      <div className="page-header">
        <div>
          <div className="page-eyebrow">Videos</div>
          <h1 className="page-title">All videos</h1>
        </div>
        <div className="page-header-actions">
          <span style={{ color: "var(--text-2)", alignSelf: "center" }}>
            {videos.length} videos
          </span>
          {videos.length === 0 && (
            <button type="button" className="btn btn-secondary" onClick={loadSample}>
              Load sample data
            </button>
          )}
          <button type="button" className="btn btn-primary" onClick={openAddVideo}>
            <Plus size={16} /> Add video
          </button>
        </div>
      </div>

      <div className="card">
        <div className="videos-filters">
          <div className="videos-filters-top">
            <div className="search-field">
              <Search size={16} />
              <input
                placeholder="Search by title"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                aria-label="Search by title"
              />
            </div>
            <select value={month} onChange={(e) => setMonth(e.target.value)} aria-label="Filter by month">
              <option value="all">All months</option>
              {monthOptions.map((m) => (
                <option key={m} value={m}>
                  {monthKeyLabel(m)}
                </option>
              ))}
            </select>
          </div>

          <div className="videos-filters-bottom">
            <div className="toggle-row">
              {TYPE_FILTERS.map((f) => (
                <button
                  key={f.id}
                  type="button"
                  className={`toggle-btn${typeFilter === f.id ? " selected" : ""}`}
                  onClick={() => setTypeFilter(f.id)}
                >
                  {f.label}
                </button>
              ))}
            </div>
            <select
              value={platformFilter}
              onChange={(e) => setPlatformFilter(e.target.value)}
              aria-label="Filter by platform"
            >
              <option value="all">All platforms</option>
              <option value="youtube">YouTube</option>
              <option value="instagram">Instagram</option>
              <option value="tiktok">TikTok</option>
            </select>
            <select
              value={collabFilter}
              onChange={(e) => setCollabFilter(e.target.value)}
              aria-label="Filter by collab"
            >
              <option value="all">All collabs</option>
              {collabs.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.brand}
                </option>
              ))}
            </select>
          </div>
        </div>

        {filtered.length === 0 ? (
          <p style={{ color: "var(--text-2)", padding: "var(--space-4) 0" }}>
            {videos.length === 0
              ? "No videos yet. Add your first upload or load sample data."
              : "No videos match these filters."}
          </p>
        ) : (
          <VideoTable videos={filtered} collabById={collabById} onEdit={openEditVideo} />
        )}

        <div className="videos-footer">
          {filtered.length} video{filtered.length === 1 ? "" : "s"} in {scopeLabel} · {footerCounts.long} Long ·{" "}
          {footerCounts.short} Shorts · {footerCounts.sponsored} sponsored
        </div>
      </div>
    </div>
  );
}
