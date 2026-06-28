# Deployment Guide

Silrahi is split into a static frontend and a Node/Express API. Deploy them separately, then connect them with environment variables.

## Recommended Hosting

| Part | Recommended platform | Reason |
| --- | --- | --- |
| Frontend | Vercel | Simple Vite builds and SPA rewrites |
| Backend | Render | Long-running Express server with health checks |
| Data/Auth/Storage | Firebase | Auth, Firestore, Storage, rules |

## 1. Firebase

1. Create a Firebase project.
2. Enable Authentication providers: Email/Password and Google.
3. Create Firestore Database.
4. Enable Firebase Storage.
5. Create a Web App and copy its config into frontend env variables.
6. Create a Firebase Admin service account and copy its values into backend env variables.
7. Add your deployed frontend domain to Firebase Auth Authorized Domains.
8. Deploy rules:

```bash
firebase deploy --only firestore:rules,storage
```

## 2. Backend on Render

Use the included `render.yaml` or create a Render Web Service manually.

Manual settings:

```text
Root directory: backend
Build command: npm ci
Start command: npm start
Health check path: /api/health
Node version: 20 or newer
```

Required environment variables:

```text
NODE_ENV=production
FRONTEND_URL=https://your-frontend-domain.vercel.app
JWT_SECRET=<long-random-secret>
JWT_EXPIRES_IN=7d
FIREBASE_PROJECT_ID=<firebase-project-id>
FIREBASE_CLIENT_EMAIL=<firebase-admin-client-email>
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
FIREBASE_STORAGE_BUCKET=<firebase-project-id>.appspot.com
```

Optional first admin account:

```text
ADMIN_EMAIL=admin@example.com
ADMIN_PASSWORD=<strong-password>
ADMIN_NAME=Silrahi Admin
```

After deployment, verify:

```text
https://your-backend.onrender.com/api/health
```

## 3. Frontend on Vercel

Create a Vercel project from the repository and set:

```text
Root directory: frontend
Build command: npm run build
Output directory: dist
Install command: npm ci
```

Required environment variables:

```text
VITE_API_URL=https://your-backend.onrender.com/api
VITE_FIREBASE_API_KEY=<web-api-key>
VITE_FIREBASE_AUTH_DOMAIN=<project-id>.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=<project-id>
VITE_FIREBASE_STORAGE_BUCKET=<project-id>.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=<sender-id>
VITE_FIREBASE_APP_ID=<app-id>
```

The included `frontend/vercel.json` handles SPA route rewrites.

## 4. Final Checks

Before sharing the open-source demo link:

```bash
npm run check
```

Confirm:

- `backend/.env` and `frontend/.env` are not committed.
- The deployed frontend can register/login.
- Google login has the deployed frontend domain authorized in Firebase.
- The frontend `VITE_API_URL` points to the deployed backend `/api`.
- The backend `FRONTEND_URL` exactly matches the deployed frontend domain.
- Firestore and Storage rules are deployed.
