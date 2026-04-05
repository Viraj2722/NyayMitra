import { spawnSync } from "node:child_process";

const OPERATIONS_FILE = "E:\\NyayMitra\\dataconnect\\example\\mutations.gql";
const variablesJson = JSON.stringify({
  lawName: "Constitution_of_India",
  limit: 5,
});

const result = spawnSync(
  "cmd.exe",
  [
    "/d",
    "/s",
    "/c",
    `npx -y firebase-tools@latest dataconnect:execute "${OPERATIONS_FILE}" ListLegalChunksByLaw --service my-app-2ddc5-2-service --location us-east4 --variables "${variablesJson.replace(/"/g, '\\"')}" --no-debug-details`,
  ],
  {
    cwd: "E:/NyayMitra",
    encoding: "utf-8",
  },
);

console.log("status", result.status);
console.log("signal", result.signal);
console.log("error", result.error ? String(result.error) : "none");
console.log("stdout\n", result.stdout);
console.log("stderr\n", result.stderr);
