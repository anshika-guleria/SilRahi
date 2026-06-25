import express from "express";
import { z } from "zod";
import { db, FieldValue } from "../config/firebase.js";
import { requireAuth, requireRole } from "../middleware/auth.js";
import { validate } from "../middleware/validate.js";
import { asyncHandler, HttpError } from "../utils/httpError.js";
import { upload, uploadBookingReference } from "../utils/upload.js";

const router = express.Router();

const bookingPayloadSchema = z.object({
  tailorId: z.string().min(1),
  customerName: z.string().min(2),
  serviceType: z.string().min(2),
  description: z.string().min(3),
  pickupDeliveryAddress: z.string().min(5),
  deliveryDate: z.string().min(8),
  measurements: z.record(z.string()).optional()
});

const statusSchema = z.object({
  body: z.object({
    status: z.enum(["pending", "accepted", "rejected", "in_progress", "ready", "delivered", "cancelled"])
  })
});

function bookingFromDoc(doc) {
  return { id: doc.id, ...doc.data() };
}

router.post(
  "/",
  requireAuth,
  requireRole("customer"),
  upload.single("referenceImage"),
  asyncHandler(async (req, res) => {
    let measurements = req.body.measurements;
    if (typeof measurements === "string") {
      try {
        measurements = JSON.parse(measurements || "{}");
      } catch {
        throw new HttpError(400, "Measurements must be valid JSON");
      }
    }
    const parsed = bookingPayloadSchema.safeParse({
      ...req.body,
      deliveryDate: req.body.deliveryDate || req.body.preferredDate,
      measurements
    });
    if (!parsed.success) {
      throw new HttpError(400, "Invalid booking details", parsed.error.flatten());
    }
    const data = parsed.data;
    const tailorDoc = await db.collection("tailors").doc(data.tailorId).get();
    if (!tailorDoc.exists || !tailorDoc.data().verified) {
      throw new HttpError(404, "Verified tailor not found");
    }

    const referenceImageUrl = req.file ? await uploadBookingReference(req.user.uid, req.file) : "";
    const ref = await db.collection("bookings").add({
      ...data,
      customerId: req.user.uid,
      customerEmail: req.user.email,
      tailorName: tailorDoc.data().name,
      tailorPhone: tailorDoc.data().phone || "",
      referenceImageUrl,
      status: "pending",
      createdAt: FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp()
    });

    await db.collection("notifications").add({
      userId: data.tailorId,
      type: "booking_created",
      title: "New booking request",
      body: `${data.customerName} requested ${data.serviceType}`,
      read: false,
      createdAt: FieldValue.serverTimestamp()
    });

    const doc = await ref.get();
    res.status(201).json({ booking: bookingFromDoc(doc) });
  })
);

router.get(
  "/",
  requireAuth,
  asyncHandler(async (req, res) => {
    let query = db.collection("bookings");
    if (req.user.role === "customer") {
      query = query.where("customerId", "==", req.user.uid);
    } else if (req.user.role === "tailor") {
      query = query.where("tailorId", "==", req.user.uid);
    }

    const snapshot = await query.get();
    const bookings = snapshot.docs
      .map(bookingFromDoc)
      .sort((a, b) => String(b.createdAt || "").localeCompare(String(a.createdAt || "")));
    res.json({ bookings });
  })
);

router.patch(
  "/:id/status",
  requireAuth,
  validate(statusSchema),
  asyncHandler(async (req, res) => {
    const doc = await db.collection("bookings").doc(req.params.id).get();
    if (!doc.exists) {
      throw new HttpError(404, "Booking not found");
    }

    const booking = doc.data();
    const nextStatus = req.validated.body.status;

    if (req.user.role === "customer") {
      if (booking.customerId !== req.user.uid) {
        throw new HttpError(403, "Cannot update another customer's booking");
      }
      if (nextStatus !== "cancelled") {
        throw new HttpError(403, "Customers can only cancel bookings");
      }
      if (booking.status !== "pending") {
        throw new HttpError(400, "This booking can no longer be cancelled");
      }
    } else if (req.user.role === "tailor") {
      if (booking.tailorId !== req.user.uid) {
        throw new HttpError(403, "Cannot update another tailor's booking");
      }
      if (nextStatus === "cancelled") {
        throw new HttpError(403, "Tailors cannot mark customer bookings as cancelled");
      }
    } else if (req.user.role !== "admin") {
      throw new HttpError(403, "You do not have permission for this action");
    }

    await doc.ref.update({
      status: nextStatus,
      updatedAt: FieldValue.serverTimestamp()
    });
    await db.collection("notifications").add({
      userId: booking.customerId,
      type: "booking_status",
      title: "Order status updated",
      body: `${booking.serviceType} is now ${nextStatus.replace("_", " ")}`,
      read: false,
      createdAt: FieldValue.serverTimestamp()
    });
    const updated = await doc.ref.get();
    res.json({ booking: bookingFromDoc(updated) });
  })
);

export default router;
