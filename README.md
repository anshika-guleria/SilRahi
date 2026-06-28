# Silrahi

[![CI](https://github.com/Amit01-developer/SilRahi/actions/workflows/ci.yml/badge.svg)](https://github.com/Amit01-developer/SilRahi/actions/workflows/ci.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)

Silrahi is a production-ready women-support platform for tailoring and sewing work. Customers can discover verified women tailors, book stitching orders with measurements and design references, visit the tailor's listed work location, track status, message the tailor, and review after completion. Tailors can manage profile, pricing, work samples, availability, orders, and estimated earnings.

## Tech Stack

| Layer | Technology |
| --- | --- |
| Frontend | React, Vite, Tailwind CSS |
| Backend | Node.js, Express |
| Auth | Firebase Auth + app JWT |
| Database | Cloud Firestore |
| Storage | Firebase Storage |
| Maps | Leaflet + OpenStreetMap |
| Security | Helmet, rate limiting, Zod validation, Firebase rules |

## Features

- Role-based signup/login for Customer and Tailor
- Google login through Firebase Auth
- Session validation with `/auth/me`
- Protected API routes with role checks
- Tailor profile with photo, address, map coordinates, services, pricing, experience, availability, work samples, ratings, and reviews
- Tailor signup and profile map pin support
- Customer location map pin support for nearby tailor discovery
- Customer search by text, service, availability, radius, location, rating, and price
- Geolocation and clicked-pin based nearby tailor map with marker popups
- Booking creation with expected completion date, measurements, and cloth/design reference image
- Order lifecycle: Pending, Accepted, Rejected, In Progress, Ready, Delivered, Cancelled
- Customer dashboard: bookings, nearby/recommended tailors, saved tailors, profile settings, cancellation, review after completion
- Tailor dashboard: new orders, active orders, completed orders, estimated earnings, profile management, work sample upload
- Firestore collections for `users`, `customers`, `tailors`, `bookings`, `reviews`, `messages`, and `notifications`
- Firebase Firestore and Storage rules included
- Vercel/Netlify/Firebase Hosting ready frontend build

## Project Structure

```text
newSilRahi/
  .github/          CI, issue templates, PR template
  backend/
    src/
      config/          Firebase Admin setup
      middleware/      Auth, roles, validation
      routes/          Auth, users, tailors, bookings, reviews, messages, admin
      utils/           Upload, geo, error helpers
      server.js
  frontend/
    src/
      components/      Shared UI
      context/         Auth state/session
      pages/           Landing, dashboards, map, profile, admin
      services/        API client
  docs/             Architecture and development guide
  docs/DEPLOYMENT.md
  CONTRIBUTING.md
  CODE_OF_CONDUCT.md
  SECURITY.md
  LICENSE
  firestore.rules
  storage.rules
  firebase.json
```

## Environment

Create `backend/.env` from `backend/.env.example`:

```env
PORT=5000
NODE_ENV=development
FRONTEND_URL=https://sil-rahi.vercel.app
JWT_SECRET=replace-with-a-long-random-secret
JWT_EXPIRES_IN=7d
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xxxxx@your-project-id.iam.gserviceaccount.com
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nYOUR_PRIVATE_KEY\n-----END PRIVATE KEY-----\n"
FIREBASE_STORAGE_BUCKET=your-project-id.appspot.com
ADMIN_EMAIL=admin@silrahi.com
ADMIN_PASSWORD=ChangeMe123!
ADMIN_NAME=Silrahi Admin
```

Create `frontend/.env` from `frontend/.env.example`:

```env
VITE_API_URL=https://silrahi.onrender.com/api
VITE_FIREBASE_API_KEY=your-web-api-key
VITE_FIREBASE_AUTH_DOMAIN=your-project-id.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-project-id.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your-sender-id
VITE_FIREBASE_APP_ID=your-app-id
```

Do not commit real `.env` files or service account keys.

## Run Locally

Prerequisites:

- Node.js 20 or newer
- npm
- Firebase project with Authentication, Firestore, and Storage enabled

Install:

```bash
npm run install:all
```

Start backend:

```bash
npm run dev:backend
```

Start frontend:

```bash
npm run dev:frontend
```

Open:

```text
https://sil-rahi.vercel.app
```

Health check:

```text
https://silrahi.onrender.com/api/health
```

For a deeper contributor setup guide, see [docs/DEVELOPMENT.md](docs/DEVELOPMENT.md).

## Firebase Setup

1. Create a Firebase project.
2. Enable Email/Password and Google providers in Authentication.
3. Create Firestore Database.
4. Enable Firebase Storage.
5. Create a Firebase Admin service account and use it in `backend/.env`.
6. Create a Firebase Web App and use its config in `frontend/.env`.
7. Deploy rules:

```bash
firebase deploy --only firestore:rules,storage
```

## API Overview

Base URL: `https://silrahi.onrender.com/api`

| Method | Endpoint | Access |
| --- | --- | --- |
| POST | `/auth/register` | Public |
| POST | `/auth/login` | Public |
| POST | `/auth/firebase` | Public |
| GET | `/auth/me` | Logged in |
| GET | `/tailors` | Public verified listings |
| GET | `/tailors/:id` | Public |
| GET | `/tailors/me` | Tailor |
| GET | `/tailors/me/dashboard` | Tailor |
| PUT | `/tailors/me` | Tailor |
| POST | `/tailors/me/photo` | Tailor |
| POST | `/tailors/me/work-samples` | Tailor |
| GET | `/customers/me` | Customer |
| GET | `/customers/me/dashboard` | Customer |
| PUT | `/customers/me` | Customer |
| POST | `/bookings` | Customer |
| GET | `/bookings` | Customer, Tailor, Admin |
| PATCH | `/bookings/:id/status` | Customer cancel, Tailor/Admin update |
| POST | `/reviews` | Customer after completed order |
| GET | `/reviews/tailor/:tailorId` | Public |
| GET | `/messages/:bookingId` | Booking participants |
| POST | `/messages/:bookingId` | Booking participants |

## Deployment

See [docs/DEPLOYMENT.md](docs/DEPLOYMENT.md) for the production setup.

## Verification

Run all project checks:

```bash
npm run check
```

Production frontend build only:

```bash
npm run build
```

Backend syntax check:

```bash
node --check backend/src/server.js
```

## Contributing

Contributions are welcome. Please read:

- [CONTRIBUTING.md](CONTRIBUTING.md)
- [CODE_OF_CONDUCT.md](CODE_OF_CONDUCT.md)
- [SECURITY.md](SECURITY.md)
- [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md)
- [docs/DEPLOYMENT.md](docs/DEPLOYMENT.md)

Good first contribution areas:

- UI accessibility and responsive polish
- Form validation and error states
- Firebase rules hardening
- Booking and messaging UX
- Tests and deployment examples

## GitHub Upload Checklist

Before pushing this project to GitHub:

1. Keep real secrets only in local `.env` files. Do not upload `backend/.env`, `frontend/.env`, Firebase private keys, or service-account JSON files.
2. Commit `backend/.env.example` and `frontend/.env.example` only.
3. Do not commit `node_modules/`, `frontend/dist/`, logs, caches, or editor folders. These are covered by `.gitignore`.
4. Confirm the README badge points to the correct GitHub repository.
5. If this folder is not already its own Git repository, create a clean standalone repo from inside `newSilRahi`:

```bash
git init
git add .
git commit -m "Initial Silrahi app"
git branch -M main
git remote add origin https://github.com/Amit01-developer/SilRahi.git
git push -u origin main
```

After cloning from GitHub, install dependencies again:

```bash
npm run install:all
```

## Notes

- Public map results show verified tailors by default.
- Customers can cancel only pending bookings.
- Reviews require a completed booking.
- Tailor earnings are estimated from completed orders and service fee entries.
- Image uploads go to Firebase Storage through backend-validated endpoints.
