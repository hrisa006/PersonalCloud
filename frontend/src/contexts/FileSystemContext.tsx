import React, { createContext, useContext, useEffect, useState } from "react";

export interface FileItem {
  name: string;
  type: "file" | "folder";
  ext: string;
  createdAt: string;
  updatedAt: string;
  path: string;
  items?: FileItem[];
}

interface FileSystemContextProps {
  fileTree: FileItem | null;
  sharedFiles: FileItem[] | null;
  fetchTree: () => Promise<void>;
  fetchSharedFiles: () => Promise<void>;
  uploadFile: (file: File, path: string) => Promise<void>;
  createFolder: (path: string) => Promise<void>;
  downloadFile: (
    filePath: string,
    fileName: string,
    ownerId?: string
  ) => Promise<void>;
  deleteFile: (filePath: string) => Promise<void>;
  shareFile: (
    filePath: string,
    userId: string,
    permission: "READ" | "WRITE"
  ) => Promise<void>;
}

const FileSystemContext = createContext<FileSystemContextProps | undefined>(
  undefined
);

export const useFileSystem = () => {
  const context = useContext(FileSystemContext);
  if (!context)
    throw new Error("useFileSystem must be used within FileSystemProvider");
  return context;
};

export const FileSystemProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [fileTree, setFileTree] = useState<FileItem | null>(null);
  const [sharedFiles, setSharedFiles] = useState<FileItem[] | null>(null);

  const token = localStorage.getItem("token");

  const fetchTree = async () => {
    if (!token) return;
    try {
      const res = await fetch("http://localhost:8081/file/user/tree", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (!res.ok) throw new Error("Failed to fetch file tree");
      const data = await res.json();
      setFileTree(data);
    } catch (err) {
      console.error("Error fetching file tree:", err);
    }
  };

  const fetchSharedFiles = async () => {
    if (!token) return;
    try {
      const res = await fetch("http://localhost:8081/file/shared", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (!res.ok) throw new Error("Failed to fetch shared files");
      const data = await res.json();
      const processedData: FileItem[] = data.map((file: FileItem) => ({
        ...file,
        name: file.path.split("/").pop() || file.path, // fallback in case path is empty
      }));

      setSharedFiles(processedData);
    } catch (err) {
      console.error("Error fetching shared files:", err);
    }
  };

  const uploadFile = async (file: File, currentPath: string) => {
    if (!token) return;
    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch(
        `http://localhost:8081/file?filePath=${encodeURIComponent(
          currentPath
        )}`,
        {
          method: "POST",
          headers: { Authorization: `Bearer ${token}` },
          body: formData,
        }
      );
      if (!res.ok) throw new Error("Upload failed");
      await fetchTree();
    } catch (err) {
      console.error("Error uploading file:", err);
    }
  };

  const createFolder = async (folderPath: string) => {
    if (!token) return;
    try {
      const res = await fetch(
        `http://localhost:8081/file/folder?folderPath=${encodeURIComponent(
          folderPath
        )}`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ folder: folderPath }),
        }
      );
      if (!res.ok) throw new Error("Folder creation failed");
      await fetchTree();
    } catch (err) {
      console.error("Error creating folder:", err);
    }
  };

  const downloadFile = async (
    filePath: string,
    fileName: string,
    ownerId?: string
  ) => {
    if (!token) {
      alert("You must be logged in to download.");
      return;
    }

    try {
      const url = new URL("http://localhost:8081/file");
      url.searchParams.append("filePath", filePath);
      if (ownerId) {
        url.searchParams.append("ownerId", ownerId);
      }

      const res = await fetch(url.toString(), {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) throw new Error("Failed to download file");

      const blob = await res.blob();
      const objectUrl = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = objectUrl;
      a.download = fileName;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(objectUrl);
    } catch (error) {
      console.error("Download error:", error);
      alert("Download failed. See console for details.");
    }
  };

  const deleteFile = async (filePath: string) => {
    if (!token) return;
    try {
      const res = await fetch(
        `http://localhost:8081/file?filePath=${encodeURIComponent(filePath)}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      if (!res.ok) throw new Error("Failed to delete file");
      await fetchTree();
    } catch (err) {
      console.error("Error deleting file:", err);
    }
  };

  const shareFile = async (
    filePath: string,
    userId: string,
    permission: "READ" | "WRITE"
  ) => {
    if (!token) return;
    try {
      const res = await fetch("http://localhost:8081/file/share", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ filePath, userId, permission }),
      });
      if (!res.ok) throw new Error("Failed to share file");
      alert("File shared successfully!");
    } catch (err) {
      console.error("Error sharing file:", err);
      alert("Could not share file.");
    }
  };

  useEffect(() => {
    if (token) fetchTree();
  }, [token]);

  return (
    <FileSystemContext.Provider
      value={{
        fileTree,
        sharedFiles,
        fetchTree,
        fetchSharedFiles,
        uploadFile,
        createFolder,
        downloadFile,
        deleteFile,
        shareFile,
      }}
    >
      {children}
    </FileSystemContext.Provider>
  );
};
