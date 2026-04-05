# 🏛️ NyayMitra - Free Legal Aid Access Platform

**Democratizing Justice for India's Low-Income Citizens**

![Status](https://img.shields.io/badge/Status-MVP%20Ready-green)
![License](https://img.shields.io/badge/License-MIT-blue)
![Node](https://img.shields.io/badge/Node-18%2B-blue)
![Python](https://img.shields.io/badge/Python-3.8%2B-blue) ⚖️

**"AI-powered legal friend for every Indian who can't afford a lawyer."**

## What is NyayMitra?

India has 1.4 billion people but only 1.5 million lawyers. Legal aid exists, but nobody knows about it or how to access it. **NyayMitra** bridges that gap in the language the user actually speaks.

When users describe their problems (in English, Hindi, Hinglish, Marathi, etc.), NyayMitra translates, classifies the legal category, provides a simple explanation of rights they hold under Indian law, and points them to the nearest actual legal aid center via an interactive map.

## Unique Features

- 🔥 **Multilingual / Hinglish AI**: The AI pipeline gracefully handles natural conversational Indian languages ("Mera landlord mujhe ghar se nikal raha hai").
- 🎙️ **Live Voice Input**: Integrated Web Speech API allows users to speak their problems rather than type (Chrome/Edge optimized).
- 📇 **Know Your Rights Cards**: Simple, visually animated cards explaining specific legal rights based on the detected problem.
- 🚨 **Urgency Detection**: Automatically flags physical threats or violence and triggers emergency helplines (181 Women's Helpline, 100 Police) on the UI.
- 🕵️ **Anonymous Mode**: A privacy toggle that completely decouples and removes the query payload from our database to protect vulnerable users.
- 🗺️ **Matching Legal Aid Centers**: Pulls real District Legal Services Authority (DLSA) centers mapped specifically to their problem category.

## Tech Stack

Our architecture decouples the AI intelligence from the User Interface for maximum scalability:

- **Frontend Layer**: Next.js / React, Tailwind CSS (Hosted on Vercel)
- **Backend / API Layer**: Python, Flask, CORS (Hosted on Render)
- **AI Brain & Translation Layer**: Google Gemini API (gemini-2.5-flash)
- **Database & Relational Structure**: Firebase Data Connect (PostgreSQL via GraphQL)
- **Authentication**: Firebase Auth (One-tap Login)
- **Mapping Services**: Google Maps JavaScript API

## Documentation references

- 🔑 **[API Keys Setup Guide](./API_KEYS_GUIDE.md)**: Steps to configure Gemini, Firebase Auth/Data Connect, and Google Maps.
- 🗄️ **[Database Schema Design](./DB_SCHEMA.md)**: Read how our Firebase Data Connect GraphQL schema ensures privacy and robust relational connections.
- 📚 **[RAG Implementation Guide](./docs/RAG_IMPLEMENTATION.md)**: Local chunking retrieval, citation flow, verification fields, and troubleshooting.

---

## 🚀 Getting Started & Running Locally

To run the application gracefully without crashing, you must start **BOTH** the backend server and the frontend client simultaneously in two separate terminals.

### Step 1: Environment Variables

1. Make sure you have your `.env` file at the root of the project `NyayMitra/.env`.
2. Populate the following keys:
   - `GEMINI_API_KEY`
   - `NEXT_PUBLIC_FIREBASE_API_KEY` (and the rest of the Firebase config object)
   - `GOOGLE_MAPS_API_KEY`
     _(If you make changes to `.env` while Next.js is running, you MUST restart `npm run dev` for React to see them)._

### Step 2: Start the Python Backend (Terminal 1)

The AI engine runs on Flask.

```bash
# Navigate to backend folder
cd backend

# Create a virtual environment (Optional but Recommended)
python -m venv venv
venv\Scripts\activate  # On Windows
# source venv/bin/activate # On Mac/Linux

# Install requirements
pip install -r requirements.txt

# Run the server
python app.py
```

✅ **Expected Output:** `Running on http://127.0.0.1:5000`

### Step 3: Start the Next.js Frontend (Terminal 2)

The UI framework runs on React.

```bash
# Stay in the root directory (NyayMitra/)
npm install

# Start the dev server
npm run dev
```

✅ **Expected Output:** `Ready in Xms` -> Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🛠️ Troubleshooting Common Errors

### `auth/invalid-api-key` in Browser Console

**Cause Fix:** Your Firebase credentials aren't loaded into Next.js.

1. Check your `.env` file to ensure the keys start with `NEXT_PUBLIC_`.
2. Terminate the Next.js terminal (`Ctrl + C`) and restart it `npm run dev` to wipe the env cache.

### `404 models/gemini...` from the Flask Backend

**Cause Fix:** The AI model version is deprecated or the `GEMINI_API_KEY` is wrong.

1. Our codebase handles failures gracefully and will return "Fallback Data Data" if the DB or AI crashes.
2. Check `services/ai_service.py` to ensure `model = genai.GenerativeModel("gemini-2.5-flash")` matches the system year.

### `DefaultCredentialsError` / Firebase DB won't connect

**Cause Fix:** You haven't added the Firebase Admin `firebase_credentials.json` into your `backend/` folder. Flask uses this securely load your database. Follow instructions in `FIREBASE_ADMIN_GUIDE.md` or just ignore it during UI dev—our code will automatically fall back to hardcoded dummy centers if Firestore fails!
