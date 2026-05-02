import type { Notification, NotifType } from "./types";

// same scoring logic as the backend stage 1 - kept in sync deliberately
const TYPE_WEIGHT: Record<NotifType, number> = {
  Placement: 3,
  Result: 2,
  Event: 1,
};

const W_TYPE = 0.6;
const W_RECENCY = 0.4;

function parseTs(ts: string): number {
  return new Date(ts.replace(" ", "T")).getTime();
}

function recencyScore(ts: string, now: number): number {
  const ageMs = now - parseTs(ts);
  const hours = Math.max(0, ageMs / (1000 * 60 * 60));
  return 1 / (1 + hours);
}

export function scoreOf(n: Notification, now = Date.now()): number {
  const t = (TYPE_WEIGHT[n.Type] ?? 0) / 3;
  const r = recencyScore(n.Timestamp, now);
  return W_TYPE * t + W_RECENCY * r;
}

// returns top n by score, sorted desc
// list is small in the frontend so a sort is fine here - heap is overkill
export function topN(list: Notification[], n: number): Notification[] {
  const now = Date.now();
  return [...list]
    .map((x) => ({ x, s: scoreOf(x, now) }))
    .sort((a, b) => b.s - a.s)
    .slice(0, n)
    .map((it) => it.x);
}
