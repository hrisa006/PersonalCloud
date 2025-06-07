// components/Sidebar/Sidebar.tsx
import React from "react";
import { useNavigate } from "react-router-dom";
import "./Sidebar.css";

interface SidebarProps {
  mode: "mydrive" | "shared";
  setMode: (mode: "mydrive" | "shared") => void;
}

const Sidebar: React.FC<SidebarProps> = ({ mode, setMode }) => {
  const navigate = useNavigate();

  const changeMode = (newMode: "mydrive" | "shared") => {
    setMode(newMode);
    navigate(newMode === "mydrive" ? "/my-cloud" : "/shared");
  };

  const isActive = (check: "mydrive" | "shared") => mode === check;

  return (
    <aside className="sidebar">
      <div className="sidebar-content">
        <h2 className="logo">🌐 MyCloud</h2>

        <button className="upload-btn" onClick={() => alert("Upload not yet implemented")}>
          ⬆️ Upload
        </button>

        <nav className="nav-buttons">
          <button
            className={isActive("mydrive") ? "active" : ""}
            onClick={() => changeMode("mydrive")}
          >
            📁 My Drive
          </button>
          <button
            className={isActive("shared") ? "active" : ""}
            onClick={() => changeMode("shared")}
          >
            🤝 Shared
          </button>
        </nav>

        <div className="spacer" />
        <button className="logout-btn" onClick={() => alert("Logout placeholder")}>
          🚪 Logout
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
