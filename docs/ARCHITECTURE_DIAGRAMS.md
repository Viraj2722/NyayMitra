# 🗺️ NyayMitra Application Flow & Architecture

## User Journey Flow

```
┌─────────────────────────────────────────────────────────────────┐
│                         START - Landing Page                     │
│                              (/)                                 │
└──────────────────────────┬──────────────────────────────────────┘
                           │
        ┌──────────────────┴──────────────────┐
        │                                     │
    ┌───▼────────┐                  ┌────────▼────┐
    │ New User?  │                  │  Returning? │
    │  Sign Up   │                  │   Login     │
    │ (/signup)  │                  │ (/login)    │
    └───┬────────┘                  └────────┬────┘
        │                                     │
        │         ┌─────────────────────────┘
        │         │
        │    ┌────▼──────────────────┐
        │    │ Email Authentication  │
        │    │ (Firebase Auth)        │
        │    └────┬──────────────────┘
        │         │
        └────────┬┴────────────────────────
                 │
            ┌────▼──────────────────────────┐
            │     Authenticated ✓           │
            │                               │
            │  Home Screen with Options     │
            └────┬──────────────────────────┘
                 │
        ┌────────┼────────┬────────────┐
        │        │        │            │
    ┌───▼──┐ ┌──▼───┐ ┌──▼────┐  ┌───▼────┐
    │ Chat │ │Admin │ │ View  │  │ View   │
    │(/chat)│ │(/top)│ │Appts  │  │  Map   │
    └───┬──┘ └──┬───┘ │(/appt)│  │ (/map) │
        │       │     └───────┘  └────────┘
        │       │
    ┌───▼───────▼──────────────────────────┐
    │    MAIN FLOW: Submit Legal Query      │
    └───────────────┬──────────────────────┘
                    │
            ┌───────▼──────────┐
            │  /chat Page      │
            │  • Text input    │
            │  • Voice input   │
            │  • Language sel  │
            │  • Anonymous tog │
            └───────┬──────────┘
                    │
            ┌───────▼────────────────────────────┐
            │   SEND TO BACKEND (/api/query/)    │
            └───────┬────────────────────────────┘
                    │
        ┌───────────┴──────────────────┐
        │                              │
    ┌───▼──────────────┐       ┌──────▼──────────┐
    │ Backend Process  │       │   Firestore     │
    │ • Detect Lang    │       │   Save Query    │
    │ • Translate      │       │   & Log         │
    │ • AI Response    │       └─────────────────┘
    │ • Categorize     │
    │ • Urgency Check  │
    │ • Find Centers   │
    └───┬──────────────┘
        │
        └────────┬─────────────────────────┐
                 │                         │
            ┌────▼──────────────┐     ┌───▼────────────┐
            │ Response to UI    │     │ Firestore      │
            │ • AI guidance     │     │ • Query saved  │
            │ • Category        │     │ • Log for      │
            │ • Urgency level   │     │   analytics    │
            │ • Nearest centers │     └────────────────┘
            └────┬──────────────┘
                 │
            ┌────▼──────────────────┐
            │   Auto Redirect to    │
            │   /results Page       │
            └────┬──────────────────┘
                 │
        ┌────────▼──────────────────────────┐
        │   /results: Legal Guidance Page    │
        │                                    │
        │  • Know Your Rights Cards ✓        │
        │  • Next Steps (Numbered) ✓         │
        │  • Embedded Map ✓                  │
        │  • Center List ✓                   │
        │  • "Book" Button on Each Center    │
        └────┬───────────────────────────────┘
             │
        ┌────▼──────────────────────┐
        │ User Clicks "Book" Button  │
        │                            │
        │ Modal Opens:               │
        │ ├─ Center Name (prefilled) │
        │ ├─ Your Name (prefilled)   │
        │ ├─ Phone Number (required) │
        │ ├─ Preferred Date (req'd)  │
        │ ├─ Preferred Time (opt'l)  │
        │ ├─ Issue Description (req) │
        │ └─ [Confirm Booking BTN]   │
        └────┬─────────────────────┘
             │
        ┌────▼─────────────────────────┐
        │  Form Validation             │
        │  • Phone: 10-13 digits       │
        │  • Date: Not in past         │
        │  • All required fields       │
        └────┬────────────────────────┘
             │
        ┌────▼────────────────────────────────┐
        │ Send to Firestore                   │
        │ POST /appointments collection       │
        │                                     │
        │ Data stored:                        │
        │ • user_id, center_id                │
        │ • name, phone                       │
        │ • issue_summary                     │
        │ • date, time                        │
        │ • status: "pending"                 │
        │ • created_at: timestamp             │
        └────┬────────────────────────────────┘
             │
        ┌────▼───────────────────┐
        │  Success Toast Shows    │
        │  ✓ "Appointment sent!"  │
        └────┬───────────────────┘
             │
        ┌────▼──────────────────────┐
        │  User Redirected to       │
        │  /appointments Dashboard  │
        │  (Shows all their bookings)
        └───────────────────────────┘
```

