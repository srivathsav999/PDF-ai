# PDF-ai

A modern web application that allows users to upload PDF documents and ask questions about their content using AI-powered analysis. The application features a React frontend and FastAPI backend with real-time question answering capabilities.

## Features

-  PDF Document Upload
  - Drag-and-drop interface
  - Automatic text extraction
  - Duplicate file handling
  
-  Interactive Chat Interface
  - Real-time question answering
  - Context-aware responses
  - Clean and intuitive UI
  
-  AI-Powered Analysis
  - Advanced text processing
  - Intelligent question understanding
  - Context-based answer generation

## Tech Stack

### Frontend
- React
- Modern CSS with CSS Variables
- Responsive Design
- File Upload with Drag & Drop

### Backend
- FastAPI
- SQLAlchemy (Async)
- LlamaIndex for document processing
- OpenAI integration for Q&A
- PDF text extraction

## Getting Started

### Prerequisites
- Python 3.8+
- Node.js 14+
- OpenAI API key

### Backend Setup

1. Create a virtual environment:
```bash
cd backend
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

2. Install dependencies:
```bash
pip install -r requirements.txt
```

3. Create a `.env` file in the backend directory:
```env
OPENAI_API_KEY=your_api_key_here
```

4. Run the backend server:
```bash
uvicorn main:app --reload
```

### Frontend Setup
open a new terminal and follow the steps bellow 

1. Install dependencies:
```bash
cd frontend
npm install
```

2. Run the development server:
```bash
npm run dev
```

## Project Structure

```
ai-planet-assignment/
├── backend/
│   ├── main.py           # FastAPI application
│   ├── qa_engine.py      # Q&A processing logic
│   ├── models.py         # Database models
│   ├── database.py       # Database configuration
│   ├── utils.py          # Utility functions
│   └── requirements.txt  # Python dependencies
│
└── frontend/
    ├── src/
    │   ├── components/   # React components
    │   ├── services/     # API integration
    │   └── App.jsx       # Main application
    └── package.json      # Node.js dependencies
```

## API Endpoints

- `GET /` - Health check endpoint
- `POST /upload` - Upload and process PDF documents
- `POST /ask` - Ask questions about the uploaded document


## License

This project is licensed under the MIT License - see the LICENSE file for details.


## Acknowledgments

- FastAPI for the Python web framework
- React for the frontend framework
- LlamaIndex for document processing capabilities
- OpenAI for the language model integration

## Backend API Documentation

The backend provides the following REST API endpoints with comprehensive error handling:

### Health Check
```http
GET /
```
Returns the status of the backend server.

**Response**
```json
{
    "message": "Backend is running!",
    "status": "healthy"
}
```

### Upload PDF
```http
POST /upload
```
Upload a PDF file for processing. The file will be saved locally and its text content will be extracted and stored in the database.

**Request**
- Content-Type: `multipart/form-data`
- Body: 
  - `file`: PDF file (required)
- Size Limit: 10MB

**Response**
```json
{
    "message": "File uploaded and processed successfully",
    "filename": "example.pdf",
    "size": 1048576,
    "text_length": 5000
}
```

**Error Responses**
- `400 Bad Request`:
  - Invalid file type (non-PDF)
  - File size exceeds limit
  - No filename provided
  - Invalid file extension
  - Empty PDF file
- `422 Unprocessable Entity`:
  - Failed to extract text from PDF
- `500 Internal Server Error`:
  - Failed to save file
  - Database error
  - Unexpected error

**Notes**
- Files are processed in chunks to handle large files efficiently
- Files are validated for type and content before processing
- Failed uploads are automatically cleaned up
- Duplicate filenames are handled by appending a counter

### Ask Question
```http
POST /ask
```
Ask a question about the most recently uploaded PDF document.

**Request**
- Content-Type: `application/json`
- Body:
```json
{
    "question": "What is the main topic of the document?"
}
```
- Question length: 1-1000 characters

**Response**
```json
{
    "answer": "The answer to your question based on the document content...",
    "document_name": "example.pdf",
    "confidence": 0.95
}
```

**Error Responses**
- `400 Bad Request`:
  - Empty question
  - Question too long/short
- `404 Not Found`:
  - No document available (need to upload first)
- `422 Unprocessable Entity`:
  - Document contains no text content
- `500 Internal Server Error`:
  - Database error
  - QA engine error
  - Unexpected error

## Technical Details

### Dependencies
- FastAPI for the backend API
- SQLite for document storage
- PyMuPDF for PDF processing
- LlamaIndex and OpenAI for Q&A functionality

### Database Schema
The application uses SQLite with the following schema:
- Table: `documents`
  - `id`: Primary key
  - `filename`: Name of the uploaded file
  - `content`: Extracted text content
  - `created_at`: Timestamp of upload

### Security Notes
- CORS is currently configured to accept requests from all origins (`*`)
- In production, `allow_origins` should be set to specific frontend URL(s)
- No authentication is currently implemented

## Setup and Configuration

1. Install dependencies:
```bash
pip install -r requirements.txt
```

2. Configure environment variables:
```bash
# Create .env file with:
OPENAI_API_KEY=your_api_key_here
```

3. Run the backend server:
```bash
uvicorn main:app --reload
```

The API will be available at `http://localhost:8000`

## API Documentation UI
FastAPI provides automatic interactive API documentation:
- Swagger UI: `http://localhost:8000/docs`
- ReDoc: `http://localhost:8000/redoc`

### Error Handling
The application implements comprehensive error handling:
- Input validation for all endpoints
- File validation (type, size, content)
- Database error handling with rollback
- Automatic cleanup of failed uploads
- Detailed error messages for debugging
- Structured logging for all operations 
