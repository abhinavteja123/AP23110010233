# notification_app_fe

Stage 2 frontend for the campus notifications task. Built with Next.js (Pages Router) + TypeScript + Material UI.

## Run

```bash
cp .env.local.example .env.local   # then fill in your creds
npm install
npm run dev
```

App runs on http://localhost:3000.

## Pages

- `/` — All notifications with type filter and pagination
- `/priority` — Priority Inbox (top N by score)
