import {
  Scissors, ShieldCheck, Clock3, CheckCircle2, XCircle,
  PackageCheck, TrendingUp, ImagePlus, Star, IndianRupee,
  RefreshCw, Send, ChevronDown, ChevronUp, MapPin
} from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { Button } from "../components/Button";
import { Field, inputClass } from "../components/Field";
import { LocationPicker } from "../components/LocationPicker";
import { useAuth } from "../context/AuthContext";
import { api } from "../services/api";

const ALL_SKILLS = ["blouse","kurti","lehenga","alteration","embroidery","fall pico","bridal","salwar suit","saree blouse"];

const STATUS_STYLE = {
  pending:    "bg-amber-50 text-amber-700 border-amber-200",
  accepted:   "bg-blue-50 text-blue-700 border-blue-200",
  in_progress:"bg-violet-50 text-violet-700 border-violet-200",
  ready:      "bg-teal-50 text-teal-700 border-teal-200",
  delivered:  "bg-emerald-50 text-emerald-700 border-emerald-200",
  rejected:   "bg-red-50 text-red-700 border-red-200",
  cancelled:  "bg-neutral-100 text-neutral-600 border-neutral-200",
};

function statusLabel(s = "pending") { return s.replace("_", " "); }

function emptyProfile(user) {
  return {
    name: user?.name || "",
    shopName: "",
    shopType: "Home-based",
    phone: user?.phone || "",
    address: "",
    location: { lat: 28.6139, lng: 77.209 },
    skills: [],
    serviceFees: [{ service: "Blouse", fee: "" }, { service: "Kurti", fee: "" }],
    experienceYears: 0,
    priceRange: "",
    paymentUpiId: "",
    paymentPhone: "",
    availability: "available",
    about: "",
    verified: false,
    profilePhotoUrl: "",
    workSamples: [],
  };
}

function cleanOptionalString(value, minLength = 1) {
  const text = String(value || "").trim();
  return text.length >= minLength ? text : undefined;
}

function validUrl(value) {
  try {
    return Boolean(new URL(value));
  } catch {
    return false;
  }
}

function buildTailorPayload(profile) {
  const payload = {
    name: cleanOptionalString(profile.name, 2),
    shopName: cleanOptionalString(profile.shopName, 2),
    shopType: profile.shopType || "Home-based",
    phone: cleanOptionalString(profile.phone, 10),
    address: cleanOptionalString(profile.address, 3),
    skills: Array.isArray(profile.skills) ? profile.skills.filter(Boolean) : [],
    serviceFees: (profile.serviceFees || [])
      .map((fee) => ({
        service: cleanOptionalString(fee.service, 2),
        fee: cleanOptionalString(fee.fee, 1)
      }))
      .filter((fee) => fee.service && fee.fee),
    experienceYears: Number(profile.experienceYears || 0),
    priceRange: String(profile.priceRange || "").trim(),
    paymentUpiId: String(profile.paymentUpiId || "").trim(),
    paymentPhone: String(profile.paymentPhone || "").trim(),
    availability: profile.availability || "available",
    about: String(profile.about || "").trim(),
    workSamples: (profile.workSamples || []).filter(validUrl)
  };

  if (profile.location?.lat && profile.location?.lng) {
    payload.location = {
      lat: Number(profile.location.lat),
      lng: Number(profile.location.lng)
    };
  }

  return Object.fromEntries(Object.entries(payload).filter(([, value]) => value !== undefined));
}

/* ── Stat Card ── */
function StatCard({ label, value, icon: Icon, color, loading }) {
  return (
    <article className={`rounded-2xl border p-5 shadow-sm bg-white flex items-center gap-4`}>
      <div className={`h-12 w-12 flex-shrink-0 rounded-xl flex items-center justify-center ${color}`}>
        <Icon size={22} />
      </div>
      <div>
        <p className="text-sm font-semibold text-neutral-500">{label}</p>
        <p className="text-3xl font-extrabold text-neutral-900">{loading ? "—" : value}</p>
      </div>
    </article>
  );
}

