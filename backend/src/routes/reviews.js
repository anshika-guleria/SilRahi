import express from "express";
import { z } from "zod";
import { db, FieldValue } from "../config/firebase.js";
import { requireAuth, requireRole } from "../middleware/auth.js";
import { validate } from "../middleware/validate.js";
import { asyncHandler, HttpError } from "../utils/httpError.js";

const router = express.Router();

const reviewSchema = z.object({
  body: z.object({
    tailorId: z.string().min(1),
    bookingId: z.string().min(1),
    rating: z.number().int().min(1).max(5),
    comment: z.string().max(800).optional()
  })
});

async function refreshRating(tailorId) {
  const snapshot = await db.collection("reviews").where("tailorId", "==", tailorId).get();
  const reviews = snapshot.docs.map((doc) => doc.data());
  const total = reviews.reduce((sum, review) => sum + review.rating, 0);
  const rating = reviews.length ? Number((total / reviews.length).toFixed(1)) : 0;
  await db.collection("tailors").doc(tailorId).set(
    {
      rating,
      reviewCount: reviews.length,
      updatedAt: FieldValue.serverTimestamp()
    },
    { merge: true }
  );
}

router.post(
  "/",
  requireAuth,
  requireRole("customer"),
  validate(reviewSchema),
  asyncHandler(async (req, res) => {
    const tailorDoc = await db.collection("tailors").doc(req.validated.body.tailorId).get();
    if (!tailorDoc.exists) {
      throw new HttpError(404, "Tailor not found");
    }

    const bookingDoc = await db.collection("bookings").doc(req.validated.body.bookingId).get();
    if (!bookingDoc.exists) {
      throw new HttpError(404, "Booking not found");
    }
    const booking = bookingDoc.data();
    if (
      booking.customerId !== req.user.uid ||
      booking.tailorId !== req.validated.body.tailorId ||
      booking.status !== "delivered"
    ) {
      throw new HttpError(403, "Reviews are allowed only after your delivered order");
    }

    const existing = await db
      .collection("reviews")
      .where("bookingId", "==", req.validated.body.bookingId)
      .where("customerId", "==", req.user.uid)
      .get();
    if (!existing.empty) {
      throw new HttpError(409, "Review already submitted for this booking");
    }

    const ref = await db.collection("reviews").add({
      ...req.validated.body,
      customerId: req.user.uid,
      customerName: req.user.name,
      createdAt: FieldValue.serverTimestamp()
    });
    await refreshRating(req.validated.body.tailorId);
    const doc = await ref.get();
    res.status(201).json({ review: { id: doc.id, ...doc.data() } });
  })
);

router.get(
  "/tailor/:tailorId",
  asyncHandler(async (req, res) => {
    const snapshot = await db.collection("reviews").where("tailorId", "==", req.params.tailorId).get();
    res.json({ reviews: snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })) });
  })
);

export default router;
