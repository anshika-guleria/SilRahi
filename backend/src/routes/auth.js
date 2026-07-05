import bcrypt from "bcryptjs";
import express from "express";
import { z } from "zod";
import { auth, db, FieldValue } from "../config/firebase.js";
import { requireAuth, signAppToken } from "../middleware/auth.js";
import { validate } from "../middleware/validate.js";
import { asyncHandler, HttpError } from "../utils/httpError.js";

const router = express.Router();
const ADMIN_EMAILS = new Set(["hacktolearn001@gmail.com", process.env.ADMIN_EMAIL].filter(Boolean).map(normalizeEmail));

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
    password: z.string().min(1),
    role: z.enum(["customer", "tailor", "admin"]).optional()
  })
});

const firebaseLoginSchema = z.object({
  body: z.object({
    idToken: z.string().min(10),
    role: z.enum(["customer", "tailor"]).default("customer")
  })
});

function rolesForUser(user = {}) {
  return [...new Set([...(Array.isArray(user.roles) ? user.roles : []), user.role].filter(Boolean))];
}

function normalizeEmail(email = "") {
  return String(email).trim().toLowerCase();
}

function isAdminEmail(email = "") {
  return ADMIN_EMAILS.has(normalizeEmail(email));
}

async function setAdminUser(uid, user = {}) {
  const profile = {
    ...user,
    uid,
    email: normalizeEmail(user.email),
    role: "admin",
    roles: ["admin"],
    updatedAt: FieldValue.serverTimestamp()
  };

  await db.collection("users").doc(uid).set(profile, { merge: true });
  await auth.setCustomUserClaims(uid, { role: "admin", roles: ["admin"] });
  return profile;
}

async function upsertRoleProfile({ uid, name, email, phone, role, address = "", location = null }) {
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
    return;
  }

  await db.collection("tailors").doc(uid).set(
    {
      uid,
      name,
      email,
      phone,
      shopName: name,
      shopType: "Home-based",
      address,
      location,
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

async function addRoleToUser({ uid, user, role, address = "", location = null }) {
  const roles = [...new Set([...rolesForUser(user), role])];
  await upsertRoleProfile({
    uid,
    name: user.name,
    email: user.email,
    phone: user.phone || "",
    role,
    address,
    location
  });
  await db.collection("users").doc(uid).set(
    {
      roles,
      role,
      updatedAt: FieldValue.serverTimestamp()
    },
    { merge: true }
  );
  await auth.setCustomUserClaims(uid, { role, roles });
  return { ...user, uid, role, roles };
}

async function createRoleProfile({ uid, name, email, phone, role, authProvider = "google" }) {
  const profile = {
    uid,
    name,
    email,
    phone,
    role,
    roles: [role],
    authProvider,
    createdAt: FieldValue.serverTimestamp(),
    updatedAt: FieldValue.serverTimestamp()
  };

  await db.collection("users").doc(uid).set(profile, { merge: true });
  await upsertRoleProfile({ uid, name, email, phone, role });
  await auth.setCustomUserClaims(uid, { role, roles: [role] });
  return profile;
}

router.post(
  "/register",
  validate(registerSchema),
  asyncHandler(async (req, res) => {
    const { name, email, password, phone, role, address, location } = req.validated.body;

    let existingUserRecord = null;
    try {
      existingUserRecord = await auth.getUserByEmail(email);
    } catch (err) {
      if (err.code !== "auth/user-not-found") throw err;
    }

    if (existingUserRecord) {
      const userDoc = await db.collection("users").doc(existingUserRecord.uid).get();
      if (!userDoc.exists) {
        throw new HttpError(401, "User profile not found");
      }

      const existingUser = userDoc.data();
      if (!existingUser.passwordHash) {
        throw new HttpError(401, "This email uses Google login. Continue with Google to add another role.");
      }

      const ok = await bcrypt.compare(password, existingUser.passwordHash);
      if (!ok) {
        throw new HttpError(401, "Invalid email or password");
      }

      const userWithRole = await addRoleToUser({
        uid: existingUserRecord.uid,
        user: {
          uid: existingUserRecord.uid,
          ...existingUser,
          name: existingUser.name || name,
          email,
          phone: existingUser.phone || phone
        },
        role,
        address: address || "",
        location: location || null
      });
      const token = signAppToken(userWithRole);
      return res.status(200).json({
        token,
        user: {
          uid: existingUserRecord.uid,
          name: userWithRole.name,
          email: userWithRole.email,
          phone: userWithRole.phone || "",
          role,
          roles: userWithRole.roles
        }
      });
    }

    const firebaseUser = await auth.createUser({
      email,
      password,
      displayName: name
    });

    await auth.setCustomUserClaims(firebaseUser.uid, { role, roles: [role] });
    const passwordHash = await bcrypt.hash(password, 12);
    const profile = {
      uid: firebaseUser.uid,
      name,
      email,
      phone,
      role,
      roles: [role],
      passwordHash,
      createdAt: FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp()
    };

    await db.collection("users").doc(firebaseUser.uid).set(profile);
    await upsertRoleProfile({
      uid: firebaseUser.uid,
      name,
      email,
      phone,
      role,
      address: address || "",
      location: location || null
    });

    const token = signAppToken({ uid: firebaseUser.uid, ...profile });
    res.status(201).json({
      token,
      user: { uid: firebaseUser.uid, name, email, phone, role, roles: [role] }
    });
  })
);

router.post(
  "/login",
  validate(loginSchema),
  asyncHandler(async (req, res) => {
    const { email, password, role } = req.validated.body;
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

    if (user.role === "admin" || isAdminEmail(user.email || email)) {
      const adminUser = await setAdminUser(userRecord.uid, {
        ...user,
        name: user.name || userRecord.displayName || "Silrahi Admin",
        email: user.email || email,
        phone: user.phone || ""
      });
      const token = signAppToken({ uid: userRecord.uid, ...adminUser });
      return res.json({
        token,
        user: {
          uid: userRecord.uid,
          name: adminUser.name,
          email: adminUser.email,
          phone: adminUser.phone || "",
          role: "admin",
          roles: ["admin"]
        }
      });
    }

    if (role === "admin") {
      throw new HttpError(401, "Invalid email or password");
    }

    const selectedRole = role || user.role || rolesForUser(user)[0] || "customer";
    const userWithRole = await addRoleToUser({
      uid: userRecord.uid,
      user: { uid: userRecord.uid, ...user },
      role: selectedRole
    });
    const token = signAppToken(userWithRole);
    res.json({
      token,
      user: {
        uid: userRecord.uid,
        name: userWithRole.name,
        email: userWithRole.email,
        phone: userWithRole.phone || "",
        role: selectedRole,
        roles: userWithRole.roles
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
    if (isAdminEmail(userRecord.email || decoded.email)) {
      user = await setAdminUser(decoded.uid, {
        ...(userDoc.exists ? userDoc.data() : {}),
        name: userRecord.displayName || decoded.name || "Silrahi Admin",
        email: userRecord.email || decoded.email,
        phone: userRecord.phoneNumber || ""
      });
    } else if (userDoc.exists) {
      user = await addRoleToUser({
        uid: decoded.uid,
        user: { uid: decoded.uid, ...userDoc.data() },
        role
      });
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
        role: user.role,
        roles: user.roles || [user.role]
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
