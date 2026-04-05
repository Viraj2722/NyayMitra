import fs from "node:fs";
import path from "node:path";
import { spawnSync } from "node:child_process";

const ROOT = path.join(process.cwd(), "..");
const ENV_PATH = path.join(ROOT, ".env");
const OPERATIONS_FILE =
  process.platform === "win32"
    ? "dataconnect\\example\\mutations.gql"
    : "dataconnect/example/mutations.gql";

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
    .map((token) => token.replace(/[^a-z0-9]/g, ""))
    .filter((token) => token.length >= 3)
    .filter(
      (token) =>
        !new Set([
          "the",
          "and",
          "for",
          "with",
          "from",
          "that",
          "this",
          "your",
          "you",
          "are",
          "was",
          "were",
          "have",
          "has",
          "had",
          "not",
          "without",
          "any",
          "can",
          "could",
          "would",
          "should",
          "will",
          "shall",
        ]).has(token),
    );
}

function score(queryTokens, row) {
  const rowTokens = new Set(
    Array.isArray(row.tokens)
      ? row.tokens.map((t) => String(t).toLowerCase())
      : [],
  );
  if (!queryTokens.length || !rowTokens.size) return 0;
  let overlap = 0;
  for (const token of queryTokens) {
    if (rowTokens.has(token)) overlap += 1;
  }
  return overlap / queryTokens.length;
}

function queryLaw(lawName, limit) {
  const isWindows = process.platform === "win32";
  const variablesJson = JSON.stringify({
    lawName,
    limit: Math.max(limit, 200),
  });

  const execution = isWindows
    ? spawnSync(
        "cmd.exe",
        [
          "/d",
          "/s",
          "/c",
          `npx -y firebase-tools@latest dataconnect:execute ${OPERATIONS_FILE} ListLegalChunksByLaw --service my-app-2ddc5-2-service --location us-east4 --variables "${variablesJson.replace(/"/g, '\\"')}" --no-debug-details`,
        ],
        {
          cwd: ROOT,
          encoding: "utf-8",
          env: process.env,
        },
      )
    : spawnSync(
        "npx",
        [
          "-y",
          "firebase-tools@latest",
          "dataconnect:execute",
          OPERATIONS_FILE,
          "ListLegalChunksByLaw",
          "--service",
          "my-app-2ddc5-2-service",
          "--location",
          "us-east4",
          "--variables",
          variablesJson,
          "--no-debug-details",
        ],
        {
          cwd: ROOT,
          encoding: "utf-8",
          env: process.env,
        },
      );

  if (execution.status !== 0) {
    return [];
  }

  const stdout = String(execution.stdout || "").trim();
  if (!stdout) return [];

  try {
    const firstBrace = stdout.indexOf("{");
    const lastBrace = stdout.lastIndexOf("}");
    if (firstBrace < 0 || lastBrace < 0 || lastBrace <= firstBrace) {
      return [];
    }
    const jsonText = stdout.slice(firstBrace, lastBrace + 1);
    const parsed = JSON.parse(jsonText);
    return parsed?.data?.legalChunks || [];
  } catch {
    return [];
  }
}

async function main() {
  loadEnv(ENV_PATH);

  const input = JSON.parse(fs.readFileSync(0, "utf-8"));
  const query = String(input.query || "");
  const allowedLaws = Array.isArray(input.allowedLaws)
    ? input.allowedLaws.map(String)
    : [];
  const topK = Number.isFinite(Number(input.topK)) ? Number(input.topK) : 4;

  const queryTokens = tokenize(query);
  const laws =
    allowedLaws.length > 0
      ? allowedLaws
      : [
          "Constitution_of_India",
          "BNS_2023",
          "BNSS_2023",
          "BSA_2023",
          "Contract_Act_1872",
        ];
  const raw = [];

  for (const law of laws) {
    const rows = queryLaw(law, Math.max(topK, 5));
    for (const row of rows) {
      raw.push(row);
    }
  }

  const seen = new Set();
  let ranked = raw
    .map((row) => {
      const key = `${row.lawName}:${row.chunkIndex}:${row.page ?? ""}`;
      return { row, score: score(queryTokens, row), key };
    })
    .filter(({ score }) => score > 0)
    .filter(({ key }) => {
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    })
    .sort((a, b) => b.score - a.score)
    .slice(0, topK)
    .map(({ row }) => ({
      law_name: row.lawName,
      page: row.page,
      source_url: row.sourceUrl,
      source_file: row.sourceFile,
      chunk_index: row.chunkIndex,
      excerpt: row.text,
      tokens: row.tokens,
      embedding_json: row.embeddingJson,
    }));

  if (ranked.length === 0 && raw.length > 0) {
    const dedup = new Set();
    ranked = raw
      .filter((row) => {
        const key = `${row.lawName}:${row.chunkIndex}:${row.page ?? ""}`;
        if (dedup.has(key)) return false;
        dedup.add(key);
        return true;
      })
      .slice(0, topK)
      .map((row) => ({
        law_name: row.lawName,
        page: row.page,
        source_url: row.sourceUrl,
        source_file: row.sourceFile,
        chunk_index: row.chunkIndex,
        excerpt: row.text,
        tokens: row.tokens,
        embedding_json: row.embeddingJson,
      }));
  }

  process.stdout.write(JSON.stringify({ items: ranked }));
}

main().catch((error) => {
  process.stderr.write(String(error?.stack || error?.message || error));
  process.exit(1);
});
