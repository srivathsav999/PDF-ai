import { useState, useEffect } from 'react';
import FileUpload from './components/FileUpload';
import ChatInterface from './components/ChatInterface';
import ThemeToggle from './components/ThemeToggle';
import './App.css';

function App() {
  const [hasDocument, setHasDocument] = useState(false);
  const [error, setError] = useState(null);
  const [isDarkTheme, setIsDarkTheme] = useState(() => {
    const savedTheme = localStorage.getItem('theme');
    return savedTheme ? savedTheme === 'dark' : window.matchMedia('(prefers-color-scheme: dark)').matches;
  });

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', isDarkTheme ? 'dark' : 'light');
    localStorage.setItem('theme', isDarkTheme ? 'dark' : 'light');
  }, [isDarkTheme]);

  const handleUploadSuccess = () => {
    setHasDocument(true);
    setError(null);
  };

  const handleUploadError = (errorMessage) => {
    setError(errorMessage);
  };

  const toggleTheme = () => {
    setIsDarkTheme(prev => !prev);
  };

  return (
    <div className="app">
      <header className="app-header">
        <h1>ai-planet-assignment</h1>
        <ThemeToggle isDark={isDarkTheme} onToggle={toggleTheme} />
      </header>

      <main className="app-main">
        {!hasDocument ? (
          <div className="upload-section">
            {error && <div className="error-message">{error}</div>}
            <FileUpload
              onUploadSuccess={handleUploadSuccess}
              onUploadError={handleUploadError}
            />
          </div>
        ) : (
          <ChatInterface />
        )}
      </main>
    </div>
  );
}

export default App;
