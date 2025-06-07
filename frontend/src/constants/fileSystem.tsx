export type FileItem = {
  name: string;
  owner: string;
  sharedWith?: string[];
  path: string;
  dateChanged: string;
  dateCreated: string;
  type: "file" | "folder";
  items?: FileItem[];
};

export const fileSystem: FileItem = {
  name: "root",
  owner: "Hristiana Karaivanova",
  path: "",
  dateChanged: "07/06/2025",
  dateCreated: "03/05/2025",
  type: "folder",
  items: [
    {
      name: "important.txt",
      owner: "Hristiana Karaivanova",
      path: "",
      dateChanged: "07/06/2025",
      dateCreated: "04/05/2025",
      type: "file",
    },
    {
      name: "Documents",
      owner: "Hristiana Karaivanova",
      
      path: "",
      dateChanged: "03/05/2025",
      dateCreated: "03/05/2025",
      type: "folder",
      items: [
        {
          name: "cv.docx",
          owner: "HK",
          sharedWith: ["me"],
          path: "",
          dateChanged: "03/05/2025",
          dateCreated: "03/05/2025",
          type: "file",
        },
        {
          name: "certificate.pdf",
          owner: "Hristiana Karaivanova",
          path: "",
          dateChanged: "03/05/2025",
          dateCreated: "03/05/2025",
          type: "file",
        },
      ],
    },
    {
      name: "Pictures",
      owner: "Hristiana Karaivanova",
      path: "",
      dateChanged: "03/05/2025",
      dateCreated: "03/05/2025",
      type: "folder",
      items: [
        {
          name: "idc.png",
          owner: "Hristiana Karaivanova",
          path: "",
          dateChanged: "03/05/2025",
          dateCreated: "03/05/2025",
          type: "file",
        },
        {
          name: "me.jpg",
          owner: "Hristiana Karaivanova",
          path: "",
          dateChanged: "03/05/2025",
          dateCreated: "03/05/2025",
          type: "file",
        },
      ],
    },
    {
      name: "Projects",
      owner: "Hristiana Karaivanova",
      path: "",
      dateChanged: "03/05/2025",
      dateCreated: "03/05/2025",
      type: "folder",
      items: [
        {
          name: "personal-cloud.zip",
          owner: "Hristiana Karaivanova",
          path: "",
          dateChanged: "03/05/2025",
          dateCreated: "03/05/2025",
          type: "file",
        },
      ],
    },
  ],
};
