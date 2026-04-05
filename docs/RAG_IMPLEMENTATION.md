# NyayMitra RAG Implementation Guide

This document explains how Retrieval-Augmented Generation (RAG) is implemented in NyayMitra and how citation-backed rights are shown to users.

## 1. Current Mode

Current runtime mode is local chunking retrieval.

- Chunk source: local JSON index at backend/legal_knowledge_base/legal_rag_index.json
- Retriever: backend/services/legal_rag_service.py
- Answer generator: backend/services/ai_service.py
- API response includes citations[] and is returned by backend/routes/query_routes.py
- UI source cards render in app/results/page.tsx

Data Connect chunk schema and sync utilities may still exist in the repo, but runtime retrieval currently uses local index retrieval.

## 2. Legal Corpus

Ingestion pulls official law PDFs:

- Constitution_of_India
- BNS_2023
- BNSS_2023
- BSA_2023
- Contract_Act_1872

Source list is defined in backend/services/legal_rag_service.py under LATEST_INDIAN_LAWS.

## 3. Ingestion and Chunking

Run from project root:

1. cd backend
2. python ingest_legal_data.py

What happens:

- PDFs are downloaded to backend/legal_knowledge_base/
- Text is split using RecursiveCharacterTextSplitter
- Chunks are embedded using lightweight deterministic hashing
- Index is saved to backend/legal_knowledge_base/legal_rag_index.json
- Manifest cache is saved to backend/legal_knowledge_base/legal_rag_manifest.json

## 4. Retrieval Flow

At query time:

1. Chat sends user issue to POST /api/query/
2. AI service calls retrieve_legal_context(...)
3. Retriever ranks chunks by hybrid score:
   - cosine-like score from local embedding vectors
   - token overlap score
4. Top chunks are turned into citations with:
   - law_name
   - page
   - source_url
   - excerpt

If citations are weak or absent for the query/category, citations can be empty.

## 5. Citation to UI Flow

1. Backend returns citations in /api/query/ response JSON
2. Chat stores citations in localStorage key nyaymitra_citations
3. Results page reads nyaymitra_citations
4. Rights cards display source panel per card

If citation is missing for a right card, the fallback text is shown:

No verified source found for this right yet.

## 6. Verification Status in Data Connect

Query-level verification metadata is persisted in Data Connect UserQuery fields:

- ragVerificationStatus
- ragConfidence
- ragCitationsJson

This is for auditing/query history and does not control runtime retrieval mode currently.

## 7. Troubleshooting

### A. Ingestion is slow

- First run is expected to take time
- Re-run uses manifest cache when source PDFs are unchanged

### B. PDF parse warnings

The downloader validates PDF header and re-downloads invalid files.

### C. citations[] empty in API response

Check in order:

1. Index exists: backend/legal_knowledge_base/legal_rag_index.json
2. Query category is not overly restrictive in backend/services/ai_service.py ALLOWED_LAWS_BY_CATEGORY
3. Retriever threshold allows enough matches in backend/services/legal_rag_service.py
4. Test endpoint directly:
   - POST http://127.0.0.1:5000/api/query/
   - inspect citations[]

### D. Results page shows fallback source text

This means citations[] was empty or shorter than rights[] for that response.

## 8. Quick Test Commands

Backend health:

Invoke-WebRequest http://127.0.0.1:5000/health | Select-Object -ExpandProperty Content

RAG query test:

$body = @{
text = "My landlord is forcing me to vacate without notice"
selectedLanguage = "English"
intakeContext = @{
category = "tenancy"
followUpQuestion = "Any written notice received?"
followUpAnswer = "No written notice"
}
} | ConvertTo-Json -Depth 6

Invoke-RestMethod -Method Post -Uri http://127.0.0.1:5000/api/query/ -ContentType "application/json" -Body $body | ConvertTo-Json -Depth 8

## 9. Files You Will Usually Edit

- backend/services/legal_rag_service.py
- backend/services/ai_service.py
- backend/routes/query_routes.py
- backend/ingest_legal_data.py
- app/chat/page.tsx
- app/results/page.tsx
