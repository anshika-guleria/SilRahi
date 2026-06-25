import bcrypt from "bcryptjs";
import express from "express";
import { z } from "zod";
import { auth, db, FieldValue } from "../config/firebase.js";
import { requireAuth, signAppToken } from "../middleware/auth.js";
import { validate } from "../middleware/validate.js";
import { asyncHandler, HttpError } from "../utils/httpError.js";

const router = express.Router();

const registerSchema = z.object({
  body: z.object({
    name: z.string().min(2),
    email: z.string().email(),
    password: z.string().min(8),
    phone: z.string().min(10).max(15),
    role: z.enum(["customer", "tailor"]),
    address: z.string().min(3).optional(),
    location: z
      .object({
        lat: z.number().min(-90).max(90),
        lng: z.number().min(-180).max(180)
      })
      .optional()
  })
});

const loginSchema = z.object({
  body: z.object({
    email: z.string().email(),
    password: z.string().min(1)
  })
});

const firebaseLoginSchema = z.object({
  body: z.object({
    idToken: z.string().min(10),
    role: z.enum(["customer", "tailor"]).default("customer")
  })
});

async function createRoleProfile({ uid, name, email, phone, role }) {
  const profile = {
    uid,
    name,
    email,
    phone,
    role,
    authProvider: "google",
    createdAt: FieldValue.serverTimestamp(),
    updatedAt: FieldValue.serverTimestamp()
  };

  await db.collection("users").doc(uid).set(profile, { merge: true });

  if (role === "customer") {
    await db.collection("customers").doc(uid).set(
      {
        uid,
        name,
        email,
        phone,
        createdAt: FieldValue.serverTimestamp(),
        updatedAt: FieldValue.serverTimestamp()
      },
      { merge: true }
    );
  } else {
    await db.collection("tailors").doc(uid).set(
      {
        uid,
        name,
        email,
        phone,
        shopName: "",
        shopType: "Home-based",
        verified: false,
        availability: "available",
        skills: [],
        serviceFees: [],
        rating: 0,
        reviewCount: 0,
        createdAt: FieldValue.serverTimestamp(),
        updatedAt: FieldValue.serverTimestamp()
      },
      { merge: true }
    );
  }

  await auth.setCustomUserClaims(uid, { role });
  return profile;
}

router.post(
  "/register",
  validate(registerSchema),
  asyncHandler(async (req, res) => {
    const { name, email, password, phone, role, address, location } = req.validated.body;
    const firebaseUser = await auth.createUser({
      email,
      password,
      displayName: name,
      phoneNumber: phone.startsWith("+") ? phone : undefined
    });

    await auth.setCustomUserClaims(firebaseUser.uid, { role });
    const passwordHash = await bcrypt.hash(password, 12);
    const profile = {
      uid: firebaseUser.uid,
      name,
      email,
      phone,
      role,
      passwordHash,
      createdAt: FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp()
    };

    await db.collection("users").doc(firebaseUser.uid).set(profile);

    if (role === "customer") {
      await db.collection("customers").doc(firebaseUser.uid).set({
        uid: firebaseUser.uid,
        name,
        email,
        phone,
        createdAt: FieldValue.serverTimestamp()
      });
    } else {
      await db.collection("tailors").doc(firebaseUser.uid).set({
        uid: firebaseUser.uid,
        name,
        email,
        phone,
        shopName: "",
        shopType: "Home-based",
        address: address || "",
        location: location || null,
        verified: false,
        availability: "available",
        skills: [],
        serviceFees: [],
        rating: 0,
        reviewCount: 0,
        createdAt: FieldValue.serverTimestamp(),
        updatedAt: FieldValue.serverTimestamp()
      });
    }

    const token = signAppToken({ ...profile, uid: firebaseUser.uid });
    res.status(201).json({ token, user: { uid: firebaseUser.uid, name, email, phone, role } });
  })
);

router.post(
  "/login",
  validate(loginSchema),
  asyncHandler(async (req, res) => {
    const { email, password } = req.validated.body;
    const userRecord = await auth.getUserByEmail(email);
    const userDoc = await db.collection("users").doc(userRecord.uid).get();
    if (!userDoc.exists) {
      throw new HttpError(401, "Invalid email or password");
    }

    const user = userDoc.data();
    if (!user.passwordHash) {
      throw new HttpError(401, "Use Google login for this account");
    }
    const ok = await bcrypt.compare(password, user.passwordHash);
    if (!ok) {
      throw new HttpError(401, "Invalid email or password");
    }

    const token = signAppToken(user);
    res.json({
      token,
      user: {
        uid: user.uid,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role
      }
    });
  })
);

router.post(
  "/firebase",
  validate(firebaseLoginSchema),
  asyncHandler(async (req, res) => {
    const { idToken, role } = req.validated.body;
    const decoded = await auth.verifyIdToken(idToken);
    const userRecord = await auth.getUser(decoded.uid);
    const userRef = db.collection("users").doc(decoded.uid);
    const userDoc = await userRef.get();

    let user;
    if (userDoc.exists) {
      user = userDoc.data();
    } else {
      user = await createRoleProfile({
        uid: decoded.uid,
        name: userRecord.displayName || decoded.name || "Silrahi User",
        email: userRecord.email || decoded.email,
        phone: userRecord.phoneNumber || "",
        role
      });
    }

    const token = signAppToken(user);
    res.json({
      token,
      user: {
        uid: user.uid,
        name: user.name,
        email: user.email,
        phone: user.phone || "",
        role: user.role
      }
    });
  })
);

router.get(
  "/me",
  requireAuth,
  asyncHandler(async (req, res) => {
    res.json({ user: req.user });
  })
);

export default router;
