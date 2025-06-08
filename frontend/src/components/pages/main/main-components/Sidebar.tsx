import React from "react";
import { useLocation, useNavigate } from "react-router-dom";

import { useFileSystem } from "../../../../contexts/FileSystemContext";
import { FiLogOut } from "react-icons/fi";
import { message } from "antd";
import "./Sidebar.css";

interface SidebarProps {
  mode: "mydrive" | "shared";
  setMode: (mode: "mydrive" | "shared") => void;
}

const Sidebar: React.FC<SidebarProps> = ({ mode, setMode }) => {
  const { uploadFile } = useFileSystem();
  const navigate = useNavigate();
  const location = useLocation();

  const changeMode = (newMode: "mydrive" | "shared") => {
    setMode(newMode);
    navigate(newMode === "mydrive" ? "/my-cloud" : "/shared");
  };

  const isActive = (check: "mydrive" | "shared") => mode === check;

  let currentPath = location.pathname
    .replace(/^\/(my-cloud|shared)/, "")
    .replace(/^\//, "");

  if (!currentPath) currentPath = "";

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      await uploadFile(file, currentPath);
      message.success("File uploaded successfully!");
    } catch (err) {
      console.error("Upload failed:", err);
    } finally {
      e.target.value = "";
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };

  return (
    <aside className="sidebar">
      <div className="sidebar-content">
        <h2 className="logo">Личен Облак</h2>
        <button
          className="upload-btn"
          onClick={() => document.getElementById("fileInput")?.click()}
        >
          + Качване
        </button>
        <input
          type="file"
          id="fileInput"
          style={{ display: "none" }}
          onChange={handleFileUpload}
        />
        <nav className="nav-buttons">
          <button
            className={isActive("mydrive") ? "active" : ""}
            onClick={() => changeMode("mydrive")}
          >
            Моят Облак
          </button>
          <button
            className={isActive("shared") ? "active" : ""}
            onClick={() => changeMode("shared")}
          >
            Споделени
          </button>
        </nav>
        <button className="logout-btn" onClick={handleLogout}>
          <FiLogOut />
          Изход
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
