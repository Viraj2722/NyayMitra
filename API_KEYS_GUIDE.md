# NyayMitra: API Keys Setup Guide

This guide explains how to get all the necessary API keys for the NyayMitra project. Once you have these keys, copy the `.env.example` file to `.env` and fill in your actual keys.

## 1. Gemini API Key (Google AI Studio)
*Used for the AI chat handling, legal category classification, and urgency detection.*
1. Go to [Google AI Studio](https://aistudio.google.com/).
2. Sign in with your Google account.
3. Look for the **"Get API key"** button on the left sidebar.
4. Click **"Create API key"**. You can create it in an existing Google Cloud project or let it create a new one.
5. Copy the generated key and paste it into `.env` under `GEMINI_API_KEY`.

## 2. Firebase API Key (Data Connect + Auth)
*Used for the frontend and PostgreSQL relational database setup.*
1. Go to the [Firebase Console](https://console.firebase.google.com/).
2. Click **"Add project"** and follow the steps to create a new project (name it NyayMitra).
3. Once the project is ready, click the **Web icon (</>)** on the Project Overview page to add a Firebase app to your project.
4. Register the app.
5. Firebase will show you a configuration object (`firebaseConfig`). Copy the `apiKey` value and paste it into `.env` under `FIREBASE_API_KEY`.
6. To enable the required features:
   - Go to **Build > Data Connect** in the left sidebar to enable your PostgresSQL backend.
   - Go to **Build > Authentication** and click "Get started".

## 3. Google Maps JavaScript API Key
*Used on the `/map` page to show the legal centers markers.*
1. Go to the [Google Cloud Console](https://console.cloud.google.com/).
2. Select your project from the top dropdown (you can use the same project Firebase or Gemini created).
3. Open the navigation menu (hamburger icon) and go to **APIs & Services > Library**.
4. Search for **Maps JavaScript API** and click on it.
5. Click **Enable**.
6. After enabling, go to **APIs & Services > Credentials**.
7. Click **+ CREATE CREDENTIALS** at the top and select **API key**.
8. Copy the generated API key and paste it into `.env` under `GOOGLE_MAPS_API_KEY`.

---
⚠ **Important:** Never commit your `.env` file to GitHub. The repository already includes a `.gitignore` file that should prevent this. Always test your keys using a simple curl or ping script before diving deep into the code!