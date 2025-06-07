import React from "react";
import { FileItem } from "../../../../constants/fileSystem";
import { FaUserPlus } from "react-icons/fa6";
import { FiDownload } from "react-icons/fi";
import { ImBin } from "react-icons/im";
import { IoMdInformationCircle } from "react-icons/io";
import './File.css';


interface FileProps {
  file: FileItem;
  onClick?: () => void;
}

const File: React.FC<FileProps> = ({ file, onClick }) => {
  return (
    <li
      className="file-item"
      onClick={file.type === "folder" ? onClick : undefined}
    >
      <h3>{file.name}</h3>
      <h3>{file.owner}</h3>
      <h3>{file.dateChanged}</h3>
      <div className="file-buttons">
        <button title="Share">
          <FaUserPlus />
        </button>
        <button title="Download">
          <FiDownload />
        </button>
        <button title="Delete">
          <ImBin />
        </button>
        <button title="Info">
          <IoMdInformationCircle />
        </button>
      </div>
    </li>
  );
};

export default File;
