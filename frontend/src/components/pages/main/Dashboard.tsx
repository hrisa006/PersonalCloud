import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";

import Sidebar from "./main-components/Sidebar";
import Header from "./main-components/Header";
import FileList from "./main-components/FileList";

import "./Dashboard.css";

import { useFileSystem } from "../../../contexts/FileSystemContext";

export default function Dashboard() {
  const location = useLocation();
  const navigate = useNavigate();
  const pathname = location.pathname;

  const { fileTree, sharedFiles, fetchSharedFiles } = useFileSystem();

  const isShared = pathname.startsWith("/shared");
  const segments = pathname
    .replace(/^\/(my-cloud|shared)/, "")
    .split("/")
    .filter(Boolean);

  const [mode, setMode] = useState<"mydrive" | "shared">(
    isShared ? "shared" : "mydrive"
  );
  const [path, setPath] = useState<string[]>(segments);

  useEffect(() => {
    setMode(isShared ? "shared" : "mydrive");
    setPath(segments);
  }, [pathname]);

  useEffect(() => {
    if (mode === "shared") {
      fetchSharedFiles();
    }
  }, [mode]);

  const handlePathChange = (newPath: string[]) => {
    setPath(newPath);
    const base = mode === "shared" ? "/shared" : "/my-cloud";
    const newUrl = `${base}/${newPath.join("/")}`;
    navigate(newUrl);
  };

  const isLoading = mode === "shared" ? !sharedFiles : !fileTree;

  return (
    <div style={{ display: "flex" }}>
      <Sidebar mode={mode} setMode={setMode} />
      <main style={{ flexGrow: 1, padding: "1rem" }}>
        <Header />
        {isLoading ? (
          <p>Loading files...</p>
        ) : (
          <FileList
            root={
              mode === "shared"
                ? {
                    name: "Shared Root",
                    type: "folder",
                    ext: "",
                    createdAt: "",
                    updatedAt: "",
                    path: "",
                    items: sharedFiles ?? [],
                  }
                : fileTree!
            }
            mode={mode}
            path={path}
            onPathChange={handlePathChange}
            sharedWithUser="me"
          />
        )}
      </main>
    </div>
  );
}
