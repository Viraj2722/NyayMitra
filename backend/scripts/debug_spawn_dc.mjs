import { spawnSync } from "node:child_process";

const result = spawnSync(
  "npx",
  [
    "-y",
    "firebase-tools@latest",
    "dataconnect:execute",
    "E:/NyayMitra/dataconnect/example/mutations.gql",
    "ListLegalChunksByLaw",
    "--service",
    "my-app-2ddc5-2-service",
    "--location",
    "us-east4",
    "--variables",
    JSON.stringify({ lawName: "Constitution_of_India", limit: 5 }),
    "--no-debug-details",
  ],
  {
    cwd: "E:/NyayMitra",
    encoding: "utf-8",
    shell: process.platform === "win32",
  },
);

console.log("status", result.status);
console.log("signal", result.signal);
console.log("error", result.error ? String(result.error) : "none");
console.log("stdout_len", String(result.stdout || "").length);
console.log("stderr_len", String(result.stderr || "").length);
console.log("stdout_head", String(result.stdout || "").slice(0, 240));
console.log("stderr_head", String(result.stderr || "").slice(0, 240));
