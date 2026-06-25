import express from "express";
import { z } from "zod";
import { db, FieldValue } from "../config/firebase.js";
import { requireAuth, requireRole } from "../middleware/auth.js";
import { validate } from "../middleware/validate.js";
import { distanceKm, isValidCoordinate, toCoordinate } from "../utils/geo.js";
import { asyncHandler, HttpError } from "../utils/httpError.js";
import { upload, uploadProfilePhoto, uploadWorkSample } from "../utils/upload.js";

const router = express.Router();

const profileSchema = z.object({
  body: z.object({
    name: z.string().min(2).optional(),
    shopName: z.string().min(2).optional(),
    shopType: z.enum(["Home-based", "Shop", "Online"]).optional(),
    phone: z.string().min(10).max(15).optional(),
    address: z.string().min(3).optional(),
    location: z
      .object({
        lat: z.number().min(-90).max(90),
        lng: z.number().min(-180).max(180)
      })
      .optional(),
    skills: z.array(z.string()).optional(),
    serviceFees: z
      .array(
        z.object({
          service: z.string().min(2),
          fee: z.string().min(1)
        })
      )
      .optional(),
    experienceYears: z.number().min(0).max(80).optional(),
    priceRange: z.string().optional(),
    availability: z.enum(["available", "busy", "offline"]).optional(),
    about: z.string().max(1000).optional(),
    workSamples: z.array(z.string().url()).optional()
  })
});

function tailorFromDoc(doc) {
  return doc.exists ? { id: doc.id, ...doc.data() } : null;
}

router.get(
  "/",
  asyncHandler(async (req, res) => {
    const {
      service,
      search,
      availability,
      lat,
      lng,
      radiusKm = 20,
      verified = "true",
      sort = "distance"
    } = req.query;
    let snapshot = await db.collection("tailors").get();
    let tailors = snapshot.docs.map(tailorFromDoc).filter(Boolean);

    if (verified !== "all") {
      tailors = tailors.filter((tailor) => Boolean(tailor.verified) === (verified === "true"));
    }

    if (availability && availability !== "all") {
      tailors = tailors.filter((tailor) => tailor.availability === availability);
    } else {
      tailors = tailors.filter((tailor) => tailor.availability !== "offline");
    }

    if (service) {
      const term = String(service).toLowerCase();
      tailors = tailors.filter((tailor) =>
        (tailor.skills || []).some((skill) => skill.toLowerCase().includes(term))
      );
    }

    if (search) {
      const term = String(search).toLowerCase();
      tailors = tailors.filter((tailor) =>
        [tailor.name, tailor.shopName, tailor.address, tailor.priceRange, ...(tailor.skills || [])]
          .filter(Boolean)
          .some((value) => String(value).toLowerCase().includes(term))
      );
    }

    if (lat && lng) {
      const origin = toCoordinate(lat, lng);
      if (!origin) {
        throw new HttpError(400, "Invalid search location");
      }
      const safeRadius = Math.min(Math.max(Number(radiusKm) || 20, 1), 100);
      tailors = tailors
        .filter((tailor) => isValidCoordinate(tailor.location))
        .map((tailor) => ({
          ...tailor,
          distanceKm: Number(distanceKm(origin, tailor.location).toFixed(2))
        }))
        .filter((tailor) => tailor.distanceKm <= safeRadius)
        .sort((a, b) => a.distanceKm - b.distanceKm);
    } else if (sort === "rating") {
      tailors = tailors.sort((a, b) => Number(b.rating || 0) - Number(a.rating || 0));
    } else if (sort === "newest") {
      tailors = tailors.sort((a, b) => String(b.createdAt || "").localeCompare(String(a.createdAt || "")));
    }

    res.json({ tailors });
  })
);

router.get(
  "/me",
  requireAuth,
  requireRole("tailor"),
  asyncHandler(async (req, res) => {
    const doc = await db.collection("tailors").doc(req.user.uid).get();
    res.json({ tailor: tailorFromDoc(doc) });
  })
);

router.get(
  "/me/dashboard",
  requireAuth,
  requireRole("tailor"),
  asyncHandler(async (req, res) => {
    const [tailorDoc, bookingSnapshot] = await Promise.all([
      db.collection("tailors").doc(req.user.uid).get(),
      db.collection("bookings").where("tailorId", "==", req.user.uid).get()
    ]);

    const bookings = bookingSnapshot.docs
      .map((doc) => ({ id: doc.id, ...doc.data() }))
      .sort((a, b) => String(b.createdAt || "").localeCompare(String(a.createdAt || "")));

    const stats = {
      totalOrders: bookings.length,
      pendingOrders: bookings.filter((booking) => booking.status === "pending").length,
      activeOrders: bookings.filter((booking) => ["accepted", "in_progress", "ready"].includes(booking.status)).length,
      deliveredOrders: bookings.filter((booking) => booking.status === "delivered").length,
      cancelledOrders: bookings.filter((booking) => booking.status === "cancelled").length
    };

    res.json({
      tailor: tailorFromDoc(tailorDoc),
      bookings,
      stats
    });
  })
);

router.put(
  "/me",
  requireAuth,
  requireRole("tailor"),
  validate(profileSchema),
  asyncHandler(async (req, res) => {
    const update = {
      ...req.validated.body,
      updatedAt: FieldValue.serverTimestamp()
    };
    await db.collection("tailors").doc(req.user.uid).set(update, { merge: true });
    const doc = await db.collection("tailors").doc(req.user.uid).get();
    res.json({ tailor: tailorFromDoc(doc) });
  })
);

router.post(
  "/me/photo",
  requireAuth,
  requireRole("tailor"),
  upload.single("photo"),
  asyncHandler(async (req, res) => {
    if (!req.file) {
      throw new HttpError(400, "Profile photo is required");
    }

    const photoUrl = await uploadProfilePhoto(req.user.uid, req.file);
    await db.collection("tailors").doc(req.user.uid).set(
      {
        profilePhotoUrl: photoUrl,
        updatedAt: FieldValue.serverTimestamp()
      },
      { merge: true }
    );
    res.json({ profilePhotoUrl: photoUrl });
  })
);

router.post(
  "/me/work-samples",
  requireAuth,
  requireRole("tailor"),
  upload.single("sample"),
  asyncHandler(async (req, res) => {
    if (!req.file) {
      throw new HttpError(400, "Work sample image is required");
    }

    const sampleUrl = await uploadWorkSample(req.user.uid, req.file);
    await db.collection("tailors").doc(req.user.uid).set(
      {
        workSamples: FieldValue.arrayUnion(sampleUrl),
        updatedAt: FieldValue.serverTimestamp()
      },
      { merge: true }
    );
    res.status(201).json({ sampleUrl });
  })
);

router.get(
  "/:id",
  asyncHandler(async (req, res) => {
    const doc = await db.collection("tailors").doc(req.params.id).get();
    if (!doc.exists) {
      throw new HttpError(404, "Tailor not found");
    }
    res.json({ tailor: tailorFromDoc(doc) });
  })
);

export default router;
