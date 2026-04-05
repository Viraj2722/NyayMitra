import fs from "node:fs";
import path from "node:path";
import { initializeApp, getApps, getApp } from "firebase/app";
import { getDataConnect } from "firebase/data-connect";
import { connectorConfig, createLegalChunk } from "@dataconnect/my-app";

const ROOT = process.cwd();
const ENV_PATH = path.join(ROOT, ".env");
const INDEX_PATH = path.join(
  ROOT,
  "backend",
  "legal_knowledge_base",
  "legal_rag_index.json",
);

function loadEnv(filePath) {
  if (!fs.existsSync(filePath)) return;
  const content = fs.readFileSync(filePath, "utf-8");
  for (const line of content.split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eqIndex = trimmed.indexOf("=");
    if (eqIndex <= 0) continue;
    const key = trimmed.slice(0, eqIndex).trim();
    let value = trimmed.slice(eqIndex + 1).trim();
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }
    if (!process.env[key]) {
      process.env[key] = value;
    }
  }
}

function tokenize(text) {
  return String(text || "")
    .toLowerCase()
    .split(/\s+/)
    .map((t) => t.replace(/[^a-z0-9]/g, ""))
    .filter((t) => t.length >= 3)
    .slice(0, 60);
}

async function main() {
  loadEnv(ENV_PATH);

  const firebaseConfig = {
    apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
    authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
    databaseURL: process.env.NEXT_PUBLIC_FIREBASE_DATABASE_URL,
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  };

  if (
    !firebaseConfig.apiKey ||
    !firebaseConfig.projectId ||
    !firebaseConfig.appId
  ) {
    throw new Error("Missing NEXT_PUBLIC_FIREBASE_* config in .env");
  }

  if (!fs.existsSync(INDEX_PATH)) {
    throw new Error(
      `RAG index not found at ${INDEX_PATH}. Run python backend/ingest_legal_data.py first.`,
    );
  }

  const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
  const dc = getDataConnect(app, connectorConfig);

  const payload = JSON.parse(fs.readFileSync(INDEX_PATH, "utf-8"));
  const items = Array.isArray(payload?.items) ? payload.items : [];

  if (!items.length) {
    console.log("No chunks to sync.");
    return;
  }

  const offset = Math.max(0, Number(process.env.RAG_SYNC_OFFSET || "0"));
  const maxToSync = Number(process.env.RAG_SYNC_LIMIT || "300");
  const capped = items.slice(offset, offset + maxToSync);

  console.log(
    `Syncing ${capped.length} chunks to Data Connect from offset ${offset}...`,
  );

  let success = 0;
  let failed = 0;

  for (let i = 0; i < capped.length; i += 1) {
    const item = capped[i] || {};
    const metadata = item.metadata || {};
    const text = String(item.text || "").slice(0, 5000);

    try {
      await createLegalChunk(dc, {
        lawName: String(metadata.law_name || "Unknown_Law"),
        sourceUrl: metadata.source_url ? String(metadata.source_url) : null,
        sourceFile: metadata.source_file ? String(metadata.source_file) : null,
        page: Number.isFinite(Number(metadata.page))
          ? Number(metadata.page)
          : null,
        chunkIndex: i,
        text,
        tokens: tokenize(text),
        embeddingJson: item.embedding
          ? JSON.stringify(item.embedding).slice(0, 12000)
          : null,
      });
      success += 1;
    } catch (err) {
      failed += 1;
      console.error(`Failed chunk ${i}:`, err?.message || err);
    }
  }

  console.log(`Done. Success: ${success}, Failed: ${failed}`);
  console.log("Tip: set RAG_SYNC_LIMIT=2000 to push more chunks in batches.");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
