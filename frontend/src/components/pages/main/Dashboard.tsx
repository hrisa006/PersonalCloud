import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";

import Sidebar from "./main-components/Sidebar";
import Header from "./main-components/Header";
import FileList from "./main-components/FileList";
import "./Dashboard.css";

import { Modal } from "antd";
import { useFileSystem } from "../../../contexts/FileSystemContext";

export default function Dashboard() {
  const location = useLocation();
  const navigate = useNavigate();
  const pathname = location.pathname;

  const { fileTree, sharedFiles, fetchSharedFiles, getFile } = useFileSystem();

  const isShared = pathname.startsWith("/shared");
  const segments = pathname
    .replace(/^\/(my-cloud|shared)/, "")
    .split("/")
    .filter(Boolean);

  const [mode, setMode] = useState<"mydrive" | "shared">(
    isShared ? "shared" : "mydrive"
  );
  const [path, setPath] = useState<string[]>(segments);

  const [openedFile, setOpenedFile] = useState<null | {
    name: string;
    content: string;
    type: string;
  }>(null);

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

  const handleFileClick = async (file: any) => {
    if (file.type === "file") {
      try {
        const blob = await getFile(file.path, file.owner?.id);

        let content: string;
        let type: string = blob.type;
        if (blob.type.startsWith("image/") || blob.type === "application/pdf") {
          content = URL.createObjectURL(blob);
        } else {
          content = await blob.text();
        }

        setOpenedFile({
          name: file.name,
          content,
          type,
        });
      } catch (err) {
        console.error("Failed to fetch file content:", err);
        setOpenedFile({
          name: file.name,
          content: "Failed to load file content.",
          type: "error",
        });
      }
    }
  };

  const handleCloseFile = () => {
    setOpenedFile(null);
  };

  const isLoading = mode === "shared" ? !sharedFiles : !fileTree;

  return (
    <div style={{ display: "flex", width: "100%" }}>
      <Sidebar mode={mode} setMode={setMode} />
      <main style={{ flex: 1, padding: "1rem" }}>
        <Header />
        {isLoading ? (
          <p style={{ textAlign: "center", color: "#999", marginTop: "250px" }}>
            Зареждане на файлове...
          </p>
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
            onFileClick={handleFileClick}
          />
        )}

        <Modal
          open={!!openedFile}
          onCancel={handleCloseFile}
          title={openedFile?.name}
          width={800}
          footer={null}
        >
          {openedFile?.type?.startsWith("image/") ? (
            <img
              src={openedFile.content}
              alt={openedFile.name}
              style={{
                maxWidth: "100%",
                maxHeight: "600px",
                display: "block",
                margin: "auto",
              }}
            />
          ) : openedFile?.type === "application/pdf" ? (
            <iframe
              src={openedFile.content}
              width="100%"
              height="600px"
              style={{ border: "none" }}
            ></iframe>
          ) : openedFile?.type?.startsWith("text/") ||
            openedFile?.type === "application/json" ||
            openedFile?.type === "application/xml" ||
            openedFile?.type === "application/javascript" ? (
            <pre style={{ whiteSpace: "pre-wrap" }}>{openedFile.content}</pre>
          ) : (
            <p>
              <a href={openedFile?.content} download={openedFile?.name}>
                Download file
              </a>
            </p>
          )}
        </Modal>
      </main>
    </div>
  );
}
