# Notification System Design

## Stage 1

### Problem

The campus notification feed is noisy. Users miss important things like placement announcements because they get buried under event reminders and routine results. We need a "Priority Inbox" that surfaces the top **N** most important unread notifications first, where N is user-configurable (10, 15, 20, ...).

We also need to support a continuous stream — new notifications keep arriving and the top-N must stay accurate without recomputing everything from scratch.

### Approach

Two ideas combined into a single score per notification:

1. **Type weight** — placement matters more than results, results more than events.
2. **Recency** — newer notifications are more relevant than older ones, with a steep drop-off so we don't punish a 1-hour-old notification too much but heavily downweight a 7-day-old one.

The final score is a weighted blend of both, normalised to roughly [0, 1].

### Scoring formula

```
typeScore = TYPE_WEIGHT[type] / 3            // Placement=3, Result=2, Event=1 → normalised
recencyScore = 1 / (1 + ageInHours)          // hyperbolic decay, fast drop near zero
score = 0.6 * typeScore + 0.4 * recencyScore
```

**Why these weights?** Type carries more weight (0.6) because the brief explicitly orders importance as `placement > result > event`. Recency gets a meaningful 0.4 so a brand-new event can still beat a stale placement from a week ago.

**Why hyperbolic decay over linear?** Linear decay (`1 - age/maxAge`) treats notifications equally across the timeline. Hyperbolic decay aggressively rewards the freshest items and flattens out for older ones — matching how users actually skim a feed.

### Top-N data structure

The naive approach is to score every notification, sort by score descending, and slice the top N. That's `O(M log M)` where M = total notifications, which works fine for hundreds but is wasteful when M >> N.

**Choice: a min-heap of fixed size N.**

- Initialise an empty min-heap.
- For each notification, compute its score.
  - If heap has fewer than N items → push.
  - Else if the new score > heap's minimum → pop the min, push the new one.
  - Else → discard.
- At the end, the heap contains exactly the top N items (in heap order). Sort them once at the very end for display.

**Complexity:** `O(M log N)` time, `O(N)` space. For M = 10,000 and N = 10, that's ~33k comparisons vs ~133k for a full sort.

### Handling continuous incoming notifications

The min-heap also makes incremental updates cheap:

- When a new notification arrives:
  - Compute its score.
  - If heap is not full → push (`O(log N)`).
  - Else compare against the heap's min. Replace if larger.
- Mark a notification as "read" → remove it from the priority set (lazy deletion is simplest: re-rank on next fetch).
- Recency decay means old top-N items naturally lose their slot to fresher ones over time. We can re-score the heap periodically (every few minutes) to keep ranking accurate even when no new notifications arrive.

### Trade-offs and notes

- **Recency decay constant:** Currently `1 / (1 + ageHours)`. If we wanted a softer curve we could use `1 / (1 + ageHours/24)` to stretch over days instead of hours. Tunable based on how fresh "fresh" feels in this product.
- **Tie-breaking:** Two items with equal score are ordered by heap insertion order. If we wanted deterministic ties, we'd add `ID` as a secondary sort key.
- **Read state:** Stage 1 doesn't yet model read/unread (the API doesn't expose it). On the frontend we'll persist viewed IDs in `localStorage` and exclude them from the priority pool.
- **Pre-filtering by type** can be plugged in before scoring without changing the heap logic — useful when the user filters to "only Placements".

### Files

- `notification_app_be/src/api.ts` — fetches the protected notifications endpoint with the bearer token.
- `notification_app_be/src/priority.ts` — scoring + min-heap top-N.
- `notification_app_be/src/index.ts` — runner that prints the top 10.
- Output: `notification_app_be/screenshots/stage1_top10.png`.