---

## Admin Dashboard Flow

```
┌──────────────────────────────────────┐
│  Login with admin@example.com        │
│  (/login)                            │
└──────────┬───────────────────────────┘
           │
    ┌──────▼──────────┐
    │ Email matches   │
    │ ADMIN_EMAIL?    │
    │ (hardcoded)     │
    └──────┬──────────┘
           │
    ┌──────▼──────────────────────┐
    │  Auto-redirect to /admin    │
    │  Admin Dashboard            │
    └──────┬──────────────────────┘
           │
    ┌──────▼───────────────────────────────┐
    │  Admin Dashboard Page (/admin)        │
    │                                       │
    │  LEFT SIDE:                           │
    │  ├─ Stats Summary Cards               │
    │  │  ├─ Total Centers: 6 ✓             │
    │  │  ├─ Total Queries: 7 ✓             │
    │  │  ├─ Urgent Cases: N                │
    │  │  └─ [Red Banner if any urgent]     │
    │  │                                    │
    │  ├─ Recent Queries Table              │
    │  │  ├─ Category | Urgency | Date      │
    │  │  ├─ [Labor | High | 3hrs ago]  ✓  │
    │  │  ├─ [Domestic | High | Today]  ✓  │
    │  │  └─ [Last 10 queries]              │
    │  │                                    │
    │  RIGHT SIDE:                          │
    │  ├─ Manage Legal Centers              │
    │  │  ├─ [List all 6 centers]       ✓  │
    │  │  ├─ ⚡ Add New Center Form          │
    │  │     └─ (Currently shows alert)     │
    │  └─ [Planned: Wire to Backend]        │
    │                                       │
    │  FEATURES:                            │
    │  ├─ Dark Mode Support          ✓      │
    │  ├─ Real-time Data Refresh     ✓      │
    │  ├─ Responsive Layout          ✓      │
    │  └─ Firebase Data Integration  ✓      │
    └───────────────────────────────────────┘
```

---

