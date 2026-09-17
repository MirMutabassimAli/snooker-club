# Snooker Club

Motion-first gaming arena operations dashboard built with Next.js, TypeScript, React, and Framer Motion.

## Run locally

```bash
npm install
npm run dev
```

Open http://localhost:3000.

## Quality checks

```bash
npm run typecheck
npm run lint
npm test
npm run build
```

## Data model

This version intentionally uses in-memory dummy data. Starting sessions, finishing sessions, adding orders, and collecting payments update React state only and reset on refresh. There is no database or external API connection.