/* ── Order Card ── */
function OrderCard({ booking, onStatus, onMessage }) {
  const [open, setOpen] = useState(false);
  const [msg, setMsg] = useState("");
  const nextStatuses = ["accepted","rejected","in_progress","ready","delivered"];
  const locked = ["cancelled","rejected","delivered"].includes(booking.status);

  return (
    <article className="rounded-2xl border border-pink-100 bg-white shadow-sm overflow-hidden">
      <div
        className="flex items-start justify-between gap-3 p-4 cursor-pointer hover:bg-pink-50/40 transition-colors"
        onClick={() => setOpen(o => !o)}
      >
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-bold text-neutral-900 truncate">{booking.serviceType}</span>
            <span className={`rounded-full border px-2.5 py-0.5 text-xs font-bold capitalize ${STATUS_STYLE[booking.status] || STATUS_STYLE.pending}`}>
              {statusLabel(booking.status)}
            </span>
          </div>
          <p className="mt-0.5 text-sm text-neutral-500">{booking.customerName} · {booking.deliveryDate || booking.preferredDate}</p>
          {["ready", "delivered"].includes(booking.status) && (
            <p className={`mt-2 inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-bold ${
              booking.paymentStatus === "paid" ? "bg-emerald-50 text-emerald-700" : "bg-amber-50 text-amber-700"
            }`}>
              <IndianRupee size={12} />
              {booking.paymentAmount ? `₹${booking.paymentAmount}` : "Amount pending"} · {booking.paymentStatus === "paid" ? "Paid" : "Payment due"}
            </p>
          )}
        </div>
        {open ? <ChevronUp size={18} className="text-neutral-400 flex-shrink-0 mt-1" /> : <ChevronDown size={18} className="text-neutral-400 flex-shrink-0 mt-1" />}
      </div>

      {open && (
        <div className="border-t border-pink-50 p-4 space-y-3">
          {booking.description && <p className="text-sm text-neutral-700">{booking.description}</p>}
          <p className="text-xs text-neutral-500 flex items-center gap-1">
            <MapPin size={12}/>Customer will visit your listed tailor location.
          </p>
          {booking.paymentStatus === "paid" && (
            <p className="text-xs font-semibold text-emerald-700">
              Payment received{booking.paymentReference ? ` · Ref: ${booking.paymentReference}` : ""}
            </p>
          )}
          {booking.referenceImageUrl && (
            <img src={booking.referenceImageUrl} alt="Reference" className="h-36 w-full object-cover rounded-xl" />
          )}
          {booking.measurements && Object.keys(booking.measurements).length > 0 && (
            <div className="grid grid-cols-3 gap-2 rounded-xl bg-pink-50 p-3 text-xs">
              {Object.entries(booking.measurements).filter(([,v])=>v).map(([k,v])=>(
                <p key={k}><span className="font-bold capitalize">{k}:</span> {v}</p>
              ))}
            </div>
          )}
          {!locked && (
            <div className="flex gap-2">
              <input className={`${inputClass} flex-1 text-sm`} placeholder="Message to customer..." value={msg} onChange={e=>setMsg(e.target.value)} />
              <Button variant="secondary" onClick={()=>{ onMessage(booking.id, msg); setMsg(""); }}><Send size={14}/></Button>
            </div>
          )}
          {!locked && (
            <div className="flex flex-wrap gap-2">
              {nextStatuses.map(s => (
                <button key={s} onClick={()=>onStatus(booking.id, s)}
                  className={`rounded-lg px-3 py-1.5 text-xs font-bold border transition-all hover:scale-105
                    ${booking.status === s ? "bg-rosewood text-white border-rosewood" : "bg-white text-neutral-700 border-neutral-200 hover:border-rosewood hover:text-rosewood"}`}>
                  {statusLabel(s)}
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </article>
  );
}

/* ══════════════════════════════════════════════════
   MAIN TAILOR DASHBOARD
══════════════════════════════════════════════════ */
export function TailorDashboard() {
  const { user } = useAuth();
  const [tab, setTab] = useState("orders");     // orders | profile
  const [profile, setProfile] = useState(() => emptyProfile(user));
  const [bookings, setBookings] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState({ msg: "", type: "" });

  function notify(msg, type = "success") {
    setToast({ msg, type });
    setTimeout(() => setToast({ msg: "", type: "" }), 3500);
  }

  async function load() {
    setLoading(true);
    try {
      const data = await api.tailorDashboard();
      if (data.tailor) setProfile(p => ({ ...p, ...data.tailor, location: data.tailor.location || p.location }));
      setBookings(data.bookings || []);
      setStats(data.stats || null);
    } catch (e) { notify(e.message, "error"); }
    finally { setLoading(false); }
  }

  useEffect(() => { if (user) load(); }, [user]);

  const computedStats = useMemo(() => stats || {
    totalOrders:     bookings.length,
    pendingOrders:   bookings.filter(b => b.status === "pending").length,
    activeOrders:    bookings.filter(b => ["accepted","in_progress","ready"].includes(b.status)).length,
    deliveredOrders: bookings.filter(b => b.status === "delivered").length,
    cancelledOrders: bookings.filter(b => b.status === "cancelled").length,
  }, [bookings, stats]);

  const earnings = useMemo(() => {
    return bookings.filter(b => b.status === "delivered").reduce((sum, b) => {
      const fee = (profile.serviceFees || []).find(f =>
        b.serviceType?.toLowerCase().includes(f.service?.toLowerCase()));
      const amt = String(fee?.fee || "").match(/\d+/)?.[0] || 0;
      return sum + Number(amt);
    }, 0);
  }, [bookings, profile.serviceFees]);

  const profileScore = useMemo(() => {
    const checks = [profile.name, profile.shopName, profile.phone, profile.address,
      profile.about, profile.priceRange, profile.skills?.length,
      profile.serviceFees?.some(f=>f.service&&f.fee), profile.paymentUpiId || profile.paymentPhone, profile.location?.lat];
    return Math.round(checks.filter(Boolean).length / checks.length * 100);
  }, [profile]);

  function upd(field, val) { setProfile(p => ({ ...p, [field]: val })); }
  function toggleSkill(s) {
    setProfile(p => ({ ...p, skills: p.skills?.includes(s) ? p.skills.filter(x=>x!==s) : [...(p.skills||[]),s] }));
  }
  function updFee(i, k, v) {
    setProfile(p => ({ ...p, serviceFees: p.serviceFees.map((f,fi) => fi===i ? {...f,[k]:v} : f) }));
  }

  async function saveProfile(e) {
    e.preventDefault(); setSaving(true);
    try {
      await api.updateTailor(buildTailorPayload(profile));
      notify("Profile saved successfully!");
      await load();
    } catch(e) { notify(e.message,"error"); }
    finally { setSaving(false); }
  }

  async function uploadPhoto(e) {
    const file = e.target.files?.[0]; if(!file) return;
    try {
      const fd = new FormData(); fd.append("photo", file);
      const d = await api.uploadPhoto(fd);
      upd("profilePhotoUrl", d.profilePhotoUrl);
      notify("Photo uploaded!");
    } catch(e) { notify(e.message,"error"); }
  }

  async function uploadSample(e) {
    const file = e.target.files?.[0]; if(!file) return;
    try {
      const fd = new FormData(); fd.append("sample", file);
      const d = await api.uploadWorkSample(fd);
      setProfile(p => ({ ...p, workSamples: [...(p.workSamples||[]), d.sampleUrl] }));
      notify("Work sample uploaded!");
    } catch(e) { notify(e.message,"error"); }
  }

  async function onStatus(id, status) {
    try {
      const extra = {};
      if (status === "ready") {
        const amount = window.prompt("Kitne rupaye ka work hua hai? Customer ko ye amount payment ke liye dikhega.");
        if (amount === null) return;
        const cleanAmount = Number(String(amount).replace(/[^\d.]/g, ""));
        if (!Number.isFinite(cleanAmount) || cleanAmount <= 0) {
          notify("Please enter a valid amount.", "error");
          return;
        }
        extra.paymentAmount = cleanAmount;
      }
      await api.updateBookingStatus(id, status, extra);
      notify(status === "ready" ? "Customer notified for payment." : `Marked: ${statusLabel(status)}`);
      await load();
    }
    catch(e) { notify(e.message,"error"); }
  }

  async function onMessage(bookingId, text) {
    if(!text?.trim()) return;
    try { await api.sendMessage(bookingId, text); notify("Message sent!"); }
    catch(e) { notify(e.message,"error"); }
  }

  return (
    <main className="mx-auto max-w-7xl px-4 py-8">

      {/* ── Toast ── */}
      {toast.msg && (
        <div className={`fixed top-5 right-5 z-50 rounded-xl px-5 py-3 text-sm font-semibold shadow-lg transition-all
          ${toast.type==="error" ? "bg-red-600 text-white" : "bg-emerald-600 text-white"}`}>
          {toast.msg}
        </div>
      )}

      {/* ── Header ── */}
      <div className="mb-6 rounded-2xl border border-pink-100 bg-white p-6 shadow-sm">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-4">
            {profile.profilePhotoUrl
              ? <img src={profile.profilePhotoUrl} alt={profile.name} className="h-16 w-16 rounded-2xl object-cover ring-2 ring-pink-200" />
              : <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-rosewood to-amethyst flex items-center justify-center text-white text-2xl font-extrabold">
                  {profile.name?.[0] || "T"}
                </div>
            }
            <div>
              <p className="text-sm font-semibold text-rosewood flex items-center gap-1">
                <Scissors size={14}/> Tailor Dashboard
              </p>
              <h1 className="text-2xl font-extrabold text-neutral-900">{profile.shopName || profile.name || "My Tailoring Business"}</h1>
              <div className="mt-1 flex flex-wrap items-center gap-2">
                <span className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-bold
                  ${profile.verified ? "bg-emerald-50 text-emerald-700 border-emerald-200" : "bg-amber-50 text-amber-700 border-amber-200"}`}>
                  <ShieldCheck size={12}/>
                  {profile.verified ? "Verified" : "Verification Pending"}
                </span>
                <span className={`rounded-full border px-2.5 py-1 text-xs font-bold capitalize
                  ${profile.availability==="available" ? "bg-green-50 text-green-700 border-green-200" : "bg-neutral-100 text-neutral-600 border-neutral-200"}`}>
                  {profile.availability || "available"}
                </span>
                {profile.rating > 0 && (
                  <span className="inline-flex items-center gap-1 rounded-full border border-amber-200 bg-amber-50 px-2.5 py-1 text-xs font-bold text-amber-700">
                    <Star size={11} className="fill-amber-400 text-amber-400"/> {profile.rating} ({profile.reviewCount} reviews)
                  </span>
                )}
              </div>
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            <button onClick={load} disabled={loading}
              className="flex items-center gap-1.5 rounded-xl border border-pink-200 px-4 py-2 text-sm font-semibold text-rosewood hover:bg-pink-50 transition-colors">
              <RefreshCw size={14} className={loading?"animate-spin":""}/> Refresh
            </button>
            <div className="flex rounded-xl border border-pink-200 overflow-hidden text-sm font-semibold">
              {[["orders","Orders"],["profile","Profile"]].map(([key,label])=>(
                <button key={key} onClick={()=>setTab(key)}
                  className={`px-4 py-2 transition-colors ${tab===key ? "bg-rosewood text-white" : "text-neutral-600 hover:bg-pink-50"}`}>
                  {label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ── Stats ── */}
      <div className="mb-6 grid gap-4 grid-cols-2 md:grid-cols-5">
        <StatCard label="Total Orders"   value={computedStats.totalOrders}     icon={PackageCheck} color="bg-pink-50 text-rosewood"     loading={loading}/>
        <StatCard label="Pending"        value={computedStats.pendingOrders}   icon={Clock3}       color="bg-amber-50 text-amber-700"   loading={loading}/>
        <StatCard label="Active"         value={computedStats.activeOrders}    icon={TrendingUp}   color="bg-blue-50 text-blue-700"     loading={loading}/>
        <StatCard label="Delivered"      value={computedStats.deliveredOrders} icon={CheckCircle2} color="bg-emerald-50 text-emerald-700" loading={loading}/>
        <StatCard label="Earnings (est)" value={`₹${earnings}`}               icon={IndianRupee}  color="bg-violet-50 text-violet-700" loading={loading}/>
      </div>

      {/* ══ ORDERS TAB ══ */}
      {tab === "orders" && (
        <div className="rounded-2xl border border-pink-100 bg-white p-6 shadow-sm">
          <h2 className="text-xl font-extrabold text-neutral-900 mb-1">Customer Orders</h2>
          <p className="text-sm text-neutral-500 mb-5">Accept, update status, and message customers from here.</p>
          {loading && <p className="rounded-xl bg-pink-50 p-4 text-sm font-semibold text-rosewood">Loading orders...</p>}
          {!loading && bookings.length === 0 && (
            <div className="rounded-2xl border-2 border-dashed border-pink-200 p-10 text-center">
              <Scissors size={36} className="mx-auto text-pink-200 mb-3"/>
              <p className="font-bold text-neutral-900">No orders yet</p>
              <p className="mt-1 text-sm text-neutral-500">Complete your profile so customers can find and book you.</p>
              <button onClick={()=>setTab("profile")} className="mt-4 rounded-xl bg-rosewood text-white px-6 py-2.5 text-sm font-bold hover:bg-pink-800 transition-colors">
                Complete Profile
              </button>
            </div>
          )}
          <div className="space-y-3">
            {bookings.map(b => (
              <OrderCard key={b.id} booking={b} onStatus={onStatus} onMessage={onMessage}/>
            ))}
          </div>
        </div>
      )}

      {/* ══ PROFILE TAB ══ */}
      {tab === "profile" && (
        <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
          <div className="rounded-2xl border border-pink-100 bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between mb-1">
              <h2 className="text-xl font-extrabold text-neutral-900">Edit Profile</h2>
              <span className="text-sm font-semibold text-rosewood">{profileScore}% complete</span>
            </div>
            <div className="h-2 rounded-full bg-pink-50 mb-6">
              <div className="h-full rounded-full bg-rosewood transition-all" style={{width:`${profileScore}%`}}/>
            </div>

            <form onSubmit={saveProfile} className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="Your Name">
                  <input className={inputClass} value={profile.name||""} onChange={e=>upd("name",e.target.value)} required/>
                </Field>
                <Field label="Shop / Business Name">
                  <input className={inputClass} value={profile.shopName||""} onChange={e=>upd("shopName",e.target.value)} placeholder="e.g. Sunita Boutique"/>
                </Field>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="Shop Type">
                  <select className={inputClass} value={profile.shopType||"Home-based"} onChange={e=>upd("shopType",e.target.value)}>
                    <option>Home-based</option><option>Shop</option><option>Online</option>
                  </select>
                </Field>
                <Field label="Availability">
                  <select className={inputClass} value={profile.availability||"available"} onChange={e=>upd("availability",e.target.value)}>
                    <option value="available">Available</option>
                    <option value="busy">Busy</option>
                    <option value="offline">Offline</option>
                  </select>
                </Field>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="Phone">
                  <input className={inputClass} value={profile.phone||""} onChange={e=>upd("phone",e.target.value)} required/>
                </Field>
                <Field label="Experience (years)">
                  <input type="number" min="0" className={inputClass} value={profile.experienceYears||0} onChange={e=>upd("experienceYears",e.target.value)}/>
                </Field>
              </div>
              <Field label="Price Range">
                <input className={inputClass} value={profile.priceRange||""} onChange={e=>upd("priceRange",e.target.value)} placeholder="e.g. ₹300 – ₹2500"/>
              </Field>
              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="UPI ID">
                  <input className={inputClass} value={profile.paymentUpiId||""} onChange={e=>upd("paymentUpiId",e.target.value)} placeholder="name@upi"/>
                </Field>
                <Field label="Payment Phone">
                  <input className={inputClass} value={profile.paymentPhone||""} onChange={e=>upd("paymentPhone",e.target.value)} placeholder="Payment mobile number"/>
                </Field>
              </div>
              <Field label="Address">
                <textarea className={inputClass} rows={2} value={profile.address||""} onChange={e=>upd("address",e.target.value)} placeholder="Shop / home address"/>
              </Field>
              <LocationPicker value={profile.location} onChange={loc=>upd("location",loc)}/>
              <Field label="Skills">
                <div className="flex flex-wrap gap-2 mt-1">
                  {ALL_SKILLS.map(s=>(
                    <button type="button" key={s} onClick={()=>toggleSkill(s)}
                      className={`rounded-full px-3 py-1 text-sm font-semibold transition-all
                        ${profile.skills?.includes(s) ? "bg-rosewood text-white" : "bg-pink-50 text-neutral-700 hover:bg-pink-100"}`}>
                      {s}
                    </button>
                  ))}
                </div>
              </Field>
              <div>
                <div className="flex items-center justify-between mb-2">
                  <p className="text-sm font-semibold text-neutral-700">Service Fees</p>
                  <button type="button" onClick={()=>setProfile(p=>({...p,serviceFees:[...(p.serviceFees||[]),{service:"",fee:""}]}))}
                    className="text-xs font-bold text-rosewood hover:underline">+ Add row</button>
                </div>
                <div className="space-y-2">
                  {(profile.serviceFees||[]).map((f,i)=>(
                    <div key={i} className="grid grid-cols-[1fr_1fr_auto] gap-2">
                      <input className={inputClass} placeholder="Service" value={f.service||""} onChange={e=>updFee(i,"service",e.target.value)}/>
                      <input className={inputClass} placeholder="Fee e.g. ₹500" value={f.fee||""} onChange={e=>updFee(i,"fee",e.target.value)}/>
                      <button type="button" onClick={()=>setProfile(p=>({...p,serviceFees:p.serviceFees.filter((_,fi)=>fi!==i)}))}
                        className="rounded-lg border border-red-100 bg-red-50 px-2 text-red-600 hover:bg-red-100 text-xs font-bold">✕</button>
                    </div>
                  ))}
                </div>
              </div>
              <Field label="About You">
                <textarea className={inputClass} rows={3} value={profile.about||""} onChange={e=>upd("about",e.target.value)} placeholder="Tell customers about your experience and speciality..."/>
              </Field>
              <Button disabled={saving} className="w-full">
                {saving ? "Saving..." : "Save Profile"}
              </Button>
            </form>
          </div>

          {/* right sidebar */}
          <div className="space-y-4">
            {/* photo upload */}
            <div className="rounded-2xl border border-pink-100 bg-white p-5 shadow-sm">
              <h3 className="font-bold text-neutral-900 mb-3">Profile Photo</h3>
              {profile.profilePhotoUrl
                ? <img src={profile.profilePhotoUrl} alt="Profile" className="h-40 w-full object-cover rounded-xl mb-3"/>
                : <div className="h-40 w-full rounded-xl bg-pink-50 flex items-center justify-center mb-3">
                    <Scissors size={36} className="text-pink-300"/>
                  </div>
              }
              <label className="flex items-center justify-center gap-2 rounded-xl border border-pink-200 bg-pink-50 px-4 py-2.5 text-sm font-semibold text-rosewood cursor-pointer hover:bg-pink-100 transition-colors">
                <ImagePlus size={16}/> Upload Photo
                <input type="file" accept="image/*" className="hidden" onChange={uploadPhoto}/>
              </label>
            </div>

            {/* work samples */}
            <div className="rounded-2xl border border-pink-100 bg-white p-5 shadow-sm">
              <h3 className="font-bold text-neutral-900 mb-3">Work Samples</h3>
              {(profile.workSamples||[]).length > 0 && (
                <div className="grid grid-cols-3 gap-2 mb-3">
                  {profile.workSamples.slice(0,6).map(s=>(
                    <img key={s} src={s} alt="Sample" className="aspect-square rounded-lg object-cover"/>
                  ))}
                </div>
              )}
              <label className="flex items-center justify-center gap-2 rounded-xl border border-pink-200 bg-pink-50 px-4 py-2.5 text-sm font-semibold text-rosewood cursor-pointer hover:bg-pink-100 transition-colors">
                <ImagePlus size={16}/> Add Sample
                <input type="file" accept="image/*" className="hidden" onChange={uploadSample}/>
              </label>
            </div>

            {/* quick tips */}
            <div className="rounded-2xl bg-gradient-to-br from-rosewood to-amethyst p-5 text-white">
              <h3 className="font-bold mb-3">Profile Tips</h3>
              <ul className="space-y-2 text-sm text-pink-100">
                {["Add a clear profile photo","Fill all service fees","Select all your skills","Write a detailed 'About'","Keep availability updated"].map(t=>(
                  <li key={t} className="flex items-start gap-2"><CheckCircle2 size={14} className="flex-shrink-0 mt-0.5 text-pink-300"/>{t}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}

    </main>
  );
}
