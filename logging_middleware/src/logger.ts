import axios from "axios";
import { getBaseUrl } from "./constants.js";
import { checkInput } from "./validate.js";
import { getToken } from "./auth.js";

// the main log function - matches the spec: Log(stack, level, package, message)
export async function Log(
  stack: string,
  level: string,
  pkg: string,
  message: string
) {
  // validate first so we fail fast on bad input
  try {
    checkInput(stack, level, pkg, message);
  } catch (err: any) {
    console.warn("[log] invalid input:", err.message);
    return null;
  }

  // server caps message at 48 chars - truncate to be safe
  const safeMsg = message.length > 48 ? message.slice(0, 48) : message;

  const body = {
    stack,
    level,
    package: pkg, // "package" is a reserved-ish word so we rename in the param
    message: safeMsg,
  };

  try {
    const tok = await getToken();
    const res = await axios.post(`${getBaseUrl()}/logs`, body, {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${tok}`,
      },
      timeout: 5000,
    });
    return res.data; // { logID, message }
  } catch (err: any) {
    // don't crash the app if logging fails - just print and move on
    console.warn(
      "[log] failed:",
      err?.response?.status,
      JSON.stringify(err?.response?.data) || err.message
    );
    return null;
  }
}
