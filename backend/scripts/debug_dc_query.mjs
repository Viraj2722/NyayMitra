import fs from "node:fs";
import { initializeApp, getApps, getApp } from "firebase/app";
import { getDataConnect } from "firebase/data-connect";
import {
  connectorConfig,
  searchLegalChunksByLaw,
} from "../../lib/dataconnect-generated/index.cjs.js";

const envPath = new URL("../../.env", import.meta.url).pathname;
const envText = fs.readFileSync(envPath, "utf-8");
for (const line of envText.split(/\r?\n/)) {
  const trimmed = line.trim();
  if (!trimmed || trimmed.startsWith("#")) continue;
  const index = trimmed.indexOf("=");
  if (index <= 0) continue;
  const key = trimmed.slice(0, index).trim();
  let value = trimmed.slice(index + 1).trim();
  value = value.replace(/^['"]|['"]$/g, "");
  if (!process.env[key]) process.env[key] = value;
}

const app = !getApps().length
  ? initializeApp({
      apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
      authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
      databaseURL: process.env.NEXT_PUBLIC_FIREBASE_DATABASE_URL,
      projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
      storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
      messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
      appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
    })
  : getApp();

const dc = getDataConnect(app, connectorConfig);

try {
  const result = await searchLegalChunksByLaw(dc, {
    lawName: "Contract_Act_1872",
    term: "",
    limit: 5,
  });
  console.log(JSON.stringify(result, null, 2));
} catch (error) {
  console.error(error?.stack || error);
  process.exit(1);
}
