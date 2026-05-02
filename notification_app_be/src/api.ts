import axios from "axios";
import { getToken, Log } from "logging-middleware";
import type { Notification, NotificationsResponse } from "./types.js";

const NOTIF_URL = "http://20.207.122.201/evaluation-service/notifications";

// fetches all notifications from the test server
// the api is protected so we attach the bearer token from logging-middleware
export async function fetchNotifications(): Promise<Notification[]> {
  await Log("backend", "info", "service", "fetching notifications from test server");

  try {
    const tok = await getToken();
    const res = await axios.get<NotificationsResponse>(NOTIF_URL, {
      headers: { Authorization: `Bearer ${tok}` },
      timeout: 8000,
    });

    const list = res.data?.notifications ?? [];
    await Log("backend", "info", "service", `got ${list.length} notifications`);
    return list;
  } catch (err: any) {
    await Log(
      "backend",
      "error",
      "service",
      `fetch notifications failed: ${err?.response?.status ?? err.message}`
    );
    throw err;
  }
}
