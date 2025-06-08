import { useState, useRef } from "react";
import "./SearchForm.css";
import { useFileSystem } from "../../contexts/FileSystemContext";
import { message } from "antd";

const SearchBar = () => {
  const [query, setQuery] = useState("");
  const searchTimeoutRef = useRef<number | undefined>(undefined);

  const { searchFiles, fetchTree } = useFileSystem();

  const validateSearchTerm = (searchTerm: string) => {
    if (!searchTerm.trim()) {
      fetchTree();
      return false;
    }

    return true;
  };

  const fetchFiles = async () => {
    const isValid = validateSearchTerm(query);

    if (!isValid) return;

    try {
      await searchFiles(query);
    } catch (err) {
      console.error("Search failed:", err);
      message.error("Неуспешно търсене");
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setQuery(newValue);

    if (searchTimeoutRef.current) {
      window.clearTimeout(searchTimeoutRef.current);
    }

    searchTimeoutRef.current = window.setTimeout(() => {
      fetchFiles();
    }, 1000);
  };

  return (
    <div className="search-container">
      <form className="input-wrapper">
        <span id="search-icon">🔍</span>
        <input
          type="text"
          placeholder="Search for files..."
          value={query}
          onChange={handleChange}
        />
      </form>
    </div>
  );
};

export default SearchBar;
