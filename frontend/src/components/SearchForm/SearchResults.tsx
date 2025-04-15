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
  getFileIcon: (fileName: string) => string;
}

const SearchResults = React.memo(({ files, message, loading, getFileIcon }: SearchResultsProps) => {
  return (
    <div className="results-container">
      {message && <div className="result-message">{message}</div>}
      
      {loading && (
        <div className="loading-indicator">
          <div className="spinner"></div>
        </div>
      )}
      
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
});

export default SearchResults;