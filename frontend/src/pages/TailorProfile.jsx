import { CalendarDays, ImagePlus, MapPin, Star } from "lucide-react";
import { useEffect, useState } from "react";
import { Button } from "../components/Button";
import { Field, inputClass } from "../components/Field";
import { useAuth } from "../context/AuthContext";
import { api } from "../services/api";

export function TailorProfile({ tailor, setPage }) {
  const { user } = useAuth();
  const [reviews, setReviews] = useState([]);
  const [referenceImage, setReferenceImage] = useState(null);
  const [form, setForm] = useState({
    customerName: user?.name || "",
    tailorId: tailor?.id || tailor?.uid || "",
    serviceType: "",
    description: "",
    bust: "",
    waist: "",
    hip: "",
    shoulder: "",
    length: "",
    deliveryDate: ""
  });
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!tailor?.id && !tailor?.uid) return;
    api.reviews(tailor.id || tailor.uid).then((data) => setReviews(data.reviews || [])).catch(() => setReviews([]));
  }, [tailor]);

  if (!tailor) {
    return <main className="p-8">No tailor selected.</main>;
  }

  function update(field, value) {
    setForm((current) => ({ ...current, [field]: value }));
  }

  async function book(event) {
    event.preventDefault();
    if (!user) {
      setPage("auth");
      return;
    }
    setLoading(true);
    setMessage("");
    try {
      const payload = new FormData();
      payload.append("customerName", form.customerName);
      payload.append("tailorId", tailor.id || tailor.uid);
      payload.append("serviceType", form.serviceType);
      payload.append("description", form.description);
      payload.append("deliveryDate", form.deliveryDate);
      payload.append(
        "measurements",
        JSON.stringify({
          bust: form.bust,
          waist: form.waist,
          hip: form.hip,
          shoulder: form.shoulder,
          length: form.length
        })
      );
      if (referenceImage) payload.append("referenceImage", referenceImage);
      await api.createBooking(payload);
      setMessage("Booking created. You can track it from your dashboard.");
    } catch (err) {
      setMessage(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-[#fafafa]">
      {/* dark header */}
      <div className="relative overflow-hidden bg-gradient-to-r from-neutral-950 via-[#1a0a1f] to-[#0f0a1e] px-4 py-7 sm:py-8">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(190,24,93,0.15),transparent_60%)]" />
        <div className="relative mx-auto flex max-w-6xl flex-col gap-3 sm:flex-row sm:items-center sm:gap-4">
          <button onClick={() => setPage("map")} className="flex w-fit items-center gap-2 rounded-xl border border-neutral-700 bg-neutral-800 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-neutral-700">
            ← Back
          </button>
          <div className="min-w-0">
            <h1 className="break-words text-xl font-extrabold text-white">{tailor.name}</h1>
            <p className="text-sm text-neutral-400">{tailor.shopName || "Home tailor"} · {tailor.shopType || "Home-based"}</p>
          </div>
        </div>
      </div>

      <div className="mx-auto grid max-w-6xl gap-6 px-4 py-6 sm:py-8 md:grid-cols-[0.9fr_1.1fr]">
      <section className="rounded-2xl border border-neutral-100 bg-white p-4 shadow-sm sm:p-6">
        <img src={tailor.profilePhotoUrl || "https://images.unsplash.com/photo-1594736797933-d0401ba2fe65?auto=format&fit=crop&w=900&q=80"} className="mb-5 h-52 w-full rounded-lg object-cover sm:h-64" alt={tailor.name} />
        <div className="flex flex-col justify-between gap-3 sm:flex-row">
          <div>
            <h1 className="break-words text-2xl font-extrabold sm:text-3xl">{tailor.name}</h1>
            <p className="mt-1 font-semibold text-rosewood">{tailor.shopName || "Home tailor"} - {tailor.shopType || "Home-based"}</p>
          </div>
          <span className="h-fit rounded-full bg-pink-50 px-3 py-1 text-sm font-bold capitalize text-rosewood">
            {tailor.availability || "available"}
          </span>
        </div>
        <p className="mt-3 text-neutral-600">{tailor.about || "Experienced sewing professional on Silrahi."}</p>
        <div className="mt-4 flex flex-wrap gap-2">
          {(tailor.skills || []).map((skill) => <span key={skill} className="rounded-full bg-pink-100 px-3 py-1 text-sm font-bold text-rosewood">{skill}</span>)}
        </div>
        <dl className="mt-5 grid gap-3 text-sm">
          <div><dt className="font-bold">Price</dt><dd>{tailor.priceRange || "Price on request"}</dd></div>
          <div><dt className="font-bold">Shop address</dt><dd className="flex gap-2"><MapPin size={16} /> {tailor.address || "Address not added"}</dd></div>
          <div><dt className="font-bold">Experience</dt><dd>{tailor.experienceYears || 0} years</dd></div>
          <div><dt className="font-bold">Rating</dt><dd>{tailor.rating || 0} ({tailor.reviewCount || 0} reviews)</dd></div>
        </dl>
        {(tailor.serviceFees || []).length > 0 && (
          <div className="mt-5 rounded-lg bg-pink-50 p-4">
            <h2 className="mb-3 font-bold">Service fees</h2>
            <div className="grid gap-2">
              {(tailor.serviceFees || []).map((item, index) => (
                <div key={`${item.service}-${index}`} className="flex justify-between border-b border-pink-100 pb-2 text-sm last:border-0 last:pb-0">
                  <span>{item.service}</span>
                  <span className="font-bold text-rosewood">{item.fee}</span>
                </div>
              ))}
            </div>
          </div>
        )}
        {(tailor.workSamples || []).length > 0 && (
          <div className="mt-5">
            <h2 className="mb-3 font-bold">Work samples</h2>
            <div className="grid grid-cols-2 gap-3">
              {(tailor.workSamples || []).slice(0, 6).map((sample) => (
                <img key={sample} src={sample} alt="Tailor work sample" className="aspect-square rounded-lg object-cover" />
              ))}
            </div>
          </div>
        )}
        <div className="mt-5">
          <h2 className="mb-3 font-bold">Reviews</h2>
          <div className="grid gap-3">
            {reviews.length === 0 && <p className="rounded-lg bg-pink-50 p-3 text-sm text-neutral-600">No reviews yet.</p>}
            {reviews.slice(0, 4).map((review) => (
              <article key={review.id} className="rounded-lg border border-pink-100 p-3">
                <p className="flex items-center gap-1 font-bold text-neutral-950"><Star size={16} className="text-saffron" /> {review.rating}/5</p>
                <p className="text-sm text-neutral-600">{review.comment || "Good service"}</p>
              </article>
            ))}
          </div>
        </div>
      </section>
      <section className="rounded-2xl border border-neutral-100 bg-white p-4 shadow-sm sm:p-6">
        <h2 className="mb-1 text-2xl font-bold">Book stitching service</h2>
        <p className="mb-4 text-sm text-neutral-600">Add measurements, completion date, and a reference image. You will visit the tailor's listed address for stitching.</p>
        <form onSubmit={book} className="space-y-4">
          <Field label="Customer name"><input className={inputClass} value={form.customerName} onChange={(e) => update("customerName", e.target.value)} required /></Field>
          <Field label="Service type"><input className={inputClass} value={form.serviceType} onChange={(e) => update("serviceType", e.target.value)} placeholder="Blouse, suit, alteration..." required /></Field>
          <Field label="Requirements"><textarea className={inputClass} value={form.description} onChange={(e) => update("description", e.target.value)} required /></Field>
          <div className="grid gap-3 sm:grid-cols-2">
            {[
              ["bust", "Bust"],
              ["waist", "Waist"],
              ["hip", "Hip"],
              ["shoulder", "Shoulder"],
              ["length", "Length"]
            ].map(([key, label]) => (
              <Field key={key} label={`${label} measurement`}>
                <input className={inputClass} value={form[key]} onChange={(e) => update(key, e.target.value)} placeholder="e.g. 34 inch" />
              </Field>
            ))}
          </div>
          <div className="rounded-xl border border-pink-100 bg-pink-50 p-4 text-sm text-neutral-700">
            <p className="font-bold text-neutral-950">Visit tailor location</p>
            <p className="mt-1 flex gap-2"><MapPin size={16} /> {tailor.address || "Tailor address will be shared by the tailor."}</p>
          </div>
          <Field label="Expected completion date">
            <div className="relative">
              <CalendarDays className="pointer-events-none absolute left-3 top-3 text-neutral-400" size={18} />
              <input type="date" className={`${inputClass} pl-10`} min={new Date().toISOString().split("T")[0]} value={form.deliveryDate} onChange={(e) => update("deliveryDate", e.target.value)} required />
            </div>
          </Field>
          <label className="flex cursor-pointer flex-col items-start justify-between gap-3 rounded-xl border border-dashed border-pink-200 bg-pink-50 p-4 sm:flex-row sm:items-center">
            <span className="inline-flex items-center gap-2 font-semibold text-rosewood"><ImagePlus size={18} /> {referenceImage ? referenceImage.name : "Upload cloth/design reference"}</span>
            <input type="file" accept="image/*" className="hidden" onChange={(event) => setReferenceImage(event.target.files?.[0] || null)} />
          </label>
          {message && <p className="rounded-xl bg-emerald-50 border border-emerald-100 p-3 font-semibold text-emerald-700">{message}</p>}
          <Button disabled={loading} className="w-full">{loading ? "Booking..." : "Book Now"}</Button>
        </form>
      </section>
      </div>
    </main>
  );
}
