import { useState } from 'react';
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

  const handleSearch = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!query.trim()) return;
    
    setLoading(true);
    setError('');
    setMessage('');
    setFiles([]);

    try {
      const response = await fetch(`http://localhost:8081/file/search?fileName=${encodeURIComponent(query)}`);
      if (!response.ok) throw new Error('Server error');

      const data = await response.json();
      setMessage(data.message || `Found ${data.files.length} files`);

      const formatted = data.files.map((filePath: string) => {
        const name = filePath.split('/').pop() || filePath;
        return { name, path: filePath };
      });

      setFiles(formatted);
    } catch (err) {
      setError('Something went wrong with the search');
    } finally {
      setLoading(false);
    }
  };

  const getFileIcon = (fileName: string) => {
    const extension = fileName.split('.').pop()?.toLowerCase() || '';
    
    switch(extension) {
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
      <form onSubmit={handleSearch} className="input-wrapper">
        <span id="search-icon">🔍</span>
        <input
          type="text"
          placeholder="Search for files..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        <button type="submit" className="search-button" disabled={loading}>
          {loading ? 'Searching...' : 'Search'}
        </button>
      </form>

      {error && <div className="error-message">{error}</div>}
      {message && <div className="result-message">{message}</div>}

      {files.length > 0 && (
        <div className="search-results">
          <h3>Results:</h3>
          <div className="file-grid">
            {files.map((file, index) => (
              <div className="file-card" key={index}>
                <div className="file-icon">{getFileIcon(file.name)}</div>
                <div className="file-name">{file.name}</div>
                <div className="file-path">{file.path}</div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default SearchBar;