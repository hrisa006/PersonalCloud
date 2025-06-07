import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import Sidebar from "./components/Sidebar";
import FileList from "./components/FileList";
import { fileSystem } from "../../constants/fileSystem";
import './Dashboard.css'


export default function Dashboard() {
  const location = useLocation();
  const navigate = useNavigate();
  const pathname = location.pathname;

  // Strip base and extract path
  const segments = pathname
    .replace(/^\/(my-cloud|shared)/, "")
    .split("/")
    .filter(Boolean);

  const isShared = pathname.startsWith("/shared");
  const [mode, setMode] = useState<"mydrive" | "shared">(
    isShared ? "shared" : "mydrive"
  );
  const [path, setPath] = useState<string[]>(segments);

  // Sync mode + path with URL changes
  useEffect(() => {
    setMode(isShared ? "shared" : "mydrive");
    setPath(segments);
  }, [pathname]);

  const handlePathChange = (newPath: string[]) => {
    setPath(newPath);
    const base = mode === "shared" ? "/shared" : "/my-cloud";
    const newUrl = `${base}/${newPath.join("/")}`;
    navigate(newUrl);
  };

  return (
    <div style={{ display: "flex" }}>
      <Sidebar mode={mode} setMode={setMode} />
      <main style={{ flexGrow: 1, padding: "1rem" }}>
        <FileList
          root={fileSystem}
          mode={mode}
          path={path}
          onPathChange={handlePathChange}
          sharedWithUser="me"
        />
      </main>
    </div>
  );
}
