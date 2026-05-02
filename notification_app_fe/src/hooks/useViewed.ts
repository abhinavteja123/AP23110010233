import { useCallback, useEffect, useState } from "react";
import { Log } from "logging-middleware";

const KEY = "viewed_notifications";

// tracks which notification IDs the user has clicked/seen
// stored in localStorage so it persists across reloads
export function useViewed() {
  const [viewed, setViewed] = useState<Set<string>>(new Set());

  useEffect(() => {
    try {
      const raw = localStorage.getItem(KEY);
      if (raw) setViewed(new Set(JSON.parse(raw)));
    } catch {
      // ignore - bad json or no storage
    }
  }, []);

  const persist = (set: Set<string>) => {
    try {
      localStorage.setItem(KEY, JSON.stringify([...set]));
    } catch {}
  };

  const markViewed = useCallback((id: string) => {
    setViewed((prev) => {
      if (prev.has(id)) return prev;
      const next = new Set(prev);
      next.add(id);
      persist(next);
      Log("frontend", "info", "state", `viewed ${id.slice(0, 8)}`);
      return next;
    });
  }, []);

  const markManyViewed = useCallback((ids: string[]) => {
    setViewed((prev) => {
      const next = new Set(prev);
      let added = 0;
      for (const id of ids) {
        if (!next.has(id)) {
          next.add(id);
          added++;
        }
      }
      if (added === 0) return prev;
      persist(next);
      Log("frontend", "info", "state", `bulk viewed ${added} items`);
      return next;
    });
  }, []);

  return { viewed, markViewed, markManyViewed };
}
