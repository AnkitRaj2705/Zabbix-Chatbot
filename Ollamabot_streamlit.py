import os
import pickle
import streamlit as st
from PyPDF2 import PdfReader
from sentence_transformers import SentenceTransformer
import chromadb
import requests
import time
from typing import List, Tuple, Optional

# ────────────── CONFIG ──────────────
PDF_FILE = "Zabbixlatest.pdf"
CACHE_FILE = "zabbix_cache.pkl"
OLLAMA_API_URL = "http://localhost:11434/api/generate"
OLLAMA_MODEL = "phi:latest"
EMBED_MODEL = "paraphrase-MiniLM-L3-v2"
CHUNK_SIZE = 200
CHUNK_OVERLAP = 20
TOP_K_RESULTS = 3

# ────────────── FUNCTIONS ──────────────
@st.cache_resource
def initialize_models():
    """Initialize models and ChromaDB client (cached for performance)"""
    try:
        embedder = SentenceTransformer(EMBED_MODEL)
        client = chromadb.PersistentClient(path="./chromadb")
        collection = client.get_or_create_collection(
            name="zabbix_docs", 
            metadata={"hnsw:space": "cosine"}
        )
        session = requests.Session()
        session.headers.update({'Content-Type': 'application/json'})
        return embedder, client, collection, session
    except Exception as e:
        st.error(f"Failed to initialize models: {e}")
        raise e

def check_ollama_connection(session: requests.Session) -> bool:
    """Check if Ollama is running and accessible"""
    try:
        test_url = "http://localhost:11434/api/tags"
        response = session.get(test_url, timeout=5)
        return response.status_code == 200
    except:
        return False

def load_pdf_chunks(pdf_path: str, chunk_size: int = CHUNK_SIZE, overlap: int = CHUNK_OVERLAP) -> List[str]:
    """Extract and chunk text from PDF"""
    if not os.path.exists(pdf_path):
        st.error(f"❌ PDF file '{pdf_path}' not found!")
        st.info("Please ensure your PDF file is in the same directory as this script.")
        return []
    
    try:
        reader = PdfReader(pdf_path)
        full_text = ""
        
        # Extract text from all pages
        for page_num, page in enumerate(reader.pages):
            text = page.extract_text()
            if text:
                full_text += f" {text}"
        
        if not full_text.strip():
            st.error("❌ No text found in PDF. The PDF might be image-based or corrupted.")
            return []
        
        # Create chunks with overlap
        words = full_text.split()
        chunks = []
        
        for i in range(0, len(words), chunk_size - overlap):
            chunk = " ".join(words[i:i + chunk_size])
            if chunk.strip():  # Only add non-empty chunks
                chunks.append(chunk)
        
        return chunks
        
    except Exception as e:
        st.error(f"❌ Error reading PDF: {e}")
        return []

def prepare_embeddings(embedder: SentenceTransformer, collection) -> List[str]:
    """Load or create embeddings and populate ChromaDB"""
    docs = []
    
    # Try to load from cache first
    if os.path.exists(CACHE_FILE):
        try:
            with open(CACHE_FILE, "rb") as f:
                docs, embs = pickle.load(f)
            st.info(f"📁 Loaded {len(docs)} chunks from cache")
        except Exception as e:
            st.warning(f"⚠️ Cache file corrupted, recreating embeddings: {e}")
            if os.path.exists(CACHE_FILE):
                os.remove(CACHE_FILE)
    
    # Create new embeddings if cache doesn't exist or failed to load
    if not docs:
        docs = load_pdf_chunks(PDF_FILE)
        if not docs:
            return []
        
        st.info(f"🔄 Creating embeddings for {len(docs)} chunks (this may take a moment)...")
        progress_bar = st.progress(0)
        
        try:
            embs = embedder.encode(docs, show_progress_bar=False).tolist()
            progress_bar.progress(100)
            
            # Cache the results
            with open(CACHE_FILE, "wb") as f:
                pickle.dump((docs, embs), f)
            st.info("💾 Embeddings cached for future use")
            
        except Exception as e:
            st.error(f"❌ Error creating embeddings: {e}")
            return []

    # Clear and rebuild ChromaDB collection
    try:
        if collection.count() > 0:
            collection.delete(where={})
        
        # Load embeddings if we only loaded docs from cache
        if 'embs' not in locals():
            with open(CACHE_FILE, "rb") as f:
                docs, embs = pickle.load(f)
        
        ids = [f"chunk_{i}" for i in range(len(docs))]
        collection.add(documents=docs, embeddings=embs, ids=ids)
        
    except Exception as e:
        st.error(f"❌ Error populating ChromaDB: {e}")
        return []
    
    return docs

def retrieve_context(query: str, embedder: SentenceTransformer, collection, top_k: int = TOP_K_RESULTS) -> str:
    """Retrieve relevant context from ChromaDB"""
    try:
        q_emb = embedder.encode([query]).tolist()[0]
        result = collection.query(
            query_embeddings=[q_emb], 
            n_results=top_k, 
            include=['documents']
        )
        
        if result['documents'] and result['documents'][0]:
            docs = result['documents'][0]
            return "\n\n".join(docs)
        else:
            return ""
            
    except Exception as e:
        st.error(f"❌ Error retrieving context: {e}")
        return ""

