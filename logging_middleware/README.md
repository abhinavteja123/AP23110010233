# logging_middleware

A small reusable package that wraps the Test Server log API.
Exposes one main function: `Log(stack, level, package, message)`.

## Setup

```bash
cd logging_middleware
npm install
npm run build
```

## How to use

```ts
import { Log, setCreds } from "logging-middleware";

setCreds({
  email: process.env.EVAL_EMAIL!,
  name: process.env.EVAL_NAME!,
  rollNo: process.env.EVAL_ROLL_NO!,
  accessCode: process.env.EVAL_ACCESS_CODE!,
  clientID: process.env.EVAL_CLIENT_ID!,
  clientSecret: process.env.EVAL_CLIENT_SECRET!,
});

await Log("frontend", "info", "page", "notification list page mounted");
await Log("frontend", "error", "api", "fetch notifications failed");
```

The token is fetched lazily on first call and cached until close to expiry.

## Allowed values (lowercase only)

- **stack:** `backend`, `frontend`
- **level:** `debug`, `info`, `warn`, `error`, `fatal`
- **package - backend only:** `cache`, `controller`, `cron_job`, `db`, `domain`, `handler`, `repository`, `route`, `service`
- **package - frontend only:** `api`, `component`, `hook`, `page`, `state`, `style`
- **package - shared:** `auth`, `config`, `middleware`, `utils`

Bad input is caught locally before the API call.
