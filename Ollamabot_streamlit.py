import os
import pickle
import streamlit as st
from PyPDF2 import PdfReader
from sentence_transformers import SentenceTransformer
import chromadb
import requests

# ────────────── CONFIG ──────────────
PDF_FILE = "Zabbixlatest.pdf"
CACHE_FILE = "zabbix_cache.pkl"
OLLAMA_API_URL = "http://localhost:11434/api/generate"
OLLAMA_MODEL = "phi:latest"
EMBED_MODEL = "paraphrase-MiniLM-L3-v2"

# ────────────── FUNCTIONS ──────────────
@st.cache_resource
def initialize_models():
    """Initialize models and ChromaDB client (cached for performance)"""
    embedder = SentenceTransformer(EMBED_MODEL)
    client = chromadb.PersistentClient(path="./chromadb")
    collection = client.get_or_create_collection(name="zabbix_docs", metadata={"hnsw:space": "cosine"})
    session = requests.Session()
    session.headers.update({'Content-Type': 'application/json'})
    return embedder, client, collection, session

def load_pdf_chunks(pdf_path, chunk_size=200, overlap=20):
    """Extract and chunk text from PDF"""
    if not os.path.exists(pdf_path):
        st.error(f"❌ PDF file '{pdf_path}' not found!")
        return []
    
    try:
        reader = PdfReader(pdf_path)
        full_text = " ".join([page.extract_text() or "" for page in reader.pages])
        words = full_text.split()
        chunks = []
        for i in range(0, len(words), chunk_size - overlap):
            chunks.append(" ".join(words[i:i + chunk_size]))
        return chunks
    except Exception as e:
        st.error(f"❌ Error reading PDF: {e}")
        return []

def prepare_embeddings(embedder, collection):
    """Load or create embeddings and populate ChromaDB"""
    if os.path.exists(CACHE_FILE):
        with open(CACHE_FILE, "rb") as f:
            docs, embs = pickle.load(f)
        st.info("📁 Loaded embeddings from cache")
    else:
        docs = load_pdf_chunks(PDF_FILE)
        if not docs:
            return []
        
        st.info("🔄 Creating embeddings (this may take a moment)...")
        embs = embedder.encode(docs, show_progress_bar=True).tolist()
        
        with open(CACHE_FILE, "wb") as f:
            pickle.dump((docs, embs), f)
        st.info("💾 Embeddings cached for future use")

    # Clear and rebuild ChromaDB collection
    try:
        if collection.count() > 0:
            collection.delete(where={})
        
        ids = [f"chunk_{i}" for i in range(len(docs))]
        collection.add(documents=docs, embeddings=embs, ids=ids)
    except Exception as e:
        st.error(f"❌ Error populating ChromaDB: {e}")
        return []
    
    return docs

def retrieve_context(query, embedder, collection, top_k=3):
    """Retrieve relevant context from ChromaDB"""
    try:
        q_emb = embedder.encode([query]).tolist()[0]
        result = collection.query(query_embeddings=[q_emb], n_results=top_k, include=['documents'])
        docs = result['documents'][0]
        return " ".join(docs)
    except Exception as e:
        st.error(f"❌ Error retrieving context: {e}")
        return ""

def ask_ollama(prompt, session):
    """Send query to Ollama API"""
    payload = {"model": OLLAMA_MODEL, "prompt": prompt, "stream": False}
    try:
        response = session.post(OLLAMA_API_URL, json=payload, timeout=30)
        response.raise_for_status()
        data = response.json()
        return data.get("response", "⚠️ No response from Ollama.")
    except requests.exceptions.ConnectionError:
        return "❌ Cannot connect to Ollama. Make sure Ollama is running on localhost:11434"
    except requests.exceptions.Timeout:
        return "❌ Request timed out. Ollama might be busy."
    except Exception as e:
        return f"❌ Ollama API error: {e}"

# ────────────── STREAMLIT UI ──────────────
def main():
    st.set_page_config(page_title="Zabbix RAG Chatbot", page_icon="🤖")
    st.title("🤖 Zabbix RAG Chatbot")
    
    # Initialize models and components
    try:
        embedder, client, collection, session = initialize_models()
    except Exception as e:
        st.error(f"❌ Failed to initialize models: {e}")
        st.stop()
    
    # Initialize chat history
    if 'chat_history' not in st.session_state:
        st.session_state['chat_history'] = []
    
    # Sidebar controls
    with st.sidebar:
        st.header("⚙️ Controls")
        
        if st.button("🗑️ Clear Chat History"):
            st.session_state['chat_history'] = []
            st.rerun()
        
        if st.button("🔄 Reload Embeddings"):
            if os.path.exists(CACHE_FILE):
                os.remove(CACHE_FILE)
            st.rerun()
        
        st.header("📊 Info")
        st.info(f"**Model:** {OLLAMA_MODEL}")
        st.info(f"**Embedder:** {EMBED_MODEL}")
    
    # Load embeddings (once per session)
    if 'docs_loaded' not in st.session_state:
        with st.spinner("🔄 Loading embeddings..."):
            docs = prepare_embeddings(embedder, collection)
            if docs:
                st.session_state['docs_loaded'] = True
                st.session_state['num_chunks'] = len(docs)
                st.success(f"✅ Loaded {len(docs)} chunks from PDF")
            else:
                st.error("❌ Failed to load PDF chunks. Please check the PDF file.")
                st.stop()
    else:
        st.success(f"✅ Ready! {st.session_state['num_chunks']} chunks loaded")
    
    # Chat interface
    st.header("💬 Chat")
    
    # Chat input
    user_query = st.text_input("Ask your Zabbix question:", key="user_input")
    
    col1, col2 = st.columns([1, 4])
    with col1:
        submit = st.button("🔍 Ask", type="primary")
    
    # Handle submission
    if submit and user_query.strip():
        with st.spinner("🤖 Generating answer..."):
            context = retrieve_context(user_query, embedder, collection)
            if context:
                prompt = f"""CONTEXT:
{context}

QUESTION: {user_query}

Based on the above context about Zabbix, provide a clear and concise answer. If the context doesn't contain relevant information, say so."""
                
                answer = ask_ollama(prompt, session)
            else:
                answer = "❌ Could not retrieve relevant context from the documents."
        
        # Add to chat history
        st.session_state['chat_history'].append(("You", user_query))
        st.session_state['chat_history'].append(("Bot", answer))
        
        # Clear input (rerun to refresh)
        st.rerun()
    
    # Display chat history
    if st.session_state['chat_history']:
        st.header("📝 Chat History")
        for i, (role, msg) in enumerate(reversed(st.session_state['chat_history'])):
            if role == "You":
                st.markdown(f"**🧑 You:** {msg}")
            else:
                st.markdown(f"**🤖 Bot:** {msg}")
            if i < len(st.session_state['chat_history']) - 1:
                st.divider()

if __name__ == "__main__":
    main()