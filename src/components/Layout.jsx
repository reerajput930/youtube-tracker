import { useState } from "react";
import { Outlet } from "react-router-dom";
import Sidebar from "./Sidebar";
import TabBar from "./TabBar";
import VideoPanel from "./VideoPanel";

export default function Layout() {
  const [panel, setPanel] = useState(null); // null | { video: Video|null }

  const openAddVideo = () => setPanel({ video: null });
  const openEditVideo = (video) => setPanel({ video });
  const closePanel = () => setPanel(null);

  return (
    <div className="app-shell">
      <Sidebar />
      <main className="main-area">
        <Outlet context={{ openAddVideo, openEditVideo }} />
      </main>
      <TabBar onAddVideo={openAddVideo} />
      {panel && <VideoPanel video={panel.video} onClose={closePanel} />}
    </div>
  );
}
