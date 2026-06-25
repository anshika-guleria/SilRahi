import multer from "multer";
import { bucket } from "../config/firebase.js";

export const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 3 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    if (!file.mimetype.startsWith("image/")) {
      return cb(new Error("Only image uploads are allowed"));
    }
    cb(null, true);
  }
});

export async function uploadProfilePhoto(uid, file) {
  const extension = file.originalname.split(".").pop() || "jpg";
  const path = `tailors/${uid}/profile-${Date.now()}.${extension}`;
  return uploadImage(path, file);
}

export async function uploadWorkSample(uid, file) {
  const extension = file.originalname.split(".").pop() || "jpg";
  const path = `tailors/${uid}/samples/sample-${Date.now()}.${extension}`;
  return uploadImage(path, file);
}

export async function uploadBookingReference(uid, file) {
  const extension = file.originalname.split(".").pop() || "jpg";
  const path = `bookings/${uid}/references/reference-${Date.now()}.${extension}`;
  return uploadImage(path, file);
}

async function uploadImage(path, file) {
  const firebaseFile = bucket.file(path);

  await firebaseFile.save(file.buffer, {
    metadata: { contentType: file.mimetype },
    resumable: false
  });

  await firebaseFile.makePublic();
  return `https://storage.googleapis.com/${bucket.name}/${path}`;
}
