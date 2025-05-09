import os
import dotenv
from llama_index.core import VectorStoreIndex, Document as LlamaDocument, Settings
from llama_index.llms.openai import OpenAI
from llama_index.embeddings.openai import OpenAIEmbedding
from database import SessionLocal
from sqlalchemy.future import select
from sqlalchemy import desc
from models import Document

# Load environment variables
dotenv.load_dotenv()
openai_api_key = os.getenv("OPENAI_API_KEY")

# Set up LLM and embedding model
llm = OpenAI(api_key=openai_api_key, model="gpt-4")
embed_model = OpenAIEmbedding(api_key=openai_api_key)

Settings.llm = llm
Settings.embed_model = embed_model

async def fetch_latest_document_content():
    """Fetch the content of the most recently uploaded document."""
    async with SessionLocal() as session:
        result = await session.execute(
            select(Document).order_by(desc(Document.upload_time)).limit(1)
        )
        latest_doc = result.scalars().first()
        return latest_doc.content if latest_doc else None

def create_index_from_document(content):
    """Create a vector index from document content."""
    if not content:
        raise ValueError("No document content provided.")
    
    doc = LlamaDocument(text=content)
    index = VectorStoreIndex.from_documents([doc])
    return index

def ask_question(question: str, context: str) -> str:
    """Answer a question based on document context using LlamaIndex."""
    try:
        # Create index from the document content
        index = create_index_from_document(context)
        
        # Create a query engine
        query_engine = index.as_query_engine()
        
        # Get the response
        response = query_engine.query(question)
        
        return str(response)
    except Exception as e:
        return f"Error processing your question: {str(e)}"