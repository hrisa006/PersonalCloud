import React, { useState } from "react";
import { FileItem } from "../../../../constants/fileSystem";
import File from "./File";
import './FileList.css'

interface Props {
  root: FileItem;
  path: string[];
  onPathChange: (newPath: string[]) => void;
  mode: "mydrive" | "shared" | "search";
  searchQuery?: string;
  sharedWithUser?: string;
}

const FileList: React.FC<Props> = ({
  root,
  path,
  onPathChange,
  mode,
  searchQuery,
  sharedWithUser,
}) => {
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
    if (mode === "shared") return "Shared";
    if (mode === "search") return "Search Results";
    return "MyDrive";
  };

  const findSharedFiles = (folder: FileItem, user: string): FileItem[] => {
    const result: FileItem[] = [];
    const traverse = (node: FileItem) => {
      if (node.type === "file" && node.sharedWith?.includes(user))
        result.push(node);
      node.items?.forEach(traverse);
    };
    traverse(folder);
    return result;
  };

  const searchFiles = (folder: FileItem, query: string): FileItem[] => {
    const result: FileItem[] = [];
    const traverse = (node: FileItem) => {
      if (node.name.toLowerCase().includes(query.toLowerCase()))
        result.push(node);
      node.items?.forEach(traverse);
    };
    traverse(folder);
    return result;
  };

  const itemsToRender =
    mode === "shared" && sharedWithUser
      ? findSharedFiles(root, sharedWithUser)
      : mode === "search" && searchQuery
      ? searchFiles(root, searchQuery)
      : getCurrentFolder(root, path).items?.filter(
          (item) => !item.sharedWith || item.sharedWith.length === 0
        ) ?? [];

  return (
    <div className="file-list-container">
      <div className="path-bar">
        <strong>Path: </strong>
        <button onClick={handleResetPath}>{getRootLabel()}</button>
        {mode === "mydrive" &&
          path.map((folder, index) => (
            <span key={index}>
              {" > "}
              <button onClick={() => handlePathClick(index)}>{folder}</button>
            </span>
          ))}
      </div>

      <ul className="file-list">
        {itemsToRender.map((item) => (
          <File
            key={item.name}
            file={item}
            onClick={
              mode === "mydrive" && item.type === "folder"
                ? () => handleFolderClick(item.name)
                : undefined
            }
          />
        ))}
        {itemsToRender.length === 0 && (
          <li className="empty-message">No files found.</li>
        )}
      </ul>
    </div>
  );
};

export default FileList;
