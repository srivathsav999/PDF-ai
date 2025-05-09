import { useState, useRef, useEffect } from 'react';
import { askQuestion, uploadDocument } from '../services/api';

const ChatInterface = () => {
  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [currentFileName, setCurrentFileName] = useState('');
  const messagesEndRef = useRef(null);
  const fileInputRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!inputValue.trim()) return;

    const question = inputValue.trim();
    setInputValue('');
    
    // Add user message
    setMessages(prev => [...prev, { type: 'user', content: question }]);
    
    setIsLoading(true);
    try {
      const response = await askQuestion(question);
      setMessages(prev => [...prev, { type: 'bot', content: response.answer }]);
    } catch (error) {
      setMessages(prev => [...prev, { type: 'error', content: error.message }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file || file.type !== 'application/pdf') {
      setMessages(prev => [...prev, { 
        type: 'error', 
        content: 'Please upload a PDF file' 
      }]);
      setCurrentFileName('');
      return;
    }

    setIsUploading(true);
    setCurrentFileName(file.name);
    try {
      const response = await uploadDocument(file);
      setMessages(prev => [...prev, { 
        type: 'system', 
        content: `New document uploaded: ${file.name}` 
      }]);
    } catch (error) {
      setMessages(prev => [...prev, { 
        type: 'error', 
        content: error.message 
      }]);
      setCurrentFileName('');
    } finally {
      setIsUploading(false);
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  return (
    <div className="chat-container">
      <div className="chat-header">
        <h2>Chat</h2>
        {currentFileName && (
              <span className="current-file-name" title={currentFileName}>
                {currentFileName}
              </span>
            )}
        <div className="upload-button-container">
          <input
            type="file"
            accept=".pdf"
            onChange={handleFileUpload}
            ref={fileInputRef}
            style={{ display: 'none' }}
            disabled={isUploading}
          />
          <div className="upload-section">
            <button
              onClick={() => fileInputRef.current?.click()}
              className="upload-pdf-button"
              disabled={isUploading}
              title="Upload a new PDF"
            >
              {isUploading ? (
                <div className="spinner-small"></div>
              ) : (
                <>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                    <polyline points="17 8 12 3 7 8" />
                    <line x1="12" y1="3" x2="12" y2="15" />
                  </svg>
                  <span>Upload PDF</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      <div className="messages-container">
        {messages.map((message, index) => (
          <div
            key={index}
            className={`message ${message.type}`}
          >
            <div className="message-content">
              {message.type === 'user' && (
                <svg className="user-icon" viewBox="0 0 24 24" width="24" height="24">
                  <path fill="currentColor" d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
                </svg>
              )}
              {message.type === 'bot' && (
                <svg className="bot-icon" viewBox="0 0 24 24" width="24" height="24">
                  <path fill="currentColor" d="M20 2H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h14l4 4V4c0-1.1-.9-2-2-2zm-2 12H6v-2h12v2zm0-3H6V9h12v2zm0-3H6V6h12v2z"/>
                </svg>
              )}
              {message.type === 'system' && (
                <svg className="system-icon" viewBox="0 0 24 24" width="24" height="24">
                  <path fill="currentColor" d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/>
                </svg>
              )}
              <p>{message.content}</p>
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="message bot">
            <div className="message-content">
              <div className="typing-indicator">
                <span></span>
                <span></span>
                <span></span>
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>
      
      <form onSubmit={handleSubmit} className="input-container">
        <input
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          placeholder="Ask a question about your document..."
          disabled={isLoading}
        />
        <button type="submit" disabled={isLoading || !inputValue.trim()}>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <line x1="22" y1="2" x2="11" y2="13" />
            <polygon points="22 2 15 22 11 13 2 9 22 2" />
          </svg>
        </button>
      </form>
    </div>
  );
};

export default ChatInterface; 