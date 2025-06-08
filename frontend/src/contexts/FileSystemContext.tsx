import React, { createContext, useContext, useEffect, useState } from "react";
import { message } from "antd";
import {
  customHttpRequest,
  customHttpBlobRequest,
} from "../utils/customHttpClient";
import { API_BASE_URL } from "../utils/constants";

export interface FileOwner {
  id: string;
  name: string;
  email: string;
}

export interface FileItem {
  name: string;
  type: "file" | "folder";
  ext: string;
  createdAt: string;
  updatedAt: string;
  path: string;
  owner?: FileOwner;
  permission?: "READ" | "WRITE";
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
    ownerEmail?: string
  ) => Promise<void>;
  deleteFile: (filePath: string, ownerId?: string) => Promise<void>;
  shareFile: (
    filePath: string,
    userEmail: string,
    permission: "READ" | "WRITE"
  ) => Promise<void>;
  updateFilePath: (
    currentPath: string,
    newPath: string,
    file: File
  ) => Promise<void>;
  fetchFileBlob: (filePath: string) => Promise<File>;
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
  const getToken = () => localStorage.getItem("token");

  const fetchTree = async () => {
    const token = getToken();
    if (!token) return;

    const res = await customHttpRequest<FileItem>(
      `${API_BASE_URL}/file/user/tree`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    setFileTree(res);
  };

  const fetchSharedFiles = async () => {
    const token = getToken();
    if (!token) return;

    const data = await customHttpRequest<FileItem[]>(
      `${API_BASE_URL}/file/shared`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    const processedData: FileItem[] = data.map((file: any) => ({
      name: file.path.split("/").pop() || file.path,
      type: "file",
      ext: file.fileType,
      createdAt: file.createdAt,
      updatedAt: file.updatedAt,
      path: file.path,
      owner: file.owner,
      permission: file.permission,
    }));

    setSharedFiles(processedData);
  };

  const uploadFile = async (file: File, currentPath: string) => {
    const token = getToken();
    if (!token) return;
    const formData = new FormData();
    formData.append("file", file);

    await customHttpRequest<FileItem>(
      `${API_BASE_URL}/file?filePath=${encodeURIComponent(currentPath)}`,
      {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      }
    );

    await fetchTree();
  };

  const createFolder = async (folderPath: string) => {
    const token = getToken();
    if (!token) return;

    await customHttpRequest<FileItem>(
      `${API_BASE_URL}/file/folder?folderPath=${encodeURIComponent(
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

    await fetchTree();
  };

  const downloadFile = async (
    filePath: string,
    fileName: string,
    ownerId?: string
  ) => {
    const token = getToken();
    if (!token) {
      message.error("You must be logged in to download.");
      return;
    }

    const url = new URL(`${API_BASE_URL}/file`);
    url.searchParams.append("filePath", filePath);

    if (ownerId) {
      url.searchParams.append("ownerId", ownerId);
      console.log("Downloading shared file...");
    } else {
      console.log("Downloading personal MyDrive file...");
    }

    const blob = await customHttpBlobRequest(url.toString(), {
      method: "GET",
      headers: { Authorization: `Bearer ${token}` },
    });
    const objectUrl = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = objectUrl;
    a.download = fileName;
    document.body.appendChild(a);
    a.click();
    a.remove();
    window.URL.revokeObjectURL(objectUrl);
  };

  const deleteFile = async (filePath: string, ownerId?: string) => {
    const token = getToken();
    if (!token) return;

    const url = new URL(`${API_BASE_URL}/file`);
    url.searchParams.append("filePath", filePath);

    if (ownerId) {
      url.searchParams.append("ownerId", ownerId);
    }

    await customHttpRequest<FileItem>(url.toString(), {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    await fetchTree();
    if (ownerId) await fetchSharedFiles();
  };

  const shareFile = async (
    filePath: string,
    userEmail: string,
    permission: "READ" | "WRITE"
  ) => {
    const token = getToken();
    if (!token) return;

    await customHttpRequest<FileItem>(`${API_BASE_URL}/file/share`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ filePath, userEmail, permission }),
    });

    message.success("File shared successfully!");
  };

  const updateFilePath = async (
    currentPath: string,
    newPath: string,
    file: File
  ) => {
    const token = getToken();
    if (!token) return;

    const formData = new FormData();
    formData.append("file", file);

    const url = new URL(`${API_BASE_URL}/file`);
    url.searchParams.append("filePath", currentPath);
    url.searchParams.append("newPath", newPath);

    await customHttpRequest<FileItem>(url.toString(), {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: formData,
    });

    await fetchTree();
  };

  const fetchFileBlob = async (filePath: string): Promise<File> => {
    const token = getToken();
    if (!token) throw new Error("Not authenticated");
    const blob = await customHttpBlobRequest(
      `${API_BASE_URL}/file?filePath=${encodeURIComponent(filePath)}`,
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    return new File([blob], filePath.split("/").pop() || "file", {
      type: blob.type,
    });
  };

  useEffect(() => {
    const token = getToken();
    if (token) fetchTree();
  }, []);

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
        updateFilePath,
        fetchFileBlob,
      }}
    >
      {children}
    </FileSystemContext.Provider>
  );
};
