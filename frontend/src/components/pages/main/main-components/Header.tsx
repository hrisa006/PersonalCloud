import { useLocation } from "react-router-dom";
import { useFileSystem } from "../../../../contexts/FileSystemContext";
import { message } from "antd";
import "./Header.css";

export default function Header() {
  const location = useLocation();
  const { createFolder } = useFileSystem();

  const handleCreateFolder = async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      message.error("Трябва да сте влезли в профила си.");
      return;
    }

    let currentPath = location.pathname
      .replace(/^\/(my-cloud|shared)/, "")
      .replace(/^\//, "");

    if (!currentPath) currentPath = "";

    const folderInput = window.prompt(
      "Въведете пътя до папката на създаване:",
      currentPath
    );
    if (!folderInput) return;

    try {
      await createFolder(folderInput);
      message.success("Папката е създадена успешно!");
    } catch (err) {
      console.error("Error creating folder:", err);
    }
  };

  return (
    <div className="header">
      <div className="searchbar">Searchbar</div>
      {/* TODO Searchbar */}
      <button className="add-folder-btn" onClick={handleCreateFolder}>
        Нова папка
      </button>
    </div>
  );
}
