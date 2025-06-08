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
  const [isConfirmingDelete, setIsConfirmingDelete] = useState(false);

  const handleShareSubmit = async () => {
    if (!shareUserEmail) {
      message.error("Моля въведете име/имейл на потребител.");
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
    const newPath = window.prompt("Промяна на пътя на папката:", currentPath);

    if (!newPath || newPath === currentPath) return;

    try {
      const fileBlob = await fetchFileBlob(currentPath);
      await updateFilePath(currentPath, newPath, fileBlob);
      message.success("Файлът е преместен успешно!");
    } catch (err) {
      console.error("Failed to update file path:", err);
    }
  };

  return (
    <li
      className="file-item"
      onClick={(e) => {
        const target = e.target as HTMLElement;

        if (
          target.closest(".modal-backdrop") ||
          target.closest(".file-buttons") ||
          target.closest("button")
        ) {
          return;
        }

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
            {(!file.permissions || file.permissions === "WRITE") && (
              <button
                title="Delete"
                onClick={() => setIsConfirmingDelete(true)}
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
            <h4>Споделяне на "{file.name}"</h4>
            <input
              type="text"
              placeholder="Добавяне на човек"
              value={shareUserEmail}
              onChange={(e) => setShareUserEmail(e.target.value)}
            />
            <select
              value={permission}
              onChange={(e) =>
                setPermission(e.target.value as "READ" | "WRITE")
              }
            >
              <option value="READ">Обикновен потребител</option>
              <option value="WRITE">Редактор</option>
            </select>
            <div className="modal-actions">
              <button onClick={handleShareSubmit}>Споделяне</button>
              <button onClick={() => setIsSharing(false)}>Отказ</button>
            </div>
          </div>
        </div>
      )}

      {isConfirmingDelete && (
        <div className="modal-backdrop">
          <div className="share-modal">
            <h4>Наистина ли искате да изтриете файла "{file.name}"?</h4>
            <div className="modal-actions">
              <button
                onClick={() => {
                  deleteFile(file.path, file.owner?.id);
                  setIsConfirmingDelete(false);
                }}
              >
                Изтриване
              </button>
              <button onClick={() => setIsConfirmingDelete(false)}>
                Отказ
              </button>
            </div>
          </div>
        </div>
      )}

      {isInfoVisible && (
        <div className="modal-backdrop">
          <div className="share-modal">
            <h4
              style={{
                fontSize: "20px",
                color: "var(--color-accent)",
                margin: "15px 0",
              }}
            >
              Информация за файл
            </h4>
            <p>
              <strong>Име:</strong> {file.name}
            </p>
            <p>
              <strong>Собственик:</strong>{" "}
              {mode === "shared" ? file.owner?.name : "мен"}
            </p>
            <p>
              <strong>Достъп:</strong>{" "}
              {mode === "shared"
                ? file.permissions === "READ"
                  ? "обикновен потребител"
                  : "редактор"
                : "собственик"}
            </p>
            <p>
              <strong>Тип:</strong> {file.type}
            </p>
            <p>
              <strong>Местоположение:</strong> {file.path}
            </p>
            <p>
              <strong>Променено:</strong>{" "}
              {file.updatedAt ? new Date(file.updatedAt).toLocaleString() : "-"}
            </p>
            <p>
              <strong>Създадено:</strong>{" "}
              {file.createdAt ? new Date(file.createdAt).toLocaleString() : "-"}
            </p>
            <div className="modal-actions">
              <button onClick={() => setIsInfoVisible(false)}>Отказ</button>
            </div>
          </div>
        </div>
      )}
    </li>
  );
};

export default File;
