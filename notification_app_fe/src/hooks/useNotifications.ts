import { useEffect, useState } from "react";
import { Log } from "logging-middleware";
import { fetchNotifications, FetchOptions } from "@/lib/api";
import type { Notification } from "@/lib/types";

interface State {
  data: Notification[];
  loading: boolean;
  error: string | null;
}

export function useNotifications(opts: FetchOptions) {
  const [state, setState] = useState<State>({
    data: [],
    loading: true,
    error: null,
  });

  // re-run when any filter/page changes
  const key = JSON.stringify(opts);

  useEffect(() => {
    let alive = true;
    setState((s) => ({ ...s, loading: true, error: null }));

    fetchNotifications(opts)
      .then((list) => {
        if (!alive) return;
        setState({ data: list, loading: false, error: null });
      })
      .catch((err) => {
        if (!alive) return;
        const status = err?.response?.status;
        const detail = status ? `${status}` : err.message;
        Log("frontend", "error", "hook", `notif hook err: ${String(detail).slice(0, 24)}`);
        setState({
          data: [],
          loading: false,
          error: `Could not load notifications (${detail})`,
        });
      });

    return () => {
      alive = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);

  return state;
}
