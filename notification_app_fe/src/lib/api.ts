import axios from "axios";
import { getToken, Log } from "logging-middleware";
import type { Notification, NotificationsResponse, NotifType } from "./types";

// uses the next.js proxy to avoid browser cors issues
const BASE = "/api/eval";

export interface FetchOptions {
  limit?: number;
  page?: number;
  type?: NotifType | "All";
}

export async function fetchNotifications(
  opts: FetchOptions = {}
): Promise<Notification[]> {
  const params: Record<string, string> = {};
  if (opts.limit) params.limit = String(opts.limit);
  if (opts.page) params.page = String(opts.page);
  if (opts.type && opts.type !== "All") params.notification_type = opts.type;

  const tag = `${opts.type ?? "all"} p${opts.page ?? 1} l${opts.limit ?? "-"}`;
  await Log("frontend", "info", "api", `fetch start: ${tag}`);

  try {
    const tok = await getToken();
    const res = await axios.get<NotificationsResponse>(`${BASE}/notifications`, {
      params,
      headers: { Authorization: `Bearer ${tok}` },
      timeout: 10000,
    });
    const list = res.data?.notifications ?? [];
    await Log("frontend", "info", "api", `fetch ok: ${list.length} items`);
    return list;
  } catch (err: any) {
    const status = err?.response?.status ?? "net";
    await Log("frontend", "error", "api", `fetch failed: ${status}`);
    throw err;
  }
}

// fetches as many pages as the server will give (limit=5 each, up to MAX_PAGES).
// the priority page uses this so it always has the largest possible pool to
// score from, which keeps the top-N selector accurate when the user picks 20.
export async function fetchAll(): Promise<Notification[]> {
  const PAGE_LIMIT = 5;
  const MAX_PAGES = 12;
  const seen = new Set<string>();
  const collected: Notification[] = [];

  for (let p = 1; p <= MAX_PAGES; p++) {
    const batch = await fetchNotifications({ limit: PAGE_LIMIT, page: p });
    if (batch.length === 0) break;

    for (const n of batch) {
      if (!seen.has(n.ID)) {
        seen.add(n.ID);
        collected.push(n);
      }
    }
    // server returned fewer than asked - we've hit the end
    if (batch.length < PAGE_LIMIT) break;
  }

  return collected;
}
