import { CheckCircle2, Clock3, ImagePlus, PackageCheck, ShieldCheck, XCircle } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { Button } from "../components/Button";
import { Field, inputClass } from "../components/Field";
import { LocationPicker } from "../components/LocationPicker";
import { useAuth } from "../context/AuthContext";
import { api } from "../services/api";

const allSkills = ["blouse", "kurti", "lehenga", "alteration", "embroidery", "fall pico", "bridal"];
const orderStatuses = ["accepted", "rejected", "in_progress", "ready", "delivered"];

const statusStyles = {
  pending: "bg-amber-50 text-amber-700 border-amber-100",
  accepted: "bg-blue-50 text-blue-700 border-blue-100",
  in_progress: "bg-violet-50 text-violet-700 border-violet-100",
  ready: "bg-teal-50 text-teal-700 border-teal-100",
  delivered: "bg-emerald-50 text-emerald-700 border-emerald-100",
  rejected: "bg-red-50 text-red-700 border-red-100",
  cancelled: "bg-neutral-100 text-neutral-700 border-neutral-200"
};

function emptyProfile(user) {
  return {
    name: user?.name || "",
    shopName: "",
    shopType: "Home-based",
    phone: user?.phone || "",
    address: "",
    location: { lat: 28.6139, lng: 77.209 },
    skills: [],
    serviceFees: [
      { service: "Blouse", fee: "" },
      { service: "Kurti", fee: "" },
      { service: "Alteration", fee: "" }
    ],
    experienceYears: 0,
    priceRange: "",
    availability: "available",
    about: "",
    verified: false,
    profilePhotoUrl: ""
  };
}

function cleanStatus(status = "pending") {
  return status.replace("_", " ");
}

