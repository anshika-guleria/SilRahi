import { useEffect, useState } from "react";
import { Button } from "../components/Button";
import { api } from "../services/api";

export function AdminPanel() {
  const [users, setUsers] = useState([]);
  const [tailors, setTailors] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [error, setError] = useState("");

  async function load() {
    setError("");
    try {
      const [userData, tailorData, bookingData] = await Promise.all([
        api.adminUsers(),
        api.adminTailors(),
        api.adminBookings()
      ]);
      setUsers(userData.users || []);
      setTailors(tailorData.tailors || []);
      setBookings(bookingData.bookings || []);
    } catch (err) {
      setError(err.message);
    }
  }

  useEffect(() => {
    load();
  }, []);

  async function verify(id, verified) {
    await api.verifyTailor(id, verified);
    await load();
  }

  async function remove(id) {
    await api.removeUser(id);
    await load();
  }

  return (
    <main className="mx-auto max-w-7xl px-4 py-8">
      <h1 className="mb-6 text-3xl font-extrabold">Admin Panel</h1>
      {error && <p className="mb-4 rounded-lg bg-red-50 p-3 text-red-700">{error}</p>}
      <div className="grid gap-6 lg:grid-cols-3">
        <section className="rounded-lg border border-pink-100 bg-white p-5 shadow-sm">
          <h2 className="mb-4 text-xl font-bold">Users</h2>
          <div className="space-y-3">
            {users.map((user) => (
              <article key={user.id} className="rounded-lg border border-pink-100 p-3">
                <p className="font-bold">{user.name}</p>
                <p className="text-sm text-neutral-600">{user.email} | {user.role}</p>
                <Button variant="secondary" className="mt-2" onClick={() => remove(user.id)}>Remove</Button>
              </article>
            ))}
          </div>
        </section>
        <section className="rounded-lg border border-pink-100 bg-white p-5 shadow-sm">
          <h2 className="mb-4 text-xl font-bold">Tailor Verification</h2>
          <div className="space-y-3">
            {tailors.map((tailor) => (
              <article key={tailor.id} className="rounded-lg border border-pink-100 p-3">
                <p className="font-bold">{tailor.name}</p>
                <p className="text-sm">{tailor.verified ? "Verified" : "Pending"}</p>
                <Button className="mt-2" variant={tailor.verified ? "secondary" : "primary"} onClick={() => verify(tailor.id, !tailor.verified)}>
                  {tailor.verified ? "Unverify" : "Verify"}
                </Button>
              </article>
            ))}
          </div>
        </section>
        <section className="rounded-lg border border-pink-100 bg-white p-5 shadow-sm">
          <h2 className="mb-4 text-xl font-bold">Bookings</h2>
          <div className="space-y-3">
            {bookings.map((booking) => (
              <article key={booking.id} className="rounded-lg border border-pink-100 p-3">
                <p className="font-bold">{booking.serviceType}</p>
                <p className="text-sm text-neutral-600">{booking.customerName} | {booking.status}</p>
              </article>
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}
