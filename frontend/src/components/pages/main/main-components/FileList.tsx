import React from "react";

import {
  FileItem,
  useFileSystem,
} from "../../../../contexts/FileSystemContext";
import File from "./File";
import "./FileList.css";

interface Props {
  root: FileItem;
  path: string[];
  onPathChange: (newPath: string[]) => void;
  mode: "mydrive" | "shared" | "search";
  searchQuery?: string;
  onFileClick?: (file: FileItem) => void;
}

const FileList: React.FC<Props> = ({
  root,
  path,
  onPathChange,
  mode,
  searchQuery,
  onFileClick,
}) => {
  const { sharedFiles } = useFileSystem();

  const getCurrentFolder = (
    folder: FileItem,
    currentPath: string[]
  ): FileItem => {
    let curr = folder;
    for (const folderName of currentPath) {
      const next = curr.items?.find(
        (i) => i.name === folderName && i.type === "folder"
      );
      if (next) curr = next;
      else break;
    }
    return curr;
  };

  const handleFolderClick = (folderName: string) => {
    if (mode === "mydrive") {
      onPathChange([...path, folderName]);
    }
  };

  const handlePathClick = (index: number) => {
    const newPath = path.slice(0, index + 1);
    onPathChange(newPath);
  };

  const handleResetPath = () => {
    onPathChange([]);
  };

  const getRootLabel = () => {
    if (mode === "shared") return "Споделени с мен";
    if (mode === "search") return "Резултати от търсенето";
    return "Моят Облак";
  };

  // TODO Searchbar

  const itemsToRender =
    mode === "shared"
      ? sharedFiles ?? []
      : // : mode === "search" && searchQuery
        // ? searchFiles(root, searchQuery)
        getCurrentFolder(root, path).items ?? [];

  return (
    <div className="file-list-container">
      <div className="path-bar">
        <button onClick={handleResetPath}>{getRootLabel()}</button>
        {mode === "mydrive" &&
          path.map((folder, index) => (
            <span key={index}>
              {" > "}
              <button onClick={() => handlePathClick(index)}>{folder}</button>
            </span>
          ))}
      </div>

      <div className="file-labels">
        <h3>Име</h3>
        <h3>Собственик</h3>
        <h3>Променено</h3>
      </div>

      <ul className="file-list">
        {itemsToRender.map((item) => (
          <File
            key={item.name}
            file={item}
            onClick={
              mode === "mydrive" && item.type === "folder"
                ? () => handleFolderClick(item.name)
                : () => onFileClick?.(item)
            }
            mode={mode}
          />
        ))}
        {itemsToRender.length === 0 && (
          <li className="empty-message">Няма намерени файлове.</li>
        )}
      </ul>
    </div>
  );
};

export default FileList;
