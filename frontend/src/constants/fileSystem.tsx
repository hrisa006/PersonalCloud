export type FileItem = {
  name: string;
  type: "file" | "folder";
  items?: FileItem[];
};

export const fileSystem: FileItem = {
  name: "root",
  type: "folder",
  items: [
    {
      name: "important.txt",
      type: "file",
    },
    {
      name: "Documents",
      type: "folder",
      items: [
        {
          name: "cv.docx",
          type: "file",
        },
        {
          name: "certificate.pdf",
          type: "file",
        },
      ],
    },
    {
      name: "Pictures",
      type: "folder",
      items: [
        {
          name: "idc.png",
          type: "file",
        },
        {
          name: "me.jpg",
          type: "file",
        },
      ],
    },
    {
      name: "Projects",
      type: "folder",
      items: [
        {
          name: "personal-cloud.zip",
          type: "file",
        },
      ],
    },
  ],
};
