import "dotenv/config";
import cors from "cors";
import express from "express";
import rateLimit from "express-rate-limit";
import helmet from "helmet";
import morgan from "morgan";
import bcrypt from "bcryptjs";
import { auth, db, FieldValue } from "./config/firebase.js";
import adminRoutes from "./routes/admin.js";
import aiRoutes from "./routes/ai.js";
import authRoutes from "./routes/auth.js";
import bookingRoutes from "./routes/bookings.js";
import customerRoutes from "./routes/customers.js";
import messageRoutes from "./routes/messages.js";
import reviewRoutes from "./routes/reviews.js";
import tailorRoutes from "./routes/tailors.js";
import { errorHandler, notFound } from "./utils/httpError.js";

const app = express();
const port = process.env.PORT || 5000;

app.use(helmet());

function normalizeOrigin(origin) {
  return String(origin || "").trim().replace(/\/+$/, "");
}

// Support multiple frontend origins (handles Vite port shifting 5173→5174 etc.)
const allowedOrigins = (process.env.FRONTEND_URL || "https://sil-rahi.vercel.app")
  .split(",")
  .map(normalizeOrigin)
  .filter(Boolean)
  .concat(
    process.env.NODE_ENV === "production"
      ? []
      : [
          "http://localhost:5173",
          "http://localhost:5174",
          "http://localhost:5175",
          "http://localhost:5176",
          "http://127.0.0.1:5173",
          "http://127.0.0.1:5174",
          "http://127.0.0.1:5175",
          "http://127.0.0.1:5176"
        ]
  );

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (e.g. curl, mobile apps, server-to-server)
      if (!origin) return callback(null, true);
      if (allowedOrigins.includes(normalizeOrigin(origin))) return callback(null, true);
      callback(new Error(`CORS: Origin ${origin} not allowed`));
    },
    credentials: true
  })
);
app.use(express.json({ limit: "1mb" }));
app.use(morgan("dev"));
app.use(
  rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 250,
    standardHeaders: true,
    legacyHeaders: false
  })
);

app.get("/api/health", (req, res) => {
  res.json({ status: "ok", service: "Silrahi API" });
});

app.get("/", (req, res) => {
  res.json({ status: "ok", service: "Silrahi API", health: "/api/health" });
});

app.use("/api/auth", authRoutes);
app.use("/api/ai", aiRoutes);
app.use("/api/tailors", tailorRoutes);
app.use("/api/customers", customerRoutes);
app.use("/api/bookings", bookingRoutes);
app.use("/api/reviews", reviewRoutes);
app.use("/api/messages", messageRoutes);
app.use("/api/admin", adminRoutes);

app.use(notFound);
app.use(errorHandler);

async function ensureAdmin() {
  const { ADMIN_EMAIL, ADMIN_PASSWORD, ADMIN_NAME } = process.env;
  if (!ADMIN_EMAIL || !ADMIN_PASSWORD) {
    return;
  }

  let userRecord;
  try {
    userRecord = await auth.getUserByEmail(ADMIN_EMAIL);
  } catch {
    userRecord = await auth.createUser({
      email: ADMIN_EMAIL,
      password: ADMIN_PASSWORD,
      displayName: ADMIN_NAME || "Silrahi Admin"
    });
  }

  await auth.setCustomUserClaims(userRecord.uid, { role: "admin" });
  const existing = await db.collection("users").doc(userRecord.uid).get();
  if (!existing.exists) {
    await db.collection("users").doc(userRecord.uid).set({
      uid: userRecord.uid,
      name: ADMIN_NAME || "Silrahi Admin",
      email: ADMIN_EMAIL,
      phone: "",
      role: "admin",
      passwordHash: await bcrypt.hash(ADMIN_PASSWORD, 12),
      createdAt: FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp()
    });
  }
}

async function startServer() {
  try {
    await ensureAdmin();
  } catch (error) {
    if (process.env.NODE_ENV === "production") {
      throw error;
    }
    console.warn("Admin bootstrap skipped in local development:", error.message);
  }

  if (process.env.VERCEL !== "1") {
    app.listen(port, () => {
      console.log(`Silrahi API running on http://localhost:${port}`);
    });
  }
}

startServer()
  .catch((error) => {
    console.error("Failed to start Silrahi API", error);
    if (process.env.VERCEL === "1") {
      throw error;
    }
    process.exit(1);
  });

export default app;
