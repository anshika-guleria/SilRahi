import express from "express";
import { z } from "zod";
import { auth, db, FieldValue } from "../config/firebase.js";
import { requireAuth, requireRole } from "../middleware/auth.js";
import { validate } from "../middleware/validate.js";
import { asyncHandler, HttpError } from "../utils/httpError.js";

const router = express.Router();

router.use(requireAuth, requireRole("admin"));

const verificationSchema = z.object({
  body: z.object({
    verified: z.boolean()
  })
});

router.get(
  "/users",
  asyncHandler(async (req, res) => {
    const snapshot = await db.collection("users").get();
    res.json({
      users: snapshot.docs.map((doc) => {
        const user = doc.data();
        delete user.passwordHash;
        return { id: doc.id, ...user };
      })
    });
  })
);

router.get(
  "/tailors",
  asyncHandler(async (req, res) => {
    const snapshot = await db.collection("tailors").get();
    res.json({ tailors: snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })) });
  })
);

router.patch(
  "/tailors/:id/verify",
  validate(verificationSchema),
  asyncHandler(async (req, res) => {
    const ref = db.collection("tailors").doc(req.params.id);
    const doc = await ref.get();
    if (!doc.exists) {
      throw new HttpError(404, "Tailor not found");
    }

    await ref.update({
      verified: req.validated.body.verified,
      verifiedAt: req.validated.body.verified ? FieldValue.serverTimestamp() : null,
      updatedAt: FieldValue.serverTimestamp()
    });
    const updated = await ref.get();
    res.json({ tailor: { id: updated.id, ...updated.data() } });
  })
);

router.get(
  "/bookings",
  asyncHandler(async (req, res) => {
    const snapshot = await db.collection("bookings").get();
    res.json({ bookings: snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })) });
  })
);

router.delete(
  "/users/:id",
  asyncHandler(async (req, res) => {
    await auth.deleteUser(req.params.id).catch(() => null);
    const userDoc = await db.collection("users").doc(req.params.id).get();
    if (!userDoc.exists) {
      throw new HttpError(404, "User not found");
    }

    const role = userDoc.data().role;
    await db.collection("users").doc(req.params.id).delete();
    if (role === "tailor") {
      await db.collection("tailors").doc(req.params.id).delete();
    }
    if (role === "customer") {
      await db.collection("customers").doc(req.params.id).delete();
    }
    res.json({ message: "User removed" });
  })
);

export default router;
