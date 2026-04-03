# Firebase Admin Setup for Backend

Your Flask backend interacts with Firebase Firestore using the **Firebase Admin SDK**. To do this securely, it needs a Service Account Key.

## How to get the `firebase_credentials.json`

1. Go to your [Firebase Console](https://console.firebase.google.com/).
2. Open your NyayMitra project.
3. Click the gear icon ⚙️ next to "Project Overview" and select **Project settings**.
4. Go to the **Service accounts** tab.
5. Click the **Generate new private key** button.
6. This will download a `.json` file to your computer.
7. Move this downloaded `.json` file into your `backend/` folder and rename it to `firebase_credentials.json`.
8. Add this path to your `.env` file:
   ```env
   FIREBASE_CREDENTIALS_PATH=backend/firebase_credentials.json
   ```

> ⚠️ **CRITICAL:** Add `firebase_credentials.json` to your `.gitignore` immediately. NEVER commit this file to GitHub!