type FileItemDto = {
    name: string;
    type: "file" | "folder";
    ext: string;
    createdAt: string;
    updatedAt: string;
    path: string;
    items?: FileItemDto[];
};