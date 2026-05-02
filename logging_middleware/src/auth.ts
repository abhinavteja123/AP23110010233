import axios from "axios";
import { getBaseUrl } from "./constants.js";

export interface Creds {
  email: string;
  name: string;
  rollNo: string;
  accessCode: string;
  clientID: string;
  clientSecret: string;
}

// keep token in memory so we don't hit /auth on every log call
let token: string | null = null;
let expiresAt = 0;
let creds: Creds | null = null;

// in-flight token request - shared between concurrent callers
// without this, multiple Log() calls on mount race and trigger duplicate /auth POSTs
let inflight: Promise<string> | null = null;

export function setCreds(c: Creds) {
  creds = c;
  token = null;
  expiresAt = 0;
  inflight = null;
}

export function setToken(t: string, exp?: number) {
  token = t;
  expiresAt = exp ?? Math.floor(Date.now() / 1000) + 3600;
}

async function fetchNewToken(): Promise<string> {
  if (!creds) throw new Error("call setCreds() before logging");

  const res = await axios.post(`${getBaseUrl()}/auth`, creds, {
    headers: { "Content-Type": "application/json" },
  });

  token = res.data.access_token;
  expiresAt = res.data.expires_in;
  return token!;
}

export async function getToken(): Promise<string> {
  const now = Math.floor(Date.now() / 1000);

  // refresh 60s before expiry to be safe
  if (token && expiresAt - 60 > now) {
    return token;
  }

  // if a fetch is already in flight, just wait for it
  if (inflight) return inflight;

  inflight = fetchNewToken().finally(() => {
    inflight = null;
  });

  return inflight;
}
