# FlowArchitect AI

FlowArchitect AI is an AI workflow architecture layer that plans, validates and compiles automation workflows for n8n.

## Run locally

Terminal 1:
```bash
npm install
npm run dev
```

Terminal 2:
```bash
cd server
npm install
npm run dev
```

Open http://localhost:5173

## Authentication & OTP

- Registration and login use password + 6-digit email OTP.
- OTP expires in 5 minutes and has a maximum of 5 attempts.
- OTP resend is rate-limited in the local demo.
- Without SMTP variables, the OTP is printed in the **server terminal only** so the demo can run without an email provider.
- For real deployment, configure Resend or another email provider and set a strong `JWT_SECRET`.

## API keys

- **n8n API key:** used by the server-side n8n proxy to create/activate workflows. Keep it server-side.
- **LLM API key:** if Gemini/OpenAI is added, store it in server environment variables, never React code.
- ****Resend API key:** used to send OTP email. Keep it server-side.
- **JWT_SECRET:** signs authentication tokens; use a long random secret in production.

## Current limitations and improvements

1. JSON user storage is for demos; use PostgreSQL/MongoDB for production.
2. Local OTP rate limiting is in-memory; use Redis for distributed deployments.
3. The frontend currently stores JWT in localStorage; production should prefer secure HttpOnly cookies.
4. AI-generated workflows can be incorrect; keep schema validation, human approval and sandbox testing.
5. LLM APIs have cost/rate limits; use rule-first decisions, caching, token budgets and monitoring.
6. n8n versions can change node schemas; use version-aware export and compatibility tests.
7. Add HTTPS, CSRF protection where cookie auth is used, RBAC, audit logs, secret management and monitoring before production.

## Project positioning

FlowArchitect is not presented as a replacement for n8n. n8n is the execution engine; FlowArchitect is the architecture and decision-support layer that gathers requirements, compares workflow strategies, recommends AI vs deterministic logic, validates the design and then exports an executable n8n workflow.
