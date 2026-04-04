# NyayMitra Working Guide

This document explains how the application works end-to-end: user flow, frontend/backend interaction, AI processing, and data storage.

## 1. What the app does

NyayMitra helps users describe legal issues in natural language (including Indian languages), get AI-based legal guidance, and connect with nearby legal aid centers.

Main capabilities:

- User authentication and profile handling
- Multilingual legal query intake (text + optional voice)
- AI analysis (category, rights, next steps, urgency)
- Legal aid center matching
- Appointment booking and status tracking
- Admin-facing operational visibility

## 2. High-level architecture

- Frontend: Next.js app in app/ and components/
- Backend API: Flask app in backend/
- AI + language pipeline: backend/services/
- Persistence:
- Firebase Data Connect (client-side user/query profile integrations)
- Firestore (live queries, centers, appointments)

Runtime split:

- Next.js frontend runs on port 3000
- Flask backend runs on port 5000

## 3. Frontend working

### 3.1 Authentication and session

- Auth state is managed using context/AuthContext.tsx.
- Unauthenticated users are redirected to login on protected pages (for example chat page).
- User metadata (language/mobile/profile sync) is coordinated through lib/dataConnect.ts and Firebase/Data Connect utilities.

### 3.2 Chat intake flow (app/chat/page.tsx)

1. User lands on chat page.
2. Intake options are selected (legal category + follow-up answer).
3. User writes or dictates legal issue text.
4. Location can be captured for better center matching.
5. Client sends POST request to backend /api/query/ with:

- text
- selected language
- intake context
- location coordinates (if available)
- anonymity preference

6. Frontend also maintains session continuity in sessionStorage for a smoother multi-step UX.

### 3.3 Results flow (app/results/page.tsx)

- Results page loads AI output and center recommendations from storage/backend response.
- It normalizes rights, steps, emergency numbers, and center objects for robust rendering.
- If urgency is high, emergency support actions are surfaced prominently.
- User can open Google Maps for a center.
- User can open appointment modal and submit booking details.

### 3.4 Appointments and admin

- app/appointments/page.tsx displays user appointments and statuses.
- app/admin/page.tsx shows operational/admin data views (queries, centers, urgency snapshots depending on loaded data).

## 4. Backend working

Backend entry point: backend/app.py

- Initializes Firebase Admin SDK (credential path or default initialization)
- Registers API blueprints:
- /api/query
- /api/centers
- /api/appointments
- Exposes /health endpoint

### 4.1 Query API (backend/routes/query_routes.py)

POST /api/query/ processing pipeline:

1. Validate query text.
2. Detect language.
3. Translate input to English for AI processing.
4. Generate analytical AI response (rights, steps, category, emergency metadata).
5. Detect urgency.
6. Resolve legal category (intake category has priority over AI fallback).
7. Fetch nearest/relevant centers using category + coordinates.
8. Persist live query to Firestore (live_queries collection).
9. Return structured response to frontend.

Other endpoints:

- POST /api/query/translate-ui: translation utility for UI entries
- GET /api/query/recent: recent query feed

### 4.2 Centers API (backend/routes/center_routes.py)

- GET /api/centers/: fetches centers from Firestore and returns sorted list.
- POST /api/centers/: creates a center with required fields and optional metadata.

### 4.3 Appointments API (backend/routes/appointment_routes.py)

- POST /api/appointments/: create appointment
- GET /api/appointments/recent: list recent appointments
- GET /api/appointments/mine?user_id=...: list user appointments
- GET /api/appointments/<id>: get one appointment
- PATCH /api/appointments/<id>: update selected fields
- DELETE /api/appointments/<id>: soft-cancel (status -> cancelled)

## 5. AI and support services

Core services in backend/services/:

- ai_service.py: structured legal guidance generation
- translation_service.py: language detection and translation helpers
- matching_service.py: legal-aid center ranking/matching

Utility:

- utils/urgency_detector.py: classifies risky/emergency patterns in user text

## 6. Data flow summary

1. User submits issue from chat UI.
2. Backend analyzes and enriches query.
3. Backend stores query event in Firestore.
4. Frontend renders:

- legal rights
- suggested next steps
- urgency state
- center recommendations

5. User books appointment.
6. Appointment is stored in Firestore and shown in user dashboard.

## 7. How to run locally

Prerequisites:

- Node.js 18+
- Python 3.8+
- Project .env configured
- Firebase credentials available for backend (if Firestore access is required)

### Start backend

From backend/:

- pip install -r requirements.txt
- python app.py

Expected:

- Flask starts at http://127.0.0.1:5000
- GET /health returns status ok

### Start frontend

From project root:

- npm install
- npm run dev

Expected:

- Next.js starts at http://localhost:3000

## 8. Quick verification checklist

- Login/signup works.
- Chat accepts multilingual input.
- Query submission returns response and navigates to results.
- Rights/steps/centers render on results page.
- Appointment can be created.
- Appointment appears in appointments dashboard.
- /health endpoint responds from backend.

## 9. Common failure points

- Missing or invalid env keys for Firebase, Gemini, or Maps.
- Backend running without valid Firebase Admin credentials (Firestore reads/writes fail or fallback behavior appears).
- Frontend env changes not reflected until Next.js dev server restart.

## 10. File map for core logic

- Frontend shell: app/layout.tsx
- Landing: app/page.tsx
- Chat intake: app/chat/page.tsx
- Results and booking: app/results/page.tsx
- Appointments dashboard: app/appointments/page.tsx
- Auth context: context/AuthContext.tsx
- Language context: context/LanguageContext.tsx
- Data Connect helpers: lib/dataConnect.ts
- Backend entry: backend/app.py
- Query routes: backend/routes/query_routes.py
- Center routes: backend/routes/center_routes.py
- Appointment routes: backend/routes/appointment_routes.py
- AI service: backend/services/ai_service.py
- Translation service: backend/services/translation_service.py
- Matching service: backend/services/matching_service.py
- Urgency utility: backend/utils/urgency_detector.py
