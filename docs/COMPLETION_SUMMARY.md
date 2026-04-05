# NyayMitra Completion Summary

Last updated: 2026-04-05

## Current Product Status

NyayMitra is running as a multilingual legal-aid assistant with:

- Next.js frontend for intake, results, map, appointments, and admin views
- Flask backend APIs for query analysis, center retrieval, and appointments
- Gemini-powered legal guidance generation
- Local-file RAG retrieval for legal grounding and citations
- Firestore for runtime records
- Firebase Data Connect for profile and query metadata

## What Is Active Right Now

### Query pipeline

- Endpoint: POST /api/query/
- Flow:
  1. Detect language
  2. Translate to English for analysis
  3. Generate structured legal guidance with citations
  4. Detect urgency
  5. Match legal centers
  6. Persist live query record to Firestore

### RAG mode

- Active mode: local retrieval from backend/legal_knowledge_base/legal_rag_index.json
- Retriever implementation: backend/services/legal_rag_service.py
- AI integration: backend/services/ai_service.py
- Ingestion entrypoint: backend/ingest_legal_data.py

### Frontend citation behavior

- Chat stores citations in localStorage key nyaymitra_citations
- Results page displays citation snippets per right card when available
- Fallback text is shown when a matching citation is unavailable

## Data Stores

- Firestore collections used at runtime:
  - live_queries
  - centers
  - appointments
- Data Connect stores user/query relational metadata and RAG verification fields

## Operational Notes

- Local RAG ingestion depends on upstream government PDF availability
- Some scripts and older docs referenced in prior iterations are not part of the current active path
- Deprecated SDK warnings may appear where google.generativeai is still in use

## Recommended Verification

1. Run backend: python backend/app.py
2. Run frontend: npm run dev
3. Submit a chat query and confirm:
   - response text
   - rights and next steps
   - citations in response payload
4. Open results page and verify citation rendering on rights cards
5. Check /api/query/recent for persisted live query records
