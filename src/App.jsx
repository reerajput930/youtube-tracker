import { Routes, Route } from "react-router-dom";
import Layout from "./components/Layout";
import Dashboard from "./pages/Dashboard";
import Videos from "./pages/Videos";
import Collabs from "./pages/Collabs";
import Export from "./pages/Export";
import Settings from "./pages/Settings";

export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route path="/" element={<Dashboard />} />
        <Route path="/videos" element={<Videos />} />
        <Route path="/collabs" element={<Collabs />} />
        <Route path="/export" element={<Export />} />
        <Route path="/settings" element={<Settings />} />
      </Route>
    </Routes>
  );
}
