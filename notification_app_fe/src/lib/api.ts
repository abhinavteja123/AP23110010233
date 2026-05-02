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

  await Log("frontend", "info", "api", `fetching notifications ${JSON.stringify(params)}`);

  try {
    const tok = await getToken();
    const res = await axios.get<NotificationsResponse>(`${BASE}/notifications`, {
      params,
      headers: { Authorization: `Bearer ${tok}` },
      timeout: 10000,
    });
    const list = res.data?.notifications ?? [];
    await Log("frontend", "info", "api", `received ${list.length} notifications`);
    return list;
  } catch (err: any) {
    await Log(
      "frontend",
      "error",
      "api",
      `notifications fetch failed: ${err?.response?.status ?? err.message}`
    );
    throw err;
  }
}