def ask_ollama(prompt: str, session: requests.Session) -> str:
    """Send query to Ollama API"""
    payload = {
        "model": OLLAMA_MODEL, 
        "prompt": prompt, 
        "stream": False,
        "options": {
            "temperature": 0.7,
            "top_p": 0.9,
            "num_ctx": 4096
        }
    }
    
    try:
        response = session.post(OLLAMA_API_URL, json=payload, timeout=60)
        response.raise_for_status()
        data = response.json()
        return data.get("response", "⚠️ No response from Ollama.")
        
    except requests.exceptions.ConnectionError:
        return "❌ Cannot connect to Ollama. Please ensure:\n1. Ollama is installed and running\n2. Run 'ollama serve' in terminal\n3. The model 'phi:latest' is available"
    except requests.exceptions.Timeout:
        return "❌ Request timed out. The query might be too complex or Ollama is busy."
    except requests.exceptions.HTTPError as e:
        return f"❌ HTTP Error: {e}. Check if the model '{OLLAMA_MODEL}' is available."
    except Exception as e:
        return f"❌ Ollama API error: {e}"

def display_chat_message(role: str, message: str):
    """Display a chat message with proper formatting"""
    if role == "You":
        with st.chat_message("user"):
            st.write(message)
    else:
        with st.chat_message("assistant"):
            st.write(message)

# ────────────── STREAMLIT UI ──────────────
def main():
    # Page configuration
    st.set_page_config(
        page_title="Zabbix RAG Chatbot",
        page_icon="🤖",
        layout="wide",
        initial_sidebar_state="expanded"
    )
    
    st.title("🤖 Zabbix RAG Chatbot")
    st.markdown("Ask questions about Zabbix based on your PDF documentation!")
    
    # Initialize models and components
    try:
        with st.spinner("🔄 Initializing models..."):
            embedder, client, collection, session = initialize_models()
    except Exception as e:
        st.error(f"❌ Failed to initialize: {e}")
        st.stop()
    
    # Initialize chat history
    if 'chat_history' not in st.session_state:
        st.session_state['chat_history'] = []
    
    # Sidebar controls
    with st.sidebar:
        st.header("⚙️ Controls")
        
        # Check Ollama connection
        if st.button("🔍 Check Ollama Connection"):
            if check_ollama_connection(session):
                st.success("✅ Ollama is running!")
            else:
                st.error("❌ Cannot connect to Ollama")
                st.info("Make sure to run: `ollama serve` in terminal")
        
        if st.button("🗑️ Clear Chat History"):
            st.session_state['chat_history'] = []
            st.rerun()
        
        if st.button("🔄 Reload Embeddings"):
            if os.path.exists(CACHE_FILE):
                os.remove(CACHE_FILE)
            # Clear the docs_loaded flag to force reload
            if 'docs_loaded' in st.session_state:
                del st.session_state['docs_loaded']
            st.rerun()
        
        st.header("📊 Configuration")
        st.info(f"**Model:** {OLLAMA_MODEL}")
        st.info(f"**Embedder:** {EMBED_MODEL}")
        st.info(f"**PDF File:** {PDF_FILE}")
        st.info(f"**Chunk Size:** {CHUNK_SIZE}")
        st.info(f"**Top-K Results:** {TOP_K_RESULTS}")
        
        # Display connection status
        st.header("🔗 Status")
        if check_ollama_connection(session):
            st.success("🟢 Ollama Connected")
        else:
            st.error("🔴 Ollama Disconnected")
    
    # Load embeddings (once per session)
    if 'docs_loaded' not in st.session_state:
        with st.spinner("🔄 Loading and processing PDF..."):
            docs = prepare_embeddings(embedder, collection)
            if docs:
                st.session_state['docs_loaded'] = True
                st.session_state['num_chunks'] = len(docs)
                st.success(f"✅ Successfully loaded {len(docs)} chunks from PDF")
            else:
                st.error("❌ Failed to load PDF chunks. Please check your PDF file.")
                st.info("Make sure 'Zabbixlatest.pdf' is in the same directory as this script.")
                st.stop()
    else:
        st.success(f"✅ Ready! {st.session_state.get('num_chunks', 0)} chunks loaded")
    
    # Main chat interface
    st.header("💬 Chat Interface")
    
    # Display chat history
    for role, message in st.session_state['chat_history']:
        display_chat_message(role, message)
    
    # Chat input
    user_query = st.chat_input("Ask your Zabbix question here...")
    
    # Handle user input
    if user_query:
        # Display user message
        display_chat_message("You", user_query)
        
        # Add user message to history
        st.session_state['chat_history'].append(("You", user_query))
        
        # Generate response
        with st.spinner("🤖 Generating answer..."):
            # Retrieve relevant context
            context = retrieve_context(user_query, embedder, collection)
            
            if context:
                # Create prompt with context
                prompt = f"""You are a helpful Zabbix expert assistant. Based on the provided context from Zabbix documentation, answer the user's question clearly and concisely.

CONTEXT:
{context}

QUESTION: {user_query}

INSTRUCTIONS:
- Provide a clear, accurate answer based on the context
- If the context doesn't contain enough information, say so
- Include specific details and examples when available
- Format your response in a readable way

ANSWER:"""
                
                answer = ask_ollama(prompt, session)
            else:
                answer = "❌ I couldn't find relevant information in the Zabbix documentation for your question. Please try rephrasing your question or check if the topic is covered in the PDF."
        
        # Display assistant response
        display_chat_message("Bot", answer)
        
        # Add assistant response to history
        st.session_state['chat_history'].append(("Bot", answer))
        
        # Rerun to update the display
        st.rerun()
    
    # Footer
    st.markdown("---")
    st.markdown("*Powered by Ollama, SentenceTransformers, and ChromaDB*")

if __name__ == "__main__":
    main()