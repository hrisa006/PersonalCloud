import React from "react";
import { FileItem, fileSystem } from "../constants/fileSystem";
import "./FileExplorer.css";

export default function FileExplorer() {
  const [path, setPath] = React.useState<string[]>([]);

  const getCurrentFolder = (folder: FileItem, currentPath: string[]) => {
    let curr = folder;
    for (const folderName of currentPath) {
      const next = curr.items?.find(
        (i) => i.name === folderName && i.type === "folder"
      );
      if (next) {
        curr = next;
      } else break;
    }

    return curr;
  };

  function onFolderClick(folderName: string) {
    setPath((prev) => [...prev, folderName]);
  }

  function onPathFolderClick(i: number) {
    setPath((prev) => prev.slice(0, i + 1));
  }

  const currFolder = getCurrentFolder(fileSystem, path);

  return (
    <div className="file-browser">
      <h2>File Explorer</h2>
      <div className="path">
        <strong>Path: </strong>
        <button onClick={() => setPath([])}>.</button>
        {path.map((folder, index) => (
          <span key={folder}>
            {" / "}
            <button onClick={() => onPathFolderClick(index)}>{folder}</button>
          </span>
        ))}
      </div>

      <ul className="file-list">
        {currFolder.items?.map((item) => (
          <li
            key={item.name}
            className="file-card"
            onClick={() =>
              item.type === "folder" ? onFolderClick(item.name) : undefined
            }
          >
            <span className="file-icon">
              {item.type === "folder" ? "📁" : "📄"}
            </span>
            <span className="file-name">{item.name}</span>
          </li>
        ))}
        {currFolder.items?.length === 0 && (
          <li className="empty-message">This folder is empty.</li>
        )}
      </ul>
    </div>
  );
}
