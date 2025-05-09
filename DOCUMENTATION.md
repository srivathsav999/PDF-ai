# ai-planet-assignment Documentation

## Table of Contents
1. [Project Overview](#project-overview)
2. [Architecture](#architecture)
3. [Components](#components)
4. [Data Flow](#data-flow)
5. [API Documentation](#api-documentation)
6. [Setup and Installation](#setup-and-installation)
7. [Dependencies](#dependencies)

## Project Overview
This is a full-stack PDF Question & Answer application that allows users to upload PDF documents and ask questions about their content. The application uses AI technology to provide accurate answers based on the document's content.

## Architecture

### High-Level Architecture
```
ai-planet-assignment/
├── backend/              # FastAPI Backend
│   ├── main.py          # Main application entry point
│   ├── qa_engine.py     # Q&A processing logic
│   ├── database.py      # Database configuration
│   ├── models.py        # Data models
│   ├── utils.py         # Utility functions
│   └── uploads/         # PDF storage directory
│
└── frontend/            # React Frontend
    ├── src/
    │   ├── components/  # React components
    │   ├── services/    # API integration
    │   └── App.jsx      # Main application component
    └── public/          # Static assets
```

## Components

### Backend Components

1. **FastAPI Application (main.py)**
   - Handles HTTP requests
   - Manages file uploads
   - Routes API endpoints
   - Implements CORS and security measures

2. **Q&A Engine (qa_engine.py)**
   - Processes PDF documents
   - Integrates with LlamaIndex for text indexing
   - Handles question-answering logic
   - Manages context and embeddings

3. **Database Layer (database.py)**
   - SQLite database configuration
   - Async database operations
   - Connection pool management

4. **Data Models (models.py)**
   - Document model for PDF metadata
   - Q&A history tracking
   - Pydantic models for request/response validation

5. **Utilities (utils.py)**
   - PDF text extraction
   - File handling functions
   - Helper utilities

### Frontend Components

1. **File Upload Component**
   - Drag-and-drop interface
   - File validation
   - Upload progress tracking
   - Error handling

2. **Chat Interface**
   - Question input
   - Answer display
   - Chat history
   - Loading states

3. **API Service Layer**
   - Backend communication
   - Request/response handling
   - Error management
   - Response caching

## Data Flow

1. **PDF Upload Flow**
   ```mermaid
   sequenceDiagram
   participant User
   participant Frontend
   participant Backend
   participant Database
   participant QAEngine

   User->>Frontend: Uploads PDF
   Frontend->>Backend: POST /upload
   Backend->>Utils: Process PDF
   Utils->>Backend: Return extracted text
   Backend->>QAEngine: Index document
   Backend->>Database: Store metadata
   Backend->>Frontend: Return success
   Frontend->>User: Show confirmation
   ```

2. **Question-Answering Flow**
   ```mermaid
   sequenceDiagram
   participant User
   participant Frontend
   participant Backend
   participant QAEngine
   participant Database

   User->>Frontend: Asks question
   Frontend->>Backend: POST /ask
   Backend->>QAEngine: Process question
   QAEngine->>Backend: Generate answer
   Backend->>Database: Log Q&A
   Backend->>Frontend: Return answer
   Frontend->>User: Display answer
   ```

## API Documentation

### Endpoints

1. **Health Check**
   ```http
   GET /
   ```
   Returns the status of the backend server.

2. **Upload PDF**
   ```http
   POST /upload
   ```
   Upload and process a PDF document.

3. **Ask Question**
   ```http
   POST /ask
   ```
   Submit a question about uploaded documents.


## Setup and Installation

### Backend Setup
```bash
# Create virtual environment
python -m venv venv

# Activate virtual environment
source venv/bin/activate  # Unix/macOS
# or
venv\Scripts\activate     # Windows

# Install dependencies
pip install -r requirements.txt

# Start server
uvicorn main:app --reload
```

### Frontend Setup
```bash
# Install dependencies
npm install

# Start development server
npm run dev
```

## Dependencies

### Key Backend Dependencies
- FastAPI: Web framework
- LlamaIndex: Document indexing and Q&A
- PyMuPDF: PDF processing
- SQLAlchemy: Database ORM
- OpenAI: AI model integration

### Key Frontend Dependencies
- React: UI framework
- Axios: HTTP client
- TailwindCSS: Styling
- React Query: Data fetching

## Security Considerations

1. **File Upload Security**
   - File size limits
   - File type validation
   - Malware scanning (recommended)

2. **API Security**
   - Rate limiting
   - Input validation
   - CORS configuration

3. **Data Security**
   - Secure file storage
   - Database encryption
   - API key protection

## Error Handling

The application implements comprehensive error handling:

1. **Frontend Error Handling**
   - Network errors
   - File upload errors
   - Invalid input handling
   - User feedback

2. **Backend Error Handling**
   - Invalid requests
   - Processing errors
   - Database errors
   - File system errors
