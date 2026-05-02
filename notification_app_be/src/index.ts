import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import { setCreds, Log } from "logging-middleware";

// .env lives at the repo root, one level above this folder
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, "../../.env") });
import { fetchNotifications } from "./api.js";
import { topN, scoreOf } from "./priority.js";

// load creds from root .env (we use dotenv/config above)
function loadCreds() {
  const required = [
    "EVAL_EMAIL",
    "EVAL_NAME",
    "EVAL_ROLL_NO",
    "EVAL_ACCESS_CODE",
    "EVAL_CLIENT_ID",
    "EVAL_CLIENT_SECRET",
  ];
  for (const k of required) {
    if (!process.env[k]) {
      throw new Error(`missing ${k} in env`);
    }
  }
  setCreds({
    email: process.env.EVAL_EMAIL!,
    name: process.env.EVAL_NAME!,
    rollNo: process.env.EVAL_ROLL_NO!,
    accessCode: process.env.EVAL_ACCESS_CODE!,
    clientID: process.env.EVAL_CLIENT_ID!,
    clientSecret: process.env.EVAL_CLIENT_SECRET!,
  });
}

async function main() {
  loadCreds();
  await Log("backend", "info", "service", "stage 1 priority inbox starting");

  const all = await fetchNotifications();
  await Log("backend", "info", "service", `total received: ${all.length}`);

  // pick top 10
  const N = 10;
  const top = topN(all, N);

  await Log("backend", "info", "service", `picked top ${top.length} notifications`);

  // print nicely for the screenshot
  console.log("\n=== Priority Inbox - Top", N, "===\n");
  console.log("Rank  Score   Type        Timestamp            Message");
  console.log("----  ------  ----------  -------------------  --------");
  top.forEach((n, i) => {
    const s = scoreOf(n).toFixed(3);
    const rank = String(i + 1).padStart(2, " ");
    const type = n.Type.padEnd(10, " ");
    console.log(`${rank}.   ${s}   ${type}  ${n.Timestamp}  ${n.Message}`);
  });
  console.log();
}

main().catch(async (err) => {
  await Log("backend", "fatal", "service", `stage 1 crashed: ${err.message}`);
  console.error(err);
  process.exit(1);
});
