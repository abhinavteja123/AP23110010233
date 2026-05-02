# notification_app_be

Stage 1 of the campus notifications task. Picks the **top N** unread notifications using a weighted score (type weight + recency).

## Run

```bash
npm install
npm run start
```

Make sure the root `.env` is filled with the auth credentials. The script reads them and uses the logging middleware to record events.
