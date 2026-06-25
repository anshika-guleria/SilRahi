# Contributing to Silrahi

Thanks for helping improve Silrahi. This project is a full-stack React, Express, and Firebase app for customer-tailor booking workflows.

## Ways to Contribute

- Fix bugs in auth, booking, dashboard, map search, or upload flows.
- Improve accessibility, responsive layouts, and form validation.
- Add tests, documentation, deployment examples, and issue reproductions.
- Improve Firebase rules, backend validation, and security hardening.

## Local Setup

1. Fork and clone the repository.
2. Install Node.js 20 or newer.
3. Install dependencies:

```bash
npm run install:all
```

4. Copy environment examples:

```bash
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env
```

5. Fill Firebase values in both `.env` files.
6. Start both apps in separate terminals:

```bash
npm run dev:backend
npm run dev:frontend
```

Frontend: `http://localhost:5173`
Backend health: `http://localhost:5000/api/health`

## Development Rules

- Keep changes focused and easy to review.
- Do not commit real `.env` files, Firebase private keys, service-account JSON, `node_modules/`, or build output.
- Prefer existing UI components and API helpers before adding new abstractions.
- Validate backend input with Zod when adding or changing endpoints.
- Keep customer, tailor, and admin permissions explicit.
- Update the README or docs when behavior, setup, or deployment changes.

## Before Opening a Pull Request

Run:

```bash
npm run check
```

Also confirm:

- The app builds successfully.
- Backend syntax checks pass.
- New env variables are documented in `.env.example`.
- Screens affected by your change still work on desktop and mobile widths.

## Pull Request Style

Use a clear title:

```text
feat: add nearby tailor filter
fix: prevent invalid booking status update
docs: clarify Firebase setup
```

In the PR body, include:

- What changed
- Why it changed
- How you tested it
- Screenshots or screen recordings for UI changes

## Need Help?

Open an issue with reproduction steps, expected behavior, actual behavior, and screenshots if useful.