export function TailorDashboard() {
  const { user } = useAuth();
  const [bookings, setBookings] = useState([]);
  const [stats, setStats] = useState(null);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [profile, setProfile] = useState(() => emptyProfile(user));
  const [messageDrafts, setMessageDrafts] = useState({});

  async function load() {
    setLoading(true);
    setError("");
    try {
      const data = await api.tailorDashboard();
      if (data.tailor) setProfile((current) => ({ ...current, ...data.tailor, location: data.tailor.location || current.location }));
      setBookings(data.bookings || []);
      setStats(data.stats || null);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (user) load();
  }, [user]);

  const computedStats = useMemo(
    () =>
      stats || {
        totalOrders: bookings.length,
        pendingOrders: bookings.filter((booking) => booking.status === "pending").length,
        activeOrders: bookings.filter((booking) => ["accepted", "in_progress"].includes(booking.status)).length,
        deliveredOrders: bookings.filter((booking) => booking.status === "delivered").length,
        cancelledOrders: bookings.filter((booking) => booking.status === "cancelled").length
      },
    [bookings, stats]
  );

  const profileScore = useMemo(() => {
    const checks = [
      profile.name,
      profile.shopName,
      profile.phone,
      profile.address,
      profile.about,
      profile.priceRange,
      profile.skills?.length,
      profile.serviceFees?.some((item) => item.service && item.fee),
      profile.location?.lat && profile.location?.lng
    ];
    return Math.round((checks.filter(Boolean).length / checks.length) * 100);
  }, [profile]);

  const earnings = useMemo(() => {
    const delivered = bookings.filter((booking) => booking.status === "delivered");
    return delivered.reduce((sum, booking) => {
      const fee = (profile.serviceFees || []).find((item) =>
        booking.serviceType?.toLowerCase().includes(item.service?.toLowerCase())
      );
      const amount = String(fee?.fee || booking.estimatedAmount || "").match(/\d+/g)?.map(Number)?.[0] || 0;
      return sum + amount;
    }, 0);
  }, [bookings, profile.serviceFees]);

  function update(field, value) {
    setProfile((current) => ({ ...current, [field]: value }));
  }

  function toggleSkill(skill) {
    setProfile((current) => ({
      ...current,
      skills: current.skills?.includes(skill)
        ? current.skills.filter((item) => item !== skill)
        : [...(current.skills || []), skill]
    }));
  }

  function updateFee(index, field, value) {
    setProfile((current) => ({
      ...current,
      serviceFees: (current.serviceFees || []).map((item, itemIndex) =>
        itemIndex === index ? { ...item, [field]: value } : item
      )
    }));
  }

  function addFeeRow() {
    setProfile((current) => ({
      ...current,
      serviceFees: [...(current.serviceFees || []), { service: "", fee: "" }]
    }));
  }

  function removeFeeRow(index) {
    setProfile((current) => ({
      ...current,
      serviceFees: (current.serviceFees || []).filter((_, itemIndex) => itemIndex !== index)
    }));
  }

  async function saveProfile(event) {
    event.preventDefault();
    setSaving(true);
    setMessage("");
    setError("");
    try {
      const payload = {
        ...profile,
        experienceYears: Number(profile.experienceYears || 0),
        location: {
          lat: Number(profile.location?.lat || 28.6139),
          lng: Number(profile.location?.lng || 77.209)
        },
        serviceFees: (profile.serviceFees || []).filter((item) => item.service && item.fee)
      };
      await api.updateTailor(payload);
      setMessage("Profile saved. Admin verification may be required before public listing.");
      await load();
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  }

  async function uploadPhoto(event) {
    const file = event.target.files?.[0];
    if (!file) return;
    setMessage("");
    setError("");
    try {
      const formData = new FormData();
      formData.append("photo", file);
      const data = await api.uploadPhoto(formData);
      setProfile((current) => ({ ...current, profilePhotoUrl: data.profilePhotoUrl }));
      setMessage("Photo uploaded.");
    } catch (err) {
      setError(err.message);
    }
  }

  async function uploadSample(event) {
    const file = event.target.files?.[0];
    if (!file) return;
    setMessage("");
    setError("");
    try {
      const formData = new FormData();
      formData.append("sample", file);
      const data = await api.uploadWorkSample(formData);
      setProfile((current) => ({
        ...current,
        workSamples: [...(current.workSamples || []), data.sampleUrl]
      }));
      setMessage("Work sample uploaded.");
    } catch (err) {
      setError(err.message);
    }
  }

  async function updateStatus(id, status) {
    setMessage("");
    setError("");
    try {
      await api.updateBookingStatus(id, status);
      setMessage(`Order marked ${cleanStatus(status)}.`);
      await load();
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

  return (
    <main className="mx-auto max-w-7xl px-4 py-8">
      <div className="mb-6 flex flex-col justify-between gap-4 rounded-lg border border-pink-100 bg-white p-6 shadow-sm lg:flex-row lg:items-center">
        <div>
          <p className="font-semibold text-rosewood">Tailor Dashboard</p>
          <h1 className="text-3xl font-extrabold text-neutral-950">{profile.shopName || profile.name || "Your tailoring business"}</h1>
          <p className="mt-1 text-neutral-600">Manage profile, pricing, availability, and customer orders.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <span className={`inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-sm font-bold ${profile.verified ? "border-emerald-100 bg-emerald-50 text-emerald-700" : "border-amber-100 bg-amber-50 text-amber-700"}`}>
            <ShieldCheck size={16} />
            {profile.verified ? "Verified" : "Verification pending"}
          </span>
          <span className="inline-flex items-center rounded-full border border-pink-100 bg-pink-50 px-3 py-1.5 text-sm font-bold capitalize text-rosewood">
            {profile.availability || "available"}
          </span>
        </div>
      </div>

      {error && <p className="mb-4 rounded-lg bg-red-50 p-3 font-semibold text-red-700">{error}</p>}
      {message && <p className="mb-4 rounded-lg bg-emerald-50 p-3 font-semibold text-emerald-700">{message}</p>}

      <section className="mb-6 grid gap-4 md:grid-cols-5">
        {[
          ["Total", computedStats.totalOrders, PackageCheck, "bg-pink-50 text-rosewood"],
          ["Pending", computedStats.pendingOrders, Clock3, "bg-amber-50 text-amber-700"],
          ["Active", computedStats.activeOrders, Clock3, "bg-blue-50 text-blue-700"],
          ["Delivered", computedStats.deliveredOrders, CheckCircle2, "bg-emerald-50 text-emerald-700"],
          ["Cancelled", computedStats.cancelledOrders, XCircle, "bg-neutral-100 text-neutral-700"]
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

      <div className="grid gap-6 lg:grid-cols-[1fr_0.95fr]">
        <section className="rounded-lg border border-pink-100 bg-white p-6 shadow-sm">
          <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
            <div>
              <h2 className="text-2xl font-extrabold text-neutral-950">Profile and services</h2>
              <p className="text-sm text-neutral-600">Profile completion: {profileScore}%</p>
              <div className="mt-2 h-2 overflow-hidden rounded-full bg-pink-50">
                <div className="h-full rounded-full bg-rosewood" style={{ width: `${profileScore}%` }} />
              </div>
            </div>
            <label className="inline-flex cursor-pointer items-center justify-center gap-2 rounded-lg border border-pink-200 bg-white px-4 py-2.5 font-semibold text-rosewood transition hover:bg-pink-50">
              <ImagePlus size={18} />
              Profile photo
              <input type="file" accept="image/*" className="hidden" onChange={uploadPhoto} />
            </label>
            <label className="inline-flex cursor-pointer items-center justify-center gap-2 rounded-lg border border-pink-200 bg-white px-4 py-2.5 font-semibold text-rosewood transition hover:bg-pink-50">
              <ImagePlus size={18} />
              Work sample
              <input type="file" accept="image/*" className="hidden" onChange={uploadSample} />
            </label>
          </div>

          {profile.profilePhotoUrl && (
            <img src={profile.profilePhotoUrl} alt={profile.name} className="mt-5 h-48 w-full rounded-lg object-cover" />
          )}

          {(profile.workSamples || []).length > 0 && (
            <div className="mt-5 grid grid-cols-3 gap-3">
              {(profile.workSamples || []).slice(0, 6).map((sample) => (
                <img key={sample} src={sample} alt="Work sample" className="aspect-square rounded-lg object-cover" />
              ))}
            </div>
          )}

          <form onSubmit={saveProfile} className="mt-5 grid gap-4">
            <Field label="Name">
              <input className={inputClass} value={profile.name || ""} onChange={(e) => update("name", e.target.value)} required />
            </Field>
            <div className="grid gap-3 sm:grid-cols-2">
              <Field label="Shop / Business name">
                <input className={inputClass} value={profile.shopName || ""} onChange={(e) => update("shopName", e.target.value)} placeholder="Sunita Boutique" />
              </Field>
              <Field label="Shop type">
                <select className={inputClass} value={profile.shopType || "Home-based"} onChange={(e) => update("shopType", e.target.value)}>
                  <option value="Home-based">Home-based</option>
                  <option value="Shop">Shop</option>
                  <option value="Online">Online</option>
                </select>
              </Field>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <Field label="Phone">
                <input className={inputClass} value={profile.phone || ""} onChange={(e) => update("phone", e.target.value)} required />
              </Field>
              <Field label="Availability">
                <select className={inputClass} value={profile.availability || "available"} onChange={(e) => update("availability", e.target.value)}>
                  <option value="available">Available</option>
                  <option value="busy">Busy</option>
                  <option value="offline">Offline</option>
                </select>
              </Field>
            </div>
            <Field label="Address">
              <textarea className={inputClass} value={profile.address || ""} onChange={(e) => update("address", e.target.value)} />
            </Field>
            <LocationPicker value={profile.location} onChange={(location) => update("location", location)} />
            <Field label="Skills">
              <div className="flex flex-wrap gap-2">
                {allSkills.map((skill) => (
                  <button type="button" key={skill} onClick={() => toggleSkill(skill)} className={`rounded-full px-3 py-1 text-sm font-bold ${profile.skills?.includes(skill) ? "bg-rosewood text-white" : "bg-pink-50 text-neutral-700"}`}>
                    {skill}
                  </button>
                ))}
              </div>
            </Field>
            <div className="grid gap-3 sm:grid-cols-2">
              <Field label="Experience years">
                <input type="number" min="0" className={inputClass} value={profile.experienceYears || 0} onChange={(e) => update("experienceYears", e.target.value)} />
              </Field>
              <Field label="Price range">
                <input className={inputClass} value={profile.priceRange || ""} onChange={(e) => update("priceRange", e.target.value)} placeholder="Rs 300 - Rs 2500" />
              </Field>
            </div>
            <div>
              <div className="mb-2 flex items-center justify-between gap-3">
                <p className="text-sm font-semibold text-neutral-700">Service fees</p>
                <Button type="button" variant="secondary" onClick={addFeeRow}>Add fee</Button>
              </div>
              <div className="space-y-2">
                {(profile.serviceFees || []).map((item, index) => (
                  <div key={index} className="grid gap-2 sm:grid-cols-[1fr_1fr_auto]">
                    <input className={inputClass} placeholder="Service e.g. Blouse" value={item.service || ""} onChange={(e) => updateFee(index, "service", e.target.value)} />
                    <input className={inputClass} placeholder="Fee e.g. Rs 500" value={item.fee || ""} onChange={(e) => updateFee(index, "fee", e.target.value)} />
                    <Button type="button" variant="secondary" onClick={() => removeFeeRow(index)}>Remove</Button>
                  </div>
                ))}
              </div>
            </div>
            <Field label="About">
              <textarea className={inputClass} value={profile.about || ""} onChange={(e) => update("about", e.target.value)} />
            </Field>
            <Button disabled={saving}>{saving ? "Saving..." : "Save Profile"}</Button>
          </form>
        </section>

        <section className="rounded-lg border border-pink-100 bg-white p-6 shadow-sm">
          <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
            <div>
              <h2 className="text-2xl font-extrabold text-neutral-950">Orders</h2>
              <p className="text-sm text-neutral-600">Accept, reject, progress, or complete customer requests.</p>
            </div>
            <Button variant="secondary" onClick={load} disabled={loading}>{loading ? "Loading..." : "Refresh"}</Button>
          </div>
          <div className="mt-4 rounded-lg bg-pink-50 p-4">
            <p className="text-sm font-semibold text-neutral-600">Earnings summary</p>
            <p className="text-3xl font-extrabold text-neutral-950">Rs {earnings}</p>
            <p className="text-xs text-neutral-500">Estimated from delivered orders and your service fee list.</p>
          </div>
          <div className="mt-4 space-y-3">
            {loading && <p className="rounded-lg bg-pink-50 p-4 font-semibold text-rosewood">Loading orders...</p>}
            {!loading && bookings.length === 0 && (
              <div className="rounded-lg border border-dashed border-pink-200 p-6 text-center">
                <p className="font-bold text-neutral-950">No orders yet.</p>
                <p className="mt-1 text-sm text-neutral-600">Complete your profile and wait for customer bookings.</p>
              </div>
            )}
            {bookings.map((booking) => (
              <article key={booking.id} className="rounded-lg border border-pink-100 p-4">
                <div className="flex flex-col justify-between gap-3 sm:flex-row">
                  <div>
                    <h3 className="font-bold text-neutral-950">{booking.serviceType}</h3>
                    <p className="text-sm text-neutral-600">{booking.customerName} - {booking.deliveryDate || booking.preferredDate}</p>
                  </div>
                  <span className={`h-fit rounded-full border px-3 py-1 text-sm font-bold capitalize ${statusStyles[booking.status] || statusStyles.pending}`}>
                    {cleanStatus(booking.status)}
                  </span>
                </div>
                <p className="my-3 text-sm">{booking.description}</p>
                {booking.referenceImageUrl && <img src={booking.referenceImageUrl} alt="Customer reference" className="mb-3 h-32 w-full rounded-lg object-cover" />}
                {booking.measurements && (
                  <div className="mb-3 grid grid-cols-2 gap-2 rounded-lg bg-pink-50 p-3 text-xs">
                    {Object.entries(booking.measurements).filter(([, value]) => value).map(([key, value]) => (
                      <p key={key}><span className="font-bold capitalize">{key}:</span> {value}</p>
                    ))}
                  </div>
                )}
                <p className="mb-3 text-xs font-semibold text-neutral-500">{booking.pickupDeliveryAddress}</p>
                {!["cancelled", "rejected"].includes(booking.status) && (
                  <div className="mb-3 grid gap-2 sm:grid-cols-[1fr_auto]">
                    <input className={inputClass} placeholder="Message customer" value={messageDrafts[booking.id] || ""} onChange={(e) => updateMessageDraft(booking.id, e.target.value)} />
                    <Button type="button" variant="secondary" onClick={() => sendBookingMessage(booking)}>Send</Button>
                  </div>
                )}
                <div className="flex flex-wrap gap-2">
                  {orderStatuses.map((status) => (
                    <Button
                      key={status}
                      type="button"
                      variant={status === "delivered" ? "soft" : "secondary"}
                      disabled={["cancelled", "delivered", "rejected"].includes(booking.status)}
                      onClick={() => updateStatus(booking.id, status)}
                    >
                      {cleanStatus(status)}
                    </Button>
                  ))}
                </div>
              </article>
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}
