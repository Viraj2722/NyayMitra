# NyayMitra RAG Implementation Guide

Last updated: 2026-04-05

This document describes the currently active RAG flow in NyayMitra.

## 1. Current Runtime Architecture

NyayMitra currently uses local-file RAG retrieval at runtime.

- Retriever module: backend/services/legal_rag_service.py
- AI orchestration: backend/services/ai_service.py
- Query API route: backend/routes/query_routes.py
- Ingestion entrypoint: backend/ingest_legal_data.py
- Local index path: backend/legal_knowledge_base/legal_rag_index.json
- Manifest cache: backend/legal_knowledge_base/legal_rag_manifest.json

Notes:

- Runtime retrieval is not using Firestore vectors or external vector DB.
- Citations are returned from the backend as citations in the query response.
- Results UI reads citations from localStorage key nyaymitra_citations.

## 2. Active Legal Corpus

The currently configured law sources are defined in LATEST_INDIAN_LAWS in backend/services/legal_rag_service.py:

- Constitution_of_India
- BNS_2023
- BNSS_2023
- BSA_2023
- Contract_Act_1872

## 3. Ingestion and Index Build

Run from backend folder:

1. python ingest_legal_data.py

Ingestion behavior:

- Downloads PDFs into backend/legal_knowledge_base/
- Splits text with RecursiveCharacterTextSplitter
- Builds deterministic local embeddings (hash-based)
- Writes index to legal_rag_index.json
- Writes source-state cache to legal_rag_manifest.json

When source-state has not changed, re-runs reuse cache and skip full rebuild.

## 4. Retrieval and Prompting Flow

At query time:

1. POST /api/query/ receives user text, language, and intake context.
2. backend/services/ai_service.py calls retrieve_legal_context(...).
3. Retriever scores chunks with a hybrid score:
   - embedding cosine score
   - token overlap score
4. Top legal snippets are inserted into Gemini prompt context.
5. Gemini returns structured JSON (response, category, rights, next_steps, emergency_numbers, map_search_query, citations).

## 5. Citation Flow to Frontend

1. Backend returns citations in /api/query/ response.
2. Chat page stores citations in localStorage (nyaymitra_citations).
3. Results page reads nyaymitra_citations and maps citations to rights cards.
4. If a right has no citation, fallback text is shown.

Current fallback text on rights card:

No verified source found for this right yet.

## 6. Data Connect Verification Metadata

The chat client writes verification metadata to Data Connect when creating UserQuery records:

- ragVerificationStatus
- ragConfidence
- ragCitationsJson

These fields are audit metadata and do not drive runtime retrieval.

## 7. Known Operational Constraints

- Some government PDF URLs can intermittently fail due to host availability or certificate issues.
- The local RAG pipeline is optimized for reliability and determinism over semantic-embedding precision.
- Deprecated google.generativeai warnings may appear in scripts/services that still use that SDK path.

## 8. Troubleshooting

### A. citations is empty in /api/query/ response

Check:

1. backend/legal_knowledge_base/legal_rag_index.json exists and is non-empty
2. Intake category mapping allows relevant laws (backend/services/ai_service.py)
3. Retriever thresholds in backend/services/legal_rag_service.py are not filtering everything

### B. Ingestion produced zero chunks

Check:

1. PDF downloads succeeded
2. Files are valid PDFs in backend/legal_knowledge_base/
3. Re-run with force-download logic if stale/invalid files are present

### C. Results page shows fallback citation text

This means citations array is empty or shorter than rights array for that response.

## 9. Quick Test Commands

Backend health:

Invoke-WebRequest http://127.0.0.1:5000/health | Select-Object -ExpandProperty Content

Query test:

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

## 10. Core Files

- backend/services/legal_rag_service.py
- backend/services/ai_service.py
- backend/routes/query_routes.py
- backend/ingest_legal_data.py
- app/chat/page.tsx
- app/results/page.tsx