## Backend API Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     FLASK BACKEND                            │
│                  (http://127.0.0.1:5000)                     │
└──────────────────┬──────────────────────────────────────────┘
                   │
        ┌──────────┴──────────────┬──────────────┐
        │                         │              │
    ┌───▼────────────┐   ┌───────▼───────┐   ┌──▼──────────┐
    │ /health (GET)  │   │ /api/query/*  │   │ /api/       │
    │                │   │               │   │ centers/*   │
    │ Returns {      │   │ POST: Process │   │             │
    │  status: "ok"  │   │ query & save  │   │ GET: List   │
    │ }              │   │               │   │ all centers │
    │                │   │ GET/recent:   │   │             │
    │ (Health check) │   │ Last 10       │   │ (All demo   │
    └────────────────┘   │ queries       │   │  data from  │
                         └───┬───────────┘   │  seeding)   │
                             │               │             │
                             │               └──┬──────────┘
                             │                  │
                        ┌────▼──────────────────▼────────┐
                        │   BACKEND SERVICES             │
                        │                                │
                        │ 1. AI Response (Gemini API)    │
                        │ 2. Translation (Google Translate)
                        │ 3. Category Classification      │
                        │ 4. Urgency Detection            │
                        │ 5. Center Matching/Search       │
                        └────┬─────────────────────────────┘
                             │
                        ┌────▼──────────────┐
                        │   FIRESTORE       │
                        │                   │
                        │ Write operations: │
                        │ • Save query      │
                        │ • Log interaction │
                        │ • Store results   │
                        │                   │
                        │ Read operations:  │
                        │ • Get centers     │
                        │ • Get recent      │
                        │ • Analytics       │
                        └───────────────────┘
```

---

## Firestore Data Model

```
┌─────────────────────────────────────────────────────────────┐
│              FIRESTORE DATABASE COLLECTIONS                 │
└─────────────────────────────────────────────────────────────┘

1️⃣  users/
    ├─ uid: String (Firebase Auth UID)
    ├─ name: String
    ├─ preferredLanguage: String ("en", "hi", "mr")
    ├─ mobile: String (contact number)
    └─ createdAt: Timestamp

2️⃣  centers/
    ├─ name: String ("Delhi Women Legal Aid Center")
    ├─ address: String ("Plot 57, Sector 17, Delhi")
    ├─ phone: String ("+91-11-4141-4141")
    ├─ latitude: Float (28.5921)
    ├─ longitude: Float (77.2064)
    ├─ freeServices: Boolean (true)
    ├─ categories: Array (["domestic", "women-rights"])
    ├─ timings: String ("Mon-Fri 10AM-6PM")
    ├─ description: String ("Specializes in women's legal issues...")
    └─ createdAt: Timestamp

3️⃣  queries/
    ├─ translated_keywords: String (privacy-protected snippet)
    ├─ language: String ("hi", "en", "mr")
    ├─ category: String ("labor", "domestic", "tenancy")
    ├─ urgency: String ("high", "normal", "low")
    ├─ isAnonymous: Boolean (true = no user_id stored)
    └─ created_at: Timestamp

4️⃣  appointments/
    ├─ user_id: String (optional, null if anonymous)
    ├─ center_id: String (references centers collection)
    ├─ name: String
    ├─ phone: String
    ├─ issue_summary: String
    ├─ date: String ("2026-04-15")
    ├─ time: String ("2:30 PM")
    ├─ status: String ("pending", "confirmed", "completed")
    └─ created_at: Timestamp

5️⃣  categories/
    ├─ name: String ("Labor & Workers' Rights")
    ├─ description: String
    └─ helpline: String ("1800-11-4141")
```

---

## Tech Stack Integration

```
┌─────────────────────────────────────────────────────────────┐
│                    FRONTEND LAYER                            │
│                  Next.js 16.2.2 + React 19                  │
│                   Tailwind CSS + Framer                      │
│                                                               │
│  ┌─────────────────────────────────────────────────┐        │
│  │ Pages (/app)                                    │        │
│  │ ├─ page.tsx          (Landing)                  │        │
│  │ ├─ login/page.tsx    (Auth)                     │        │
│  │ ├─ signup/page.tsx   (Registration)             │        │
│  │ ├─ chat/page.tsx     (Query Input)              │        │
│  │ ├─ results/page.tsx  (Guidance + Booking)       │        │
│  │ ├─ appointments/page.tsx (Dashboard) ✓ NEW     │        │
│  │ ├─ admin/page.tsx    (Admin Stats)              │        │
│  │ └─ map/page.tsx      (Map View)                 │        │
│  └─────────────────────────────────────────────────┘        │
│                                                               │
│  ┌─────────────────────────────────────────────────┐        │
│  │ Components                                      │        │
│  │ └─ Navbar.tsx (Navigation) ✓ UPDATED           │        │
│  └─────────────────────────────────────────────────┘        │
│                                                               │
│  ┌─────────────────────────────────────────────────┐        │
│  │ Context & State                                 │        │
│  │ └─ AuthContext.tsx (User Auth State)            │        │
│  └─────────────────────────────────────────────────┘        │
└──────────────────────┬────────────────────────────────────────┘
                       │ HTTP/REST (CORS Enabled)
                       │
┌──────────────────────▼──────────────────────────────────────┐
│                   BACKEND LAYER                             │
│              Flask + Python 3.8+                            │
│                                                              │
│  ┌─────────────────────────────────────────────────┐       │
│  │ API Endpoints (/routes)                         │       │
│  │ ├─ /api/query/ (POST - Process query)           │       │
│  │ ├─ /api/query/recent (GET - Last 10)            │       │
│  │ ├─ /api/centers/ (GET - All centers)            │       │
│  │ ├─ /api/appointments/ (POST - Book)             │       │
│  │ └─ /health (GET - Status check)                 │       │
│  └─────────────────────────────────────────────────┘       │
│                                                              │
│  ┌─────────────────────────────────────────────────┐       │
│  │ Services (/services)                            │       │
│  │ ├─ ai_service.py (Gemini API calls)             │       │
│  │ ├─ translation_service.py (Language detection)  │       │
│  │ ├─ matching_service.py (Center search)          │       │
│  │ └─ urgency_detector.py (Risk flagging)           │       │
│  └─────────────────────────────────────────────────┘       │
└──────────────────────┬───────────────────────────────────────┘
                       │
        ┌──────────────┼──────────────┐
        │              │              │
    ┌───▼────────┐ ┌──▼───────┐  ┌──▼──────────┐
    │ Firestore  │ │ Gemini   │  │  Translate  │
    │ (Database) │ │ API      │  │  API        │
    │            │ │(AI Model)│  │(NLP)        │
    └────────────┘ └──────────┘  └─────────────┘
```

---

## Environment Setup Diagram

```
┌──────────────────────────────────────────────────────────────┐
│            ENVIRONMENT CONFIGURATION                          │
└──────────────────────────────────────────────────────────────┘

Frontend (.env.local in project root)
├─ NEXT_PUBLIC_FIREBASE_API_KEY = xxx
├─ NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN = xxx.firebaseapp.com
├─ NEXT_PUBLIC_FIREBASE_PROJECT_ID = your-project-id
├─ NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET = xxx.appspot.com
├─ NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID = xxx
├─ NEXT_PUBLIC_FIREBASE_APP_ID = xxx
└─ NEXT_PUBLIC_BACKEND_URL = http://127.0.0.1:5000

Backend (.env in backend/ directory)
├─ FIREBASE_CREDENTIALS_PATH = firebase_credentials.json
│  (downloaded from Firebase Console)
└─ GOOGLE_API_KEY = your_gemini_api_key

Firestore Setup
├─ Project ID: your-project-id
├─ Region: Asia-Southeast1
├─ Security Rules: Allow read/create (production: auth required)
└─ Collections: users, centers, queries, appointments, categories
```

---

## User Workflow (Visual)

```
🌍 USER VISIT YOUR PLATFORM
        ↓
    LANDING PAGE
   (Hero + Features)
        ↓
    ┌───┴────┐
    │        │
 SIGN-UP  LOG-IN
    │        │
    └───┬────┘
        ↓
AUTHENTICATED ✓
        ↓
    MENU OPTIONS
    ├─ 🎤 Chat (Ask Question)
    ├─ 📋 View Appointments
    └─ 👨‍💼 Admin Dashboard (if admin)
        ↓
  SUBMIT LEGAL QUERY
  (Text or Voice) 📱
        ↓
   BACKEND PROCESSES
   • AI Response
   • Category Detection
   • Urgency Check
   • Find Nearest Centers
        ↓
 VIEW LEGAL GUIDANCE
  (Know Your Rights)
        ↓
  BOOK APPOINTMENT
  (Select Center & Fill Form)
        ↓
  ✅ CONFIRMATION
  "Your appointment has been sent!"
        ↓
  VIEW IN DASHBOARD
  (/appointments)
        ↓
  🎉 SUCCESS!
  (Center will contact you)
```

---

## Data Flow (Technical)

```
User Input (Chat)
       ↓
React Component
(setMessages)
       ↓
fetch(/api/query/)
       ↓
Flask Backend
├─ detect_language()
├─ translate_to_english()
├─ generate_response(Gemini)
├─ classify_category()
├─ detect_urgency()
└─ get_nearest_centers()
       ↓
Save to Firestore
(queries collection)
       ↓
Return Response to Frontend
(AI guidance + centers)
       ↓
Display & Redirect
(/results page)
       ↓
User Books Appointment
(Modal Form Submission)
       ↓
Validate Form Data
       ↓
Save to Firestore
(appointments collection)
       ↓
Toast Notification ✓
       ↓
Redirect to Dashboard
(/appointments)
```

---

This diagram should help you visualize how all the pieces fit together! 🎯

