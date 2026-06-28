import { useEffect, useState } from "react";
import { ShieldCheck, Users, Scissors, CalendarCheck, CheckCircle2, XCircle, Trash2, RefreshCw } from "lucide-react";
import { api } from "../services/api";

export function AdminPanel() {
  const [users, setUsers] = useState([]);
  const [tailors, setTailors] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState("tailors");

  async function load() {
    setLoading(true); setError("");
    try {
      const [userData, tailorData, bookingData] = await Promise.all([
        api.adminUsers(), api.adminTailors(), api.adminBookings()
      ]);
      setUsers(userData.users || []);
      setTailors(tailorData.tailors || []);
      setBookings(bookingData.bookings || []);
    } catch (err) { setError(err.message); }
    finally { setLoading(false); }
  }

  useEffect(() => { load(); }, []);

  async function verify(id, verified) {
    await api.verifyTailor(id, verified); await load();
  }

  async function remove(id) {
    await api.removeUser(id); await load();
  }

  const tabs = [
    ["tailors", "Tailors", Scissors, tailors.length],
    ["users", "Users", Users, users.length],
    ["bookings", "Bookings", CalendarCheck, bookings.length],
  ];

  return (
    <main className="min-h-screen bg-[#fafafa]">
      {/* header */}
      <div className="bg-gradient-to-r from-neutral-950 via-[#1a0a1f] to-amethyst px-4 py-10 relative overflow-hidden">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,rgba(190,24,93,0.2),transparent_60%)]" />
        <div className="relative mx-auto max-w-7xl">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-bold text-pink-400 uppercase tracking-widest mb-1">Silrahi</p>
              <h1 className="text-3xl font-extrabold text-white">Admin Panel</h1>
              <p className="mt-1 text-neutral-400 text-sm">Manage tailors, users and bookings</p>
            </div>
            <button onClick={load} disabled={loading}
              className="flex items-center gap-2 rounded-xl border border-white/15 bg-white/8 px-4 py-2.5 text-sm font-semibold text-white hover:bg-white/15 transition-colors">
              <RefreshCw size={14} className={loading ? "animate-spin" : ""} /> Refresh
            </button>
          </div>

          {/* stat pills */}
          <div className="mt-6 flex flex-wrap gap-3">
            {tabs.map(([key, label, Icon, count]) => (
              <button key={key} onClick={() => setTab(key)}
                className={`flex items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-bold transition-all
                  ${tab === key
                    ? "bg-white text-rosewood shadow-lg"
                    : "border border-white/15 bg-white/8 text-white hover:bg-white/15"}`}>
                <Icon size={15} />
                {label}
                <span className={`rounded-full px-2 py-0.5 text-xs font-extrabold
                  ${tab === key ? "bg-pink-100 text-rosewood" : "bg-white/15 text-white"}`}>
                  {count}
                </span>
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 py-8">
        {error && <p className="mb-4 rounded-xl bg-red-50 border border-red-200 p-3 text-sm font-semibold text-red-700">{error}</p>}

        {loading && (
          <div className="grid gap-4 md:grid-cols-3">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-24 rounded-2xl bg-neutral-100 animate-pulse" />
            ))}
          </div>
        )}

        {/* TAILORS */}
        {!loading && tab === "tailors" && (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {tailors.length === 0 && <EmptyState text="No tailors registered yet." />}
            {tailors.map((tailor) => (
              <article key={tailor.id} className="rounded-2xl border border-neutral-100 bg-white p-5 shadow-sm hover:shadow-md transition-shadow">
                <div className="flex items-start gap-3 mb-4">
                  {tailor.profilePhotoUrl
                    ? <img src={tailor.profilePhotoUrl} alt={tailor.name} className="h-12 w-12 rounded-xl object-cover" />
                    : <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-rosewood to-amethyst flex items-center justify-center text-white font-bold text-lg flex-shrink-0">
                        {tailor.name?.[0] || "T"}
                      </div>
                  }
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-neutral-900 truncate">{tailor.name}</p>
                    <p className="text-sm text-neutral-500">{tailor.shopName || "Home tailor"}</p>
                  </div>
                  <span className={`flex-shrink-0 rounded-full px-2.5 py-1 text-xs font-bold
                    ${tailor.verified ? "bg-emerald-50 text-emerald-700" : "bg-amber-50 text-amber-700"}`}>
                    {tailor.verified ? "Verified" : "Pending"}
                  </span>
                </div>
                <p className="text-xs text-neutral-400 mb-4">{tailor.email}</p>
                <button onClick={() => verify(tailor.id, !tailor.verified)}
                  className={`w-full flex items-center justify-center gap-2 rounded-xl py-2.5 text-sm font-bold transition-all
                    ${tailor.verified
                      ? "border border-red-200 bg-red-50 text-red-700 hover:bg-red-100"
                      : "bg-gradient-to-r from-emerald-500 to-teal-500 text-white hover:opacity-90 shadow-sm"}`}>
                  {tailor.verified ? <><XCircle size={14}/> Unverify</> : <><CheckCircle2 size={14}/> Verify Tailor</>}
                </button>
              </article>
            ))}
          </div>
        )}

        {/* USERS */}
        {!loading && tab === "users" && (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {users.length === 0 && <EmptyState text="No users found." />}
            {users.map((user) => (
              <article key={user.id} className="rounded-2xl border border-neutral-100 bg-white p-5 shadow-sm hover:shadow-md transition-shadow">
                <div className="flex items-center gap-3 mb-3">
                  <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-rosewood to-amethyst flex items-center justify-center text-white font-bold">
                    {user.name?.[0] || "U"}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-neutral-900 truncate">{user.name}</p>
                    <p className="text-xs text-neutral-500 truncate">{user.email}</p>
                  </div>
                  <span className="rounded-full bg-pink-50 border border-pink-100 px-2.5 py-1 text-xs font-bold text-rosewood capitalize">
                    {user.role}
                  </span>
                </div>
                <button onClick={() => remove(user.id)}
                  className="w-full flex items-center justify-center gap-2 rounded-xl border border-red-200 bg-red-50 py-2.5 text-sm font-bold text-red-700 hover:bg-red-100 transition-colors">
                  <Trash2 size={14} /> Remove User
                </button>
              </article>
            ))}
          </div>
        )}

        {/* BOOKINGS */}
        {!loading && tab === "bookings" && (
          <div className="grid gap-4 md:grid-cols-2">
            {bookings.length === 0 && <EmptyState text="No bookings found." />}
            {bookings.map((booking) => (
              <article key={booking.id} className="rounded-2xl border border-neutral-100 bg-white p-5 shadow-sm">
                <div className="flex items-start justify-between gap-3 mb-2">
                  <div>
                    <p className="font-bold text-neutral-900">{booking.serviceType}</p>
                    <p className="text-sm text-neutral-500">{booking.customerName}</p>
                  </div>
                  <span className={`flex-shrink-0 rounded-full px-3 py-1 text-xs font-bold capitalize border
                    ${booking.status === "delivered" ? "bg-emerald-50 text-emerald-700 border-emerald-100"
                    : booking.status === "pending" ? "bg-amber-50 text-amber-700 border-amber-100"
                    : booking.status === "cancelled" ? "bg-neutral-100 text-neutral-600 border-neutral-200"
                    : "bg-blue-50 text-blue-700 border-blue-100"}`}>
                    {booking.status}
                  </span>
                </div>
                <p className="text-xs text-neutral-400">{booking.deliveryDate || booking.preferredDate}</p>
              </article>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}

function EmptyState({ text }) {
  return (
    <div className="md:col-span-3 rounded-2xl border-2 border-dashed border-neutral-200 p-12 text-center">
      <p className="font-semibold text-neutral-400">{text}</p>
    </div>
  );
}
