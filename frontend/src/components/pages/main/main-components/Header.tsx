import { useLocation } from "react-router-dom";
import { useFileSystem } from "../../../../contexts/FileSystemContext";

export default function Header() {
  const location = useLocation();
  const { createFolder } = useFileSystem();

  const handleCreateFolder = async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      alert("You must be logged in.");
      return;
    }

    let currentPath = location.pathname
      .replace(/^\/(my-cloud|shared)/, "")
      .replace(/^\//, "");

    if (!currentPath) currentPath = "";

    const folderInput = window.prompt(
      "Enter the folder path to create:",
      currentPath
    );
    if (!folderInput) return;

    try {
      await createFolder(folderInput);
      alert("Folder created successfully!");
    } catch (err) {
      console.error("Error creating folder:", err);
      alert("Error creating folder.");
    }
  };

  return (
    <>
      {/* TODO Searchbar */}
      <button onClick={handleCreateFolder}>+</button>
    </>
  );
}
