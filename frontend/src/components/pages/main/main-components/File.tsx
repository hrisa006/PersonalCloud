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
  onDelete?: (filePath: string) => void;
}

const File: React.FC<FileProps> = ({ file, onClick, onDelete }) => {
  const { downloadFile, shareFile } = useFileSystem();
  const [isSharing, setIsSharing] = useState(false);
  const [shareUserId, setShareUserId] = useState("");
  const [permission, setPermission] = useState<"READ" | "WRITE">("READ");

  const handleShareSubmit = async () => {
    if (!shareUserId) {
      alert("Please enter a user ID.");
      return;
    }
    try {
      await shareFile(file.path, shareUserId, permission);
      setIsSharing(false);
      setShareUserId("");
      setPermission("READ");
    } catch (err) {
      console.error("Sharing failed:", err);
    }
  };

  return (
    <li
      className="file-item"
      onClick={file.type === "folder" ? onClick : undefined}
    >
      <h3>{file.name}</h3>
      <h3>мен</h3>
      <h3>
        {file.updatedAt ? new Date(file.updatedAt).toLocaleDateString() : "-"}
      </h3>
      <div className="file-buttons">
        {file.type === "file" && (
          <>
            <button title="Share" onClick={() => setIsSharing(true)}>
              <FaUserPlus />
            </button>
            <button
              title="Download"
              onClick={() => downloadFile(file.path, file.name)}
            >
              <FiDownload />
            </button>
          </>
        )}
        <button title="Delete" onClick={() => onDelete}>
          <ImBin />
        </button>
        <button title="Info">
          <IoMdInformationCircle />
        </button>
      </div>

      {isSharing && (
        <div className="share-modal">
          <h4>Share "{file.name}"</h4>
          <input
            type="text"
            placeholder="User ID"
            value={shareUserId}
            onChange={(e) => setShareUserId(e.target.value)}
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
