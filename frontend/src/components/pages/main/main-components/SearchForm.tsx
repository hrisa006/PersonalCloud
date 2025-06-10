import { useState, useRef } from "react";
import "./SearchForm.css";
import { useFileSystem } from "../../../../contexts/FileSystemContext.tsx";
import { message } from "antd";
import { IoSearch } from "react-icons/io5";

const SearchBar = () => {
  const [query, setQuery] = useState("");
  const searchTimeoutRef = useRef<number | undefined>(undefined);

  const { searchFiles, fetchTree } = useFileSystem();

  const validateSearchTerm = (searchTerm: string) => {
    if (!searchTerm.trim()) {
      fetchTree();
      console.log("fetching tree");
      return false;
    }

    return true;
  };

  const fetchFiles = async (searchQuery: string) => {
    const isValid = validateSearchTerm(query);

    if (!isValid) return;

    try {
      await searchFiles(searchQuery);
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
      fetchFiles(newValue);
      searchTimeoutRef.current = undefined;
    }, 1000);
  };

  return (
    <div className="search-container">
      <form className="input-wrapper">
        <IoSearch style={{color: "var(--accent-color"}}/>
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
