import { useState, useCallback } from 'react';
import { uploadDocument } from '../services/api';

const FileUpload = ({ onUploadSuccess, onUploadError }) => {
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  const handleDragOver = useCallback((e) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback(async (e) => {
    e.preventDefault();
    setIsDragging(false);
    
    const file = e.dataTransfer.files[0];
    if (file && file.type === 'application/pdf') {
      await handleFileUpload(file);
    } else {
      onUploadError('Please upload a PDF file');
    }
  }, [onUploadError]);

  const handleFileSelect = useCallback(async (e) => {
    const file = e.target.files[0];
    if (file && file.type === 'application/pdf') {
      await handleFileUpload(file);
    } else {
      onUploadError('Please upload a PDF file');
    }
  }, [onUploadError]);

  const handleFileUpload = async (file) => {
    try {
      setIsUploading(true);
      const response = await uploadDocument(file);
      onUploadSuccess(response);
    } catch (error) {
      onUploadError(error.message);
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div
      className={`upload-container ${isDragging ? 'dragging' : ''} ${isUploading ? 'uploading' : ''}`}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      <div className="upload-content">
        {isUploading ? (
          <div className="upload-loading">
            <div className="spinner"></div>
            <p>Uploading document...</p>
          </div>
        ) : (
          <>
            <svg
              className="upload-icon"
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
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
              <polyline points="17 8 12 3 7 8" />
              <line x1="12" y1="3" x2="12" y2="15" />
            </svg>
            <p>Drag and drop your PDF here or</p>
            <label className="upload-button">
              Browse Files
              <input
                type="file"
                accept=".pdf"
                onChange={handleFileSelect}
                style={{ display: 'none' }}
              />
            </label>
          </>
        )}
      </div>
    </div>
  );
};

export default FileUpload; 