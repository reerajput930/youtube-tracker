import { Play, Pencil } from "lucide-react";
import Chip from "./Chip";
import { formatDateShort, formatLength } from "../lib/format";

const PLATFORM_LABEL = { youtube: "YouTube", instagram: "Instagram", tiktok: "TikTok" };

export default function VideoTable({ videos, collabById, onEdit }) {
  return (
    <div className="videos-table-wrap">
      <table className="videos-table">
        <thead>
          <tr>
            <th>Video</th>
            <th>Date</th>
            <th>Type</th>
            <th>Length</th>
            <th>Collab</th>
            <th aria-label="Edit" />
          </tr>
        </thead>
        <tbody>
          {videos.map((v) => {
            const collab = v.collabId ? collabById[v.collabId] : null;
            return (
              <tr key={v.id}>
                <td>
                  <div className="video-title-cell">
                    <div
                      className={`video-thumb ${
                        v.type === "long" ? "video-thumb-long" : "video-thumb-short"
                      }`}
                    >
                      {v.type === "long" && <Play size={16} fill="currentColor" />}
                    </div>
                    <div className="video-title-text">
                      <strong>{v.title}</strong>
                      <span>{PLATFORM_LABEL[v.platform]}</span>
                    </div>
                  </div>
                </td>
                <td>{formatDateShort(v.date)}</td>
                <td>
                  <Chip variant={v.type === "long" ? "long" : "short"}>
                    {v.type === "long" ? "Long" : "Short"}
                  </Chip>
                </td>
                <td>{formatLength(v.lengthSec)}</td>
                <td>{collab ? <Chip variant="collab">{collab.brand}</Chip> : "—"}</td>
                <td>
                  <button
                    type="button"
                    className="btn btn-icon btn-ghost"
                    onClick={() => onEdit(v)}
                    aria-label={`Edit ${v.title}`}
                  >
                    <Pencil size={16} />
                  </button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
