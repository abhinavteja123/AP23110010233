import axios from "axios";
import { API_BASE } from "./constants.js";

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

export function setCreds(c: Creds) {
  creds = c;
  // reset token if creds change
  token = null;
  expiresAt = 0;
}

// allow manual token injection (useful for testing)
export function setToken(t: string, exp?: number) {
  token = t;
  expiresAt = exp ?? Math.floor(Date.now() / 1000) + 3600;
}

export async function getToken(): Promise<string> {
  const now = Math.floor(Date.now() / 1000);

  // refresh 60s before expiry to be safe
  if (token && expiresAt - 60 > now) {
    return token;
  }

  if (!creds) {
    throw new Error("call setCreds() before logging");
  }

  const res = await axios.post(`${API_BASE}/auth`, creds, {
    headers: { "Content-Type": "application/json" },
  });

  token = res.data.access_token;
  expiresAt = res.data.expires_in;
  return token!;
}
