import { useState, useRef } from 'react';
import SearchResults from './SearchResults';
import './SearchForm.css';

interface FileResult {
  name: string;
  path: string;
}

const SearchBar = () => {
  const [query, setQuery] = useState('');
  const [files, setFiles] = useState<FileResult[]>([]);
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const searchTimeoutRef = useRef<number | undefined>(undefined);

  const fetchFiles = async (searchTerm: string) => {
    if (!searchTerm.trim()) {
      setFiles([]);
      setMessage('');
      setError('');
      setLoading(false);
      return;
    }
    setLoading(true);
    setError('');
    setMessage('');
    setFiles([]);

    try {
      const response = await fetch(
        `http://localhost:8081/file/search?fileName=${encodeURIComponent(
          searchTerm
        )}`
      );
      if (!response.ok) throw new Error('Server error');
      const data = await response.json();
      const formatted = data.files.map((filePath: string) => {
        const name = filePath.split('/').pop() || filePath;
        return { name, path: filePath };
      });
      interface FormattedFile {
        name: string;
        path: string;
      }
      
      const filtered: FormattedFile[] = formatted.filter((f: FormattedFile) =>
        f.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFiles(filtered);
      setMessage(
        data.message || `Found ${filtered.length} file${filtered.length === 1 ? '' : 's'}`
      );
    } catch (err) {
      setError('Not found');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setQuery(newValue);

    if(searchTimeoutRef.current){
      window.clearTimeout(searchTimeoutRef.current);
    }

    if(newValue.trim()){
      setMessage("Waiting for results...");
    }

    searchTimeoutRef.current = window.setTimeout(() => {
      fetchFiles(newValue);
    }, 1000);
  };

  const handleSubmit = (e:React.FormEvent) => {
    e.preventDefault();

    if(searchTimeoutRef.current){
      window.clearTimeout(searchTimeoutRef.current);
    }
    
    fetchFiles(query);
  }

  const getFileIcon = (fileName: string) => {
    const extension = fileName.split('.').pop()?.toLowerCase() || '';
    switch (extension) {
      case 'jpg':
      case 'jpeg':
      case 'png':
      case 'gif':
        return '🖼️';
      case 'pdf':
        return '📄';
      case 'doc':
      case 'docx':
        return '📝';
      case 'xls':
      case 'xlsx':
        return '📊';
      case 'mp4':
      case 'mov':
      case 'avi':
        return '🎬';
      case 'mp3':
      case 'wav':
        return '🎵';
      default:
        return '📁';
    }
  };

  return (
    <div className="search-container">
      <form className="input-wrapper" onSubmit={handleSubmit}>
        <span id="search-icon">🔍</span>
        <input
          type="text"
          placeholder="Search for files..."
          value={query}
          onChange={handleChange}
        />
        <button type="submit" className="search-button" style={{ display: 'none' }}>
          Search
        </button>
      </form>
      
      {error && <div className="error-message">{error}</div>}
      
      <SearchResults 
        files={files}
        message={message}
        loading={loading}
        getFileIcon={getFileIcon}
      />
    </div>
  );
};

export default SearchBar;