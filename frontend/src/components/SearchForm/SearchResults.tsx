import React from 'react';
import './SearchResults.css';

interface FileResult {
  name: string;
  path: string;
}

interface SearchResultsProps {
  files: FileResult[];
  message: string;
  loading: boolean;
  error?: string;
  getFileIcon: (fileName: string) => string;
}

const SearchResults = React.memo(({ files, message, loading,error, getFileIcon }: SearchResultsProps) => {
  const getFileName = (path: string) => {
    const parts = path.split('/');
    return parts[parts.length - 1];
  };

  return (
    <div className="results-container">
      {error && <div className='result-error'>{error}</div>}
      {message && <div className="result-message">{message}</div>}
      
      {loading && (
        <div className="loading-indicator">
          <div className="spinner"></div>
          <span>Searching...</span>
        </div>
      )}
      
      {files.length > 0 && (
        <div className="search-results">
          <div className="icons-container">
            {files.map((file, index) => (
              <div className="icon-wrapper" key={index} title={getFileName(file.path)}>
                <div className="file-icon">{getFileIcon(file.name)}</div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
});

export default SearchResults;