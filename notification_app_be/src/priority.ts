import type { Notification, NotifType } from "./types.js";

// weights for each notification type
// placement matters most, then result, then event
const TYPE_WEIGHT: Record<NotifType, number> = {
  Placement: 3,
  Result: 2,
  Event: 1,
};

// blend factors - how much we care about type vs how recent
const W_TYPE = 0.6;
const W_RECENCY = 0.4;

// parse "2026-04-22 17:51:30" -> Date
// the api gives this odd format so we replace space with T
function parseTs(ts: string): number {
  const d = new Date(ts.replace(" ", "T"));
  return d.getTime();
}

// recency in [0, 1] - newer = higher
// uses 1 / (1 + ageHours) so the curve drops fast for old stuff
function recencyScore(ts: string, now: number): number {
  const ageMs = now - parseTs(ts);
  const ageHours = Math.max(0, ageMs / (1000 * 60 * 60));
  return 1 / (1 + ageHours);
}

export function scoreOf(n: Notification, now = Date.now()): number {
  const t = (TYPE_WEIGHT[n.Type] ?? 0) / 3; // normalise to [0,1]
  const r = recencyScore(n.Timestamp, now);
  return W_TYPE * t + W_RECENCY * r;
}

// min-heap to keep top-N efficiently
// keeps the worst (lowest score) at root so we can swap quickly
class MinHeap {
  private data: { score: number; n: Notification }[] = [];

  size() {
    return this.data.length;
  }

  peekMin() {
    return this.data[0];
  }

  push(item: { score: number; n: Notification }) {
    this.data.push(item);
    this.bubbleUp(this.data.length - 1);
  }

  popMin() {
    const top = this.data[0];
    const last = this.data.pop()!;
    if (this.data.length > 0) {
      this.data[0] = last;
      this.bubbleDown(0);
    }
    return top;
  }

  toSortedDesc(): Notification[] {
    return [...this.data]
      .sort((a, b) => b.score - a.score)
      .map((x) => x.n);
  }

  private bubbleUp(i: number) {
    while (i > 0) {
      const parent = Math.floor((i - 1) / 2);
      if (this.data[parent].score > this.data[i].score) {
        [this.data[parent], this.data[i]] = [this.data[i], this.data[parent]];
        i = parent;
      } else break;
    }
  }

  private bubbleDown(i: number) {
    const n = this.data.length;
    while (true) {
      let smallest = i;
      const l = 2 * i + 1;
      const r = 2 * i + 2;
      if (l < n && this.data[l].score < this.data[smallest].score) smallest = l;
      if (r < n && this.data[r].score < this.data[smallest].score) smallest = r;
      if (smallest === i) break;
      [this.data[smallest], this.data[i]] = [this.data[i], this.data[smallest]];
      i = smallest;
    }
  }
}

// returns the top N notifications sorted by score (highest first)
// uses a min-heap of size N - O(M log N) where M = total notifications
export function topN(notifications: Notification[], n = 10): Notification[] {
  if (n <= 0) return [];
  const now = Date.now();
  const heap = new MinHeap();

  for (const item of notifications) {
    const s = scoreOf(item, now);
    if (heap.size() < n) {
      heap.push({ score: s, n: item });
    } else if (heap.peekMin().score < s) {
      heap.popMin();
      heap.push({ score: s, n: item });
    }
  }

  return heap.toSortedDesc();
}
