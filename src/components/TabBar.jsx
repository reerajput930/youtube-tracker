import { NavLink } from "react-router-dom";
import { LayoutGrid, PlayCircle, Users, Download, Plus } from "lucide-react";

export default function TabBar({ onAddVideo }) {
  return (
    <nav className="tab-bar" aria-label="Primary">
      <NavLink to="/" end className={({ isActive }) => `tab-bar-link${isActive ? " active" : ""}`}>
        <LayoutGrid size={20} />
        Home
      </NavLink>
      <NavLink to="/videos" className={({ isActive }) => `tab-bar-link${isActive ? " active" : ""}`}>
        <PlayCircle size={20} />
        Videos
      </NavLink>
      <div className="tab-bar-add">
        <button type="button" onClick={onAddVideo} aria-label="Add video">
          <Plus size={22} />
        </button>
      </div>
      <NavLink to="/collabs" className={({ isActive }) => `tab-bar-link${isActive ? " active" : ""}`}>
        <Users size={20} />
        Collabs
      </NavLink>
      <NavLink to="/export" className={({ isActive }) => `tab-bar-link${isActive ? " active" : ""}`}>
        <Download size={20} />
        Export
      </NavLink>
    </nav>
  );
}
