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
  pickupDeliveryAddress: z.string().optional(),
  deliveryDate: z.string().min(8),
  measurements: z.record(z.string()).optional()
});

const statusSchema = z.object({
  body: z.object({
    status: z.enum(["pending", "accepted", "rejected", "in_progress", "ready", "delivered", "cancelled"]),
    paymentAmount: z.preprocess(
      (value) => (value === "" || value === undefined || value === null ? undefined : Number(value)),
      z.number().min(0).optional()
    )
  })
});

const paymentSchema = z.object({
  body: z.object({
    method: z.enum(["upi", "cash", "other"]).default("upi"),
    reference: z.string().max(120).optional()
  })
});

function bookingFromDoc(doc) {
  return { id: doc.id, ...doc.data() };
}

function amountFromFeeText(value) {
  const match = String(value || "").replace(/,/g, "").match(/\d+(\.\d+)?/);
  return match ? Number(match[0]) : 0;
}

function estimateBookingAmount(tailor, serviceType) {
  const service = String(serviceType || "").toLowerCase();
  const fee = (tailor.serviceFees || []).find((item) =>
    service.includes(String(item.service || "").toLowerCase())
  );
  return amountFromFeeText(fee?.fee || tailor.priceRange);
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

    const tailor = tailorDoc.data();
    const visitAddress = tailor.address || "Tailor location";
    const paymentAmount = estimateBookingAmount(tailor, data.serviceType);
    let referenceImageUrl = "";
    let referenceUploadFailed = false;
    if (req.file) {
      try {
        referenceImageUrl = await uploadBookingReference(req.user.uid, req.file);
      } catch {
        referenceUploadFailed = true;
      }
    }
    const bookingData = {
      ...data,
      pickupDeliveryAddress: data.pickupDeliveryAddress || visitAddress,
      visitAddress,
      fulfillmentMode: "customer_visits_tailor"
    };
    delete bookingData.pickupDeliveryAddress;
    const ref = await db.collection("bookings").add({
      ...bookingData,
      customerId: req.user.uid,
      customerEmail: req.user.email,
      tailorName: tailor.name,
      tailorPhone: tailor.phone || "",
      paymentAmount,
      paymentStatus: "unpaid",
      paymentMethod: "",
      paymentReference: "",
      paymentUpiId: tailor.paymentUpiId || "",
      paymentPhone: tailor.paymentPhone || tailor.phone || "",
      referenceImageUrl,
      referenceUploadFailed,
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

router.patch(
  "/:id/payment",
  requireAuth,
  requireRole("customer"),
  validate(paymentSchema),
  asyncHandler(async (req, res) => {
    const doc = await db.collection("bookings").doc(req.params.id).get();
    if (!doc.exists) {
      throw new HttpError(404, "Booking not found");
    }

    const booking = doc.data();
    if (booking.customerId !== req.user.uid) {
      throw new HttpError(403, "Cannot pay for another customer's booking");
    }
    if (!["ready", "delivered"].includes(booking.status)) {
      throw new HttpError(400, "Payment is available only after the tailor marks the work ready");
    }

    const payment = {
      paymentStatus: "paid",
      paymentMethod: req.validated.body.method,
      paymentReference: req.validated.body.reference || "",
      paidAt: FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp()
    };

    await doc.ref.update(payment);
    await db.collection("notifications").add({
      userId: booking.tailorId,
      type: "payment_received",
      title: "Payment received",
      body: `${booking.customerName} marked payment for ${booking.serviceType}`,
      read: false,
      createdAt: FieldValue.serverTimestamp()
    });

    const updated = await doc.ref.get();
    res.json({ booking: bookingFromDoc(updated) });
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
    const nextPaymentAmount = req.validated.body.paymentAmount;

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

    const update = {
      status: nextStatus,
      updatedAt: FieldValue.serverTimestamp()
    };
    if (nextStatus === "ready") {
      update.paymentDue = true;
      update.paymentRequestedAt = FieldValue.serverTimestamp();
      if (nextPaymentAmount !== undefined) {
        update.paymentAmount = nextPaymentAmount;
      }
    }
    await doc.ref.update(update);
    await db.collection("notifications").add({
      userId: booking.customerId,
      type: "booking_status",
      title: nextStatus === "ready" ? "Work ready - payment due" : "Order status updated",
      body:
        nextStatus === "ready"
          ? `${booking.serviceType} is ready. Please pay ₹${nextPaymentAmount ?? booking.paymentAmount ?? 0} to the tailor and collect your clothes.`
          : `${booking.serviceType} is now ${nextStatus.replace("_", " ")}`,
      read: false,
      createdAt: FieldValue.serverTimestamp()
    });
    const updated = await doc.ref.get();
    res.json({ booking: bookingFromDoc(updated) });
  })
);

export default router;
