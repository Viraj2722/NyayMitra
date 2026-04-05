from services.legal_rag_service import ingest_legal_data


if __name__ == "__main__":
    result = ingest_legal_data(force_download=False)
    print(f"RAG index ready. Total chunks: {result.get('total_chunks', 0)}")