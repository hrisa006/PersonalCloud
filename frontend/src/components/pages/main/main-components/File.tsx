import React, { useState } from "react";

import {
  FileItem,
  useFileSystem,
} from "../../../../contexts/FileSystemContext";
import { FaUserPlus } from "react-icons/fa6";
import { FiDownload } from "react-icons/fi";
import { ImBin } from "react-icons/im";
import { IoMdInformationCircle } from "react-icons/io";
import { FaEdit } from "react-icons/fa";
import { FileIcon } from 'react-file-icon';
import { FolderFilled } from '@ant-design/icons';
import { message } from "antd";
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
  const [isInfoVisible, setIsInfoVisible] = useState(false);

  const handleShareSubmit = async () => {
    if (!shareUserEmail) {
      message.error("Please enter a user ID.");
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
      await updateFilePath(currentPath, newPath, fileBlob);
      message.success("File moved successfully!");
    } catch (err) {
      console.error("Failed to update file path:", err);
    }
  };

  return (
    <li
      className="file-item"
      onClick={(e) => {
        if ((e.target as HTMLElement).closest("button")) return;
        onClick?.();
      }}
    >

      <div className="file-icon">
        {file.type === "folder" ? (
            <FolderFilled style={{ fontSize: 32, color: '#F4C542' }} />)
            : (<FileIcon size={16} color="#2C5898" labelColor="#2C5898" labelUppercase type="document" glyphColor="rgba(255,255,255,0.4)" extension={file.ext.substring(1)}/>
        )}
      </div>
      <h3>{file.name}</h3>
      <h3>{file.owner?.name ?? "Мен"}</h3>
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
                <button title="Edit" onClick={handleEditPath}>
                  <FaEdit />
                </button>
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
            <button title="Info" onClick={() => setIsInfoVisible(true)}>
              <IoMdInformationCircle />
            </button>
          </>
        )}
      </div>

      {isSharing && (
        <div className="modal-backdrop">
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
              onChange={(e) =>
                setPermission(e.target.value as "READ" | "WRITE")
              }
            >
              <option value="READ">Read</option>
              <option value="WRITE">Write</option>
            </select>
            <div className="modal-actions">
              <button onClick={handleShareSubmit}>Share</button>
              <button onClick={() => setIsSharing(false)}>Cancel</button>
            </div>
          </div>
        </div>
      )}

      {isInfoVisible && (
        <div className="modal-backdrop">
          <div className="share-modal">
            <h4 style={{ fontSize: "20px" }}>File Info</h4>
            <p>
              <strong>Name:</strong> {file.name}
            </p>
            <p>
              <strong>Owner:</strong>{" "}
              {mode === "shared" ? file.owner?.name : "me"}
            </p>
            <p>
              <strong>Permission:</strong>{" "}
              {mode === "shared" ? file.permission?.toLowerCase() : "owner"}
            </p>
            <p>
              <strong>Type:</strong> {file.type}
            </p>
            <p>
              <strong>Path:</strong> {file.path}
            </p>
            <p>
              <strong>Created:</strong>{" "}
              {file.createdAt ? new Date(file.createdAt).toLocaleString() : "-"}
            </p>
            <p>
              <strong>Updated:</strong>{" "}
              {file.updatedAt ? new Date(file.updatedAt).toLocaleString() : "-"}
            </p>
            <div className="modal-actions">
              <button onClick={() => setIsInfoVisible(false)}>Close</button>
            </div>
          </div>
        </div>
      )}
    </li>
  );
};

export default File;
