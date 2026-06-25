# Architecture

Silrahi is split into a React frontend and an Express backend backed by Firebase services.

## Frontend

- `frontend/src/pages`: screens for landing, auth, dashboards, map search, profile, and admin.
- `frontend/src/components`: shared UI elements such as buttons, fields, shell layout, and map location picker.
- `frontend/src/context/AuthContext.jsx`: login, signup, Google auth, session storage, and session restore.
- `frontend/src/services/api.js`: single API client used by pages.

## Backend

- `backend/src/server.js`: Express app, middleware, health route, route registration, and first-admin bootstrap.
- `backend/src/config/firebase.js`: Firebase Admin initialization.
- `backend/src/middleware`: auth, role checks, and request validation.
- `backend/src/routes`: auth, customer, tailor, booking, review, message, and admin endpoints.
- `backend/src/utils`: upload helpers, geo helpers, and HTTP error handling.

## Data Model

Firestore collections:

- `users`: shared user profile and role.
- `customers`: customer profile, address, and pickup location.
- `tailors`: tailor profile, shop details, services, prices, location, ratings, and verification state.
- `bookings`: customer-tailor order lifecycle.
- `reviews`: customer feedback for delivered bookings.
- `messages`: booking-scoped conversation messages.
- `notifications`: reserved for user notifications.

## Authorization

- Customers manage their own profile, bookings, reviews, and messages.
- Tailors manage their own profile, work samples, booking status updates, and booking messages.
- Admin users can verify tailors and inspect platform data.

## Map Search

Tailors save a map pin during signup or profile editing. Customers can use their saved pickup location, current browser location, or a clicked map pin to search nearby verified tailors within a radius.
