import React, { useState } from "react";
import {
  FileItem,
  useFileSystem,
} from "../../../../contexts/FileSystemContext";
import { FaUserPlus } from "react-icons/fa6";
import { FiDownload } from "react-icons/fi";
import { ImBin } from "react-icons/im";
import { IoMdInformationCircle } from "react-icons/io";
import "./File.css";

interface FileProps {
  file: FileItem;
  onClick?: () => void;
  mode: "mydrive" | "shared" | "search";
}

const File: React.FC<FileProps> = ({ file, onClick, mode }) => {
  const { downloadFile, deleteFile, shareFile, updateFilePath, fetchFileBlob } =
    useFileSystem();
  const [isSharing, setIsSharing] = useState(false);
  const [shareUserEmail, setShareUserEmail] = useState("");
  const [permission, setPermission] = useState<"READ" | "WRITE">("READ");

  const handleShareSubmit = async () => {
    if (!shareUserEmail) {
      alert("Please enter a user ID.");
      return;
    }
    try {
      await shareFile(file.path, shareUserEmail, permission);
      setIsSharing(false);
      setShareUserEmail("");
      setPermission("READ");
    } catch (err) {
      console.error("Sharing failed:", err);
    }
  };

  const handleEditPath = async () => {
    const currentPath = file.path;
    const newPath = window.prompt("Edit file path:", currentPath);

    if (!newPath || newPath === currentPath) return;

    try {
      const fileBlob = await fetchFileBlob(currentPath);
      await updateFilePath(newPath, fileBlob);
      alert("File moved successfully!");
    } catch (err) {
      console.error("Failed to update file path:", err);
      alert("Failed to move file.");
    }
  };

  return (
    <li
      className="file-item"
      onClick={file.type === "folder" ? onClick : undefined}
    >
      <h3>{file.name}</h3>
      <h3>{file.owner?.name ?? "You"}</h3>
      <h3>
        {file.type === "file"
          ? file.updatedAt
            ? new Date(file.updatedAt).toLocaleDateString()
            : "-"
          : "-"}
      </h3>
      <div className="file-buttons">
        {file.type === "file" && (
          <>
            {mode === "mydrive" && (
              <>
                <button title="Share" onClick={() => setIsSharing(true)}>
                  <FaUserPlus />
                </button>
                <button onClick={handleEditPath}>Edit</button>
              </>
            )}
            <button
              title="Download"
              onClick={() => downloadFile(file.path, file.name, file.owner?.id)}
            >
              <FiDownload />
            </button>
            {(!file.permission || file.permission === "WRITE") && (
              <button
                title="Delete"
                onClick={() => deleteFile(file.path, file.owner?.id)}
              >
                <ImBin />
              </button>
            )}
          </>
        )}
        <button title="Info">
          <IoMdInformationCircle />
        </button>
      </div>

      {isSharing && (
        <div className="share-modal">
          <h4>Share "{file.name}"</h4>
          <input
            type="text"
            placeholder="User Email"
            value={shareUserEmail}
            onChange={(e) => setShareUserEmail(e.target.value)}
          />
          <select
            value={permission}
            onChange={(e) => setPermission(e.target.value as "READ" | "WRITE")}
          >
            <option value="READ">Read</option>
            <option value="WRITE">Write</option>
          </select>
          <div className="modal-actions">
            <button onClick={handleShareSubmit}>Share</button>
            <button onClick={() => setIsSharing(false)}>Cancel</button>
          </div>
        </div>
      )}
    </li>
  );
};

export default File;
