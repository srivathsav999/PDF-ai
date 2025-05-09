from fastapi import FastAPI, UploadFile, File, HTTPException
import os
import logging
from fastapi.middleware.cors import CORSMiddleware
from database import init_db
from utils import extract_text_from_pdf
from models import Document
from database import SessionLocal
from sqlalchemy.future import select
from sqlalchemy.exc import SQLAlchemyError
from pydantic import BaseModel, Field
import mimetypes
from typing import Optional
from qa_engine import ask_question

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

app = FastAPI(
    title="ai-planet-assignment",
    description="API for uploading PDFs and asking questions about their content using AI",
    version="1.0.0"
)

@app.on_event("startup")
async def startup_event():
    try:
        await init_db()
        # Ensure upload directory exists
        os.makedirs(UPLOAD_DIR, exist_ok=True)
        logger.info("Application started successfully")
    except Exception as e:
        logger.error(f"Failed to initialize application: {str(e)}")
        raise

# CORS setup so frontend can talk to backend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Replace with frontend URL in production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def root():
    return {"message": "Backend is running!", "status": "healthy"}

UPLOAD_DIR = "uploads"
MAX_FILE_SIZE = 10 * 1024 * 1024  # 10MB

class FileValidationError(HTTPException):
    def __init__(self, detail: str):
        super().__init__(status_code=400, detail=detail)

@app.post("/upload", 
    summary="Upload a PDF file",
    response_description="File upload and processing status"
)
async def upload_pdf(file: UploadFile = File(...)):
    try:
        # Validate file type
        content_type = file.content_type
        if content_type != "application/pdf":
            raise FileValidationError(f"Invalid file type: {content_type}. Only PDF files are allowed.")

        # Validate file size
        file_size = 0
        contents = bytearray()
        
        # Read file in chunks to avoid memory issues
        chunk_size = 1024 * 1024  # 1MB chunks
        while True:
            chunk = await file.read(chunk_size)
            if not chunk:
                break
            file_size += len(chunk)
            if file_size > MAX_FILE_SIZE:
                raise FileValidationError(f"File size exceeds maximum limit of {MAX_FILE_SIZE/1024/1024}MB")
            contents.extend(chunk)

        # Validate filename
        if not file.filename:
            raise FileValidationError("No filename provided")

        # Process file
        file_path = os.path.join(UPLOAD_DIR, file.filename)
        base, extension = os.path.splitext(file.filename)
        
        # Ensure extension is .pdf
        if extension.lower() != '.pdf':
            raise FileValidationError("File must have .pdf extension")

        # Handle duplicate filenames
        counter = 1
        final_filename = file.filename
        
        async with SessionLocal() as session:
            while True:
                # Check filesystem
                if os.path.exists(file_path):
                    final_filename = f"{base}_{counter}{extension}"
                    file_path = os.path.join(UPLOAD_DIR, final_filename)
                    counter += 1
                    continue
                
                # Check database
                result = await session.execute(
                    select(Document).filter(Document.filename == final_filename)
                )
                if result.scalars().first() is not None:
                    final_filename = f"{base}_{counter}{extension}"
                    file_path = os.path.join(UPLOAD_DIR, final_filename)
                    counter += 1
                    continue
                    
                break  # Found a unique filename

        # Save file
        try:
            with open(file_path, "wb") as f:
                f.write(contents)
        except IOError as e:
            logger.error(f"Failed to save file: {str(e)}")
            raise HTTPException(status_code=500, detail="Failed to save file")

        # Extract text
        try:
            extracted_text = extract_text_from_pdf(file_path)
            if not extracted_text.strip():
                raise FileValidationError("No text could be extracted from the PDF")
        except Exception as e:
            logger.error(f"Failed to extract text from PDF: {str(e)}")
            # Clean up the file if text extraction fails
            os.remove(file_path)
            raise HTTPException(status_code=422, detail="Failed to extract text from PDF")

        # Save to database
        try:
            async with SessionLocal() as session:
                doc = Document(
                    filename=final_filename,
                    content=extracted_text
                )
                session.add(doc)
                await session.commit()
        except SQLAlchemyError as e:
            logger.error(f"Database error: {str(e)}")
            # Clean up the file if database operation fails
            os.remove(file_path)
            raise HTTPException(status_code=500, detail="Failed to save document to database")

        logger.info(f"Successfully processed file: {final_filename}")
        return {
            "message": "File uploaded and processed successfully",
            "filename": final_filename,
            "size": file_size,
            "text_length": len(extracted_text)
        }

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Unexpected error during file upload: {str(e)}")
        raise HTTPException(status_code=500, detail="An unexpected error occurred")

class Question(BaseModel):
    question: str = Field(..., min_length=1, max_length=1000, description="The question to ask about the document")

class Answer(BaseModel):
    answer: str
    document_name: Optional[str] = None
    confidence: Optional[float] = None

@app.post("/ask",
    response_model=Answer,
    summary="Ask a question about the uploaded document",
    response_description="Answer to the question based on document content"
)
async def ask_endpoint(q: Question):
    try:
        # Input validation
        if not q.question.strip():
            raise HTTPException(status_code=400, detail="Question cannot be empty")

        async with SessionLocal() as session:
            try:
                # Get the most recent document
                result = await session.execute(
                    select(Document).order_by(Document.id.desc()).limit(1)
                )
                latest_doc = result.scalars().first()

                if not latest_doc:
                    raise HTTPException(
                        status_code=404,
                        detail="No document found. Please upload a PDF first."
                    )

                # Validate document content
                if not latest_doc.content or not latest_doc.content.strip():
                    raise HTTPException(
                        status_code=422,
                        detail="The uploaded document contains no text content"
                    )

                # Use the document content for context
                try:
                    answer = ask_question(q.question, latest_doc.content)
                    return Answer(
                        answer=answer,
                        document_name=latest_doc.filename,
                        confidence=0.95  # This could be dynamic based on the model's confidence
                    )
                except Exception as e:
                    logger.error(f"Error in QA engine: {str(e)}")
                    raise HTTPException(
                        status_code=500,
                        detail="Failed to process question with QA engine"
                    )
            except SQLAlchemyError as e:
                logger.error(f"Database error in ask endpoint: {str(e)}")
                raise HTTPException(
                    status_code=500,
                    detail="Database error occurred while retrieving document"
                )

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Unexpected error in ask endpoint: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail="An unexpected error occurred while processing your question"
        )