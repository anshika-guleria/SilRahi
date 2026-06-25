import express from "express";
import { z } from "zod";
import { db, FieldValue } from "../config/firebase.js";
import { requireAuth } from "../middleware/auth.js";
import { validate } from "../middleware/validate.js";
import { asyncHandler, HttpError } from "../utils/httpError.js";

const router = express.Router();

const messageSchema = z.object({
  body: z.object({
    text: z.string().min(1).max(1000)
  })
});

async function getAllowedBooking(bookingId, user) {
  const bookingDoc = await db.collection("bookings").doc(bookingId).get();
  if (!bookingDoc.exists) {
    throw new HttpError(404, "Booking not found");
  }

  const booking = bookingDoc.data();
  const isParticipant = booking.customerId === user.uid || booking.tailorId === user.uid;
  if (!isParticipant && user.role !== "admin") {
    throw new HttpError(403, "You cannot access this conversation");
  }
  return { id: bookingDoc.id, ...booking };
}

router.get(
  "/:bookingId",
  requireAuth,
  asyncHandler(async (req, res) => {
    await getAllowedBooking(req.params.bookingId, req.user);
    const snapshot = await db.collection("messages").where("bookingId", "==", req.params.bookingId).get();
    const messages = snapshot.docs
      .map((doc) => ({ id: doc.id, ...doc.data() }))
      .sort((a, b) => String(a.createdAt || "").localeCompare(String(b.createdAt || "")));
    res.json({ messages });
  })
);

router.post(
  "/:bookingId",
  requireAuth,
  validate(messageSchema),
  asyncHandler(async (req, res) => {
    const booking = await getAllowedBooking(req.params.bookingId, req.user);
    const receiverId = req.user.uid === booking.customerId ? booking.tailorId : booking.customerId;
    const ref = await db.collection("messages").add({
      bookingId: req.params.bookingId,
      senderId: req.user.uid,
      senderName: req.user.name,
      receiverId,
      text: req.validated.body.text,
      createdAt: FieldValue.serverTimestamp()
    });

    await db.collection("notifications").add({
      userId: receiverId,
      type: "message",
      title: "New message",
      body: `${req.user.name}: ${req.validated.body.text.slice(0, 90)}`,
      read: false,
      createdAt: FieldValue.serverTimestamp()
    });

    const doc = await ref.get();
    res.status(201).json({ message: { id: doc.id, ...doc.data() } });
  })
);

export default router;
