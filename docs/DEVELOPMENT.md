# Development Guide

## Prerequisites

- Node.js 20 or newer
- npm
- Firebase project with Auth, Firestore, and Storage enabled

## Install

```bash
npm run install:all
```

## Environment Files

Create local env files from examples:

```bash
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env
```

Backend Firebase values must come from a Firebase Admin service account. Frontend Firebase values come from the Firebase Web App config.

## Run

Terminal 1:

```bash
npm run dev:backend
```

Terminal 2:

```bash
npm run dev:frontend
```

Use `http://localhost:5173` for local Firebase Auth. Add `localhost` to Firebase Authorized Domains.

## Verify

```bash
npm run check
```

This runs backend syntax checks and frontend production build.

## Common Issues

Backend missing Firebase values:

```text
Missing Firebase env values: FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL, FIREBASE_PRIVATE_KEY
```

Fix by filling `backend/.env` from the Firebase Admin service-account JSON.

Google sign-in blocked locally:

Use `http://localhost:5173`, not `127.0.0.1`, and confirm `localhost` is authorized in Firebase Auth settings.
