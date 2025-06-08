import { useState, useRef } from "react";
import "./SearchForm.css";
import { useFileSystem } from "../../contexts/FileSystemContext";

const SearchBar = () => {
  const [query, setQuery] = useState("");
  const [error, setError] = useState("");
  const searchTimeoutRef = useRef<number | undefined>(undefined);

  const { searchFiles, fetchTree } = useFileSystem();

  const validateSearchTerm = (searchTerm: string) => {
    if (!searchTerm.trim()) {
      setError("Please enter a search term.");
      fetchTree();
      return;
    }
  };

  const fetchFiles = async () => {
    validateSearchTerm(query);

    try {
      await searchFiles(query);
    } catch (err) {
      console.error("Search failed:", err);
      setError("Not found");
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

      {error && <div className="error-message">{error}</div>}
    </div>
  );
};

export default SearchBar;
