import jwt from "jsonwebtoken";
import { auth, db } from "../config/firebase.js";
import { HttpError } from "../utils/httpError.js";

async function attachUser(req, uid, tokenRole) {
  const userDoc = await db.collection("users").doc(uid).get();
  if (!userDoc.exists) {
    throw new HttpError(401, "User profile not found");
  }

  req.user = {
    uid,
    ...userDoc.data(),
    role: tokenRole || userDoc.data().role
  };
}

export async function requireAuth(req, res, next) {
  try {
    const header = req.headers.authorization || "";
    const token = header.startsWith("Bearer ") ? header.slice(7) : null;
    if (!token) {
      throw new HttpError(401, "Missing bearer token");
    }

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      await attachUser(req, decoded.uid, decoded.role);
      return next();
    } catch (jwtError) {
      const decoded = await auth.verifyIdToken(token);
      await attachUser(req, decoded.uid, decoded.role);
      return next();
    }
  } catch (error) {
    next(error.status ? error : new HttpError(401, "Invalid or expired token"));
  }
}

export function requireRole(...roles) {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return next(new HttpError(403, "You do not have permission for this action"));
    }
    next();
  };
}

export function signAppToken(user) {
  return jwt.sign(
    { uid: user.uid, role: user.role, email: user.email },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || "7d" }
  );
}
