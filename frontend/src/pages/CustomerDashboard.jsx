import { CalendarCheck, CheckCircle2, Clock3, MapPin, Search, XCircle } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { Button } from "../components/Button";
import { Field, inputClass } from "../components/Field";
import { LocationPicker } from "../components/LocationPicker";
import { useAuth } from "../context/AuthContext";
import { api } from "../services/api";

const statusStyles = {
  pending: "bg-amber-50 text-amber-700 border-amber-100",
  accepted: "bg-blue-50 text-blue-700 border-blue-100",
  in_progress: "bg-violet-50 text-violet-700 border-violet-100",
  ready: "bg-teal-50 text-teal-700 border-teal-100",
  delivered: "bg-emerald-50 text-emerald-700 border-emerald-100",
  rejected: "bg-red-50 text-red-700 border-red-100",
  cancelled: "bg-neutral-100 text-neutral-700 border-neutral-200"
};

function statusLabel(status = "pending") {
  return status.replace("_", " ");
}

export function CustomerDashboard({ setPage }) {
  const { user } = useAuth();
  const [bookings, setBookings] = useState([]);
  const [profile, setProfile] = useState({
    name: user?.name || "",
    phone: user?.phone || "",
    address: "",
    location: { lat: 28.6139, lng: 77.209 }
  });
  const [recommendedTailors, setRecommendedTailors] = useState([]);
  const [savedTailors, setSavedTailors] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [reviews, setReviews] = useState({});
  const [message, setMessage] = useState("");
  const [messageDrafts, setMessageDrafts] = useState({});
  const [error, setError] = useState("");

  async function load() {
    setLoading(true);
    setError("");
    try {
      const data = await api.customerDashboard();
      const customer = data.customer || {};
      setBookings(data.bookings || []);
      setRecommendedTailors(data.recommendedTailors || []);
      setStats(data.stats || null);
      setProfile((current) => ({
        ...current,
        ...customer,
        location: customer.location || current.location
      }));
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (user) {
      setSavedTailors(JSON.parse(localStorage.getItem("silrahi_saved_tailors") || "[]"));
      load();
    }
  }, [user]);

  const computedStats = useMemo(
    () =>
      stats || {
        totalBookings: bookings.length,
        activeBookings: bookings.filter((booking) => ["pending", "accepted", "in_progress", "ready"].includes(booking.status)).length,
        deliveredBookings: bookings.filter((booking) => booking.status === "delivered").length,
        cancelledBookings: bookings.filter((booking) => booking.status === "cancelled").length
      },
    [bookings, stats]
  );

  const activeBookings = bookings.filter((booking) => ["pending", "accepted", "in_progress", "ready"].includes(booking.status));

  function update(field, value) {
    setProfile((current) => ({ ...current, [field]: value }));
  }

  async function saveProfile(event) {
    event.preventDefault();
    setSaving(true);
    setMessage("");
    setError("");
    try {
      await api.updateCustomer({
        name: profile.name,
        phone: profile.phone,
        address: profile.address || "",
        location: {
          lat: Number(profile.location?.lat || 28.6139),
          lng: Number(profile.location?.lng || 77.209)
        }
      });
      setMessage("Profile saved.");
      await load();
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  }

  async function cancelBooking(id) {
    setMessage("");
    setError("");
    try {
      await api.updateBookingStatus(id, "cancelled");
      setMessage("Booking cancelled.");
      await load();
    } catch (err) {
      setError(err.message);
    }
  }

  function updateReview(bookingId, field, value) {
    setReviews((current) => ({
      ...current,
      [bookingId]: {
        rating: 5,
        comment: "",
        ...(current[bookingId] || {}),
        [field]: value
      }
    }));
  }

  async function submitReview(booking) {
    setMessage("");
    setError("");
    try {
      const review = reviews[booking.id] || { rating: 5, comment: "" };
      await api.createReview({
        bookingId: booking.id,
        tailorId: booking.tailorId,
        rating: Number(review.rating || 5),
        comment: review.comment || ""
      });
      setMessage("Review submitted.");
    } catch (err) {
      setError(err.message);
    }
  }

  function updateMessageDraft(bookingId, value) {
    setMessageDrafts((current) => ({ ...current, [bookingId]: value }));
  }

  async function sendBookingMessage(booking) {
    const text = messageDrafts[booking.id]?.trim();
    if (!text) return;
    setMessage("");
    setError("");
    try {
      await api.sendMessage(booking.id, text);
      setMessage("Message sent.");
      updateMessageDraft(booking.id, "");
    } catch (err) {
      setError(err.message);
    }
  }

  if (!user) {
    return <main className="p-8">Please login first.</main>;
  }

  return (
    <main className="mx-auto max-w-7xl px-4 py-8">
      <div className="mb-6 flex flex-col justify-between gap-4 rounded-lg border border-pink-100 bg-white p-6 shadow-sm md:flex-row md:items-center">
        <div>
          <p className="font-semibold text-rosewood">Customer Dashboard</p>
          <h1 className="text-3xl font-extrabold text-neutral-950">Welcome, {user.name}</h1>
          <p className="mt-1 text-neutral-600">Manage bookings, profile details, and nearby stitching services.</p>
        </div>
        <Button onClick={() => setPage("map")}>
          <Search size={18} />
          Search Tailors
        </Button>
      </div>

      {error && <p className="mb-4 rounded-lg bg-red-50 p-3 font-semibold text-red-700">{error}</p>}
      {message && <p className="mb-4 rounded-lg bg-emerald-50 p-3 font-semibold text-emerald-700">{message}</p>}

      <section className="mb-6 grid gap-4 md:grid-cols-4">
        {[
          ["Total bookings", computedStats.totalBookings, CalendarCheck, "bg-pink-50 text-rosewood"],
          ["Active", computedStats.activeBookings, Clock3, "bg-blue-50 text-blue-700"],
          ["Delivered", computedStats.deliveredBookings, CheckCircle2, "bg-emerald-50 text-emerald-700"],
          ["Cancelled", computedStats.cancelledBookings, XCircle, "bg-neutral-100 text-neutral-700"]
        ].map(([label, value, Icon, color]) => (
          <article key={label} className="rounded-lg border border-pink-100 bg-white p-4 shadow-sm">
            <div className={`mb-3 grid h-10 w-10 place-items-center rounded-lg ${color}`}>
              <Icon size={18} />
            </div>
            <p className="text-sm font-semibold text-neutral-500">{label}</p>
            <p className="text-3xl font-extrabold text-neutral-950">{loading ? "--" : value}</p>
          </article>
        ))}
      </section>

      <div className="grid gap-6 lg:grid-cols-[0.9fr_1.4fr]">
        <section className="rounded-lg border border-pink-100 bg-white p-6 shadow-sm">
          <h2 className="text-xl font-extrabold text-neutral-950">Profile</h2>
          <form onSubmit={saveProfile} className="mt-4 grid gap-4">
            <Field label="Name">
              <input className={inputClass} value={profile.name || ""} onChange={(e) => update("name", e.target.value)} required />
            </Field>
            <Field label="Phone">
              <input className={inputClass} value={profile.phone || ""} onChange={(e) => update("phone", e.target.value)} required />
            </Field>
            <Field label="Default pickup address">
              <textarea className={inputClass} value={profile.address || ""} onChange={(e) => update("address", e.target.value)} />
            </Field>
            <LocationPicker value={profile.location} onChange={(location) => update("location", location)} actionLabel="Use pickup location" />
            <Button disabled={saving}>{saving ? "Saving..." : "Save Profile"}</Button>
          </form>

          <div className="mt-6 rounded-lg bg-pink-50 p-4">
            <h3 className="font-bold text-neutral-950">Recommended tailors</h3>
            <div className="mt-3 grid gap-3">
              {recommendedTailors.length === 0 && <p className="text-sm text-neutral-600">No recommendations yet.</p>}
              {recommendedTailors.map((tailor) => (
                <article key={tailor.id} className="rounded-lg bg-white p-3">
                  <p className="font-bold">{tailor.name}</p>
                  <p className="text-sm text-neutral-600">{tailor.shopName || "Home tailor"} - {tailor.priceRange || "Price on request"}</p>
                  <p className="text-sm font-semibold text-rosewood">{(tailor.skills || []).slice(0, 3).join(", ") || "General stitching"}</p>
                  {tailor.distanceKm !== null && tailor.distanceKm !== undefined && (
                    <p className="mt-1 inline-flex items-center gap-1 text-xs font-bold text-neutral-500">
                      <MapPin size={13} />
                      {tailor.distanceKm} km away
                    </p>
                  )}
                </article>
              ))}
            </div>
          </div>

          <div className="mt-4 rounded-lg bg-white p-4 ring-1 ring-pink-100">
            <h3 className="font-bold text-neutral-950">Saved tailors</h3>
            <div className="mt-3 grid gap-3">
              {savedTailors.length === 0 && <p className="text-sm text-neutral-600">Saved tailors will appear here.</p>}
              {savedTailors.map((tailor) => (
                <article key={tailor.id} className="rounded-lg bg-pink-50 p-3">
                  <p className="font-bold">{tailor.name}</p>
                  <p className="text-sm text-neutral-600">{tailor.shopName || "Home tailor"} - {tailor.priceRange || "Price on request"}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="rounded-lg border border-pink-100 bg-white p-6 shadow-sm">
          <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
            <div>
              <h2 className="text-xl font-extrabold text-neutral-950">Your bookings</h2>
              <p className="text-sm text-neutral-600">{activeBookings.length} active order(s)</p>
            </div>
            <Button variant="secondary" onClick={load} disabled={loading}>{loading ? "Loading..." : "Refresh"}</Button>
          </div>
          <div className="mt-4 grid gap-3">
            {!loading && bookings.length === 0 && (
              <div className="rounded-lg border border-dashed border-pink-200 p-6 text-center">
                <p className="font-bold text-neutral-950">No bookings yet.</p>
                <p className="mt-1 text-sm text-neutral-600">Find a tailor and create your first stitching request.</p>
                <Button onClick={() => setPage("map")} className="mt-4">Find Tailors</Button>
              </div>
            )}
            {loading && <p className="rounded-lg bg-pink-50 p-4 font-semibold text-rosewood">Loading dashboard...</p>}
            {bookings.map((booking) => (
              <article key={booking.id} className="rounded-lg border border-pink-100 p-4">
                <div className="flex flex-col justify-between gap-3 md:flex-row">
                  <div>
                    <h3 className="font-bold text-neutral-950">{booking.serviceType}</h3>
                    <p className="text-sm text-neutral-600">{booking.tailorName || "Tailor"} - {booking.deliveryDate || booking.preferredDate}</p>
                    <p className="mt-2 text-sm">{booking.description}</p>
                    <p className="mt-1 text-xs font-semibold text-neutral-500">{booking.pickupDeliveryAddress}</p>
                  </div>
                  <div className="flex flex-col items-start gap-2 md:items-end">
                    <span className={`rounded-full border px-3 py-1 text-sm font-bold capitalize ${statusStyles[booking.status] || statusStyles.pending}`}>
                      {statusLabel(booking.status)}
                    </span>
                    {booking.status === "pending" && (
                      <Button type="button" variant="secondary" onClick={() => cancelBooking(booking.id)}>
                        Cancel
                      </Button>
                    )}
                  </div>
                </div>
                {booking.referenceImageUrl && <img src={booking.referenceImageUrl} alt="Reference" className="mt-3 h-28 w-full rounded-lg object-cover" />}
                {!["cancelled", "rejected"].includes(booking.status) && (
                  <div className="mt-4 grid gap-2 rounded-lg bg-white sm:grid-cols-[1fr_auto]">
                    <input className={inputClass} placeholder="Message tailor" value={messageDrafts[booking.id] || ""} onChange={(e) => updateMessageDraft(booking.id, e.target.value)} />
                    <Button type="button" variant="secondary" onClick={() => sendBookingMessage(booking)}>Send</Button>
                  </div>
                )}
                {booking.status === "delivered" && (
                  <div className="mt-4 grid gap-2 rounded-lg bg-pink-50 p-3 sm:grid-cols-[120px_1fr_auto]">
                    <select className={inputClass} value={reviews[booking.id]?.rating || 5} onChange={(e) => updateReview(booking.id, "rating", e.target.value)}>
                      {[5, 4, 3, 2, 1].map((rating) => <option key={rating} value={rating}>{rating} stars</option>)}
                    </select>
                    <input className={inputClass} placeholder="Write review" value={reviews[booking.id]?.comment || ""} onChange={(e) => updateReview(booking.id, "comment", e.target.value)} />
                    <Button type="button" onClick={() => submitReview(booking)}>Review</Button>
                  </div>
                )}
              </article>
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}
