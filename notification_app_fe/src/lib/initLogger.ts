import { setCreds, setBaseUrl } from "logging-middleware";

// init the logger once - call from _app
let done = false;

export function initLogger() {
  if (done) return;
  done = true;

  // route through next.js rewrite to dodge cors in the browser
  setBaseUrl("/api/eval");

  setCreds({
    email: process.env.NEXT_PUBLIC_EVAL_EMAIL!,
    name: process.env.NEXT_PUBLIC_EVAL_NAME!,
    rollNo: process.env.NEXT_PUBLIC_EVAL_ROLL_NO!,
    accessCode: process.env.NEXT_PUBLIC_EVAL_ACCESS_CODE!,
    clientID: process.env.NEXT_PUBLIC_EVAL_CLIENT_ID!,
    clientSecret: process.env.NEXT_PUBLIC_EVAL_CLIENT_SECRET!,
  });
}
