import { useEffect, useState } from "react";
import { Button } from "../components/Button";
import { Field, inputClass } from "../components/Field";
import { LocationPicker } from "../components/LocationPicker";
import { useAuth } from "../context/AuthContext";

export function AuthPage({ setPage, initialRole = "customer" }) {
  const { login, register, loginWithGoogle, loading } = useAuth();
  const [mode, setMode] = useState("login");
  const [error, setError] = useState("");
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
    role: initialRole,
    address: "",
    location: { lat: 28.6139, lng: 77.209 }
  });

  useEffect(() => {
    update("role", initialRole);
  }, [initialRole]);

  function update(field, value) {
    setForm((current) => ({ ...current, [field]: value }));
  }

  async function submit(event) {
    event.preventDefault();
    setError("");
    try {
      const user =
        mode === "login"
          ? await login(form.email, form.password)
          : await register(form);
      setPage(user.role === "tailor" ? "tailor" : user.role === "admin" ? "admin" : "customer");
    } catch (err) {
      setError(err.message);
    }
  }

  async function googleSubmit() {
    setError("");
    try {
      const user = await loginWithGoogle(form.role);
      setPage(user.role === "tailor" ? "tailor" : user.role === "admin" ? "admin" : "customer");
    } catch (err) {
      setError(err.message);
    }
  }

  return (
    <main className="mx-auto max-w-xl px-4 py-12">
      <div className="rounded-lg border border-pink-100 bg-white p-6 shadow-lg">
        <div className="mb-6 flex rounded-lg bg-pink-50 p-1">
          {["login", "signup"].map((item) => (
            <button
              key={item}
              onClick={() => setMode(item)}
              className={`flex-1 rounded-md px-4 py-2 font-bold ${
                mode === item ? "bg-white text-rosewood shadow-sm" : "text-neutral-600"
              }`}
            >
              {item === "login" ? "Login" : "Signup"}
            </button>
          ))}
        </div>
        <div className="mb-5 rounded-lg border border-pink-100 bg-pink-50 p-3">
          <p className="mb-2 text-sm font-bold text-neutral-700">Login / signup role</p>
          <div className="grid grid-cols-2 gap-2">
            {[
              ["customer", "Customer"],
              ["tailor", "Tailor"]
            ].map(([role, label]) => (
              <button
                key={role}
                type="button"
                onClick={() => update("role", role)}
                className={`rounded-lg px-3 py-2 text-sm font-bold ${
                  form.role === role ? "bg-rosewood text-white" : "bg-white text-neutral-700"
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>
        <form onSubmit={submit} className="space-y-4">
          {mode === "signup" && (
            <>
              <Field label="Name">
                <input className={inputClass} value={form.name} onChange={(e) => update("name", e.target.value)} required />
              </Field>
              <Field label="Phone">
                <input className={inputClass} value={form.phone} onChange={(e) => update("phone", e.target.value)} required />
              </Field>
              {form.role === "tailor" && (
                <>
                  <Field label="Shop / work address">
                    <textarea
                      className={inputClass}
                      value={form.address}
                      onChange={(e) => update("address", e.target.value)}
                      placeholder="House, street, area, city"
                      required
                    />
                  </Field>
                  <LocationPicker value={form.location} onChange={(location) => update("location", location)} />
                </>
              )}
            </>
          )}
          <Field label="Email">
            <input type="email" className={inputClass} value={form.email} onChange={(e) => update("email", e.target.value)} required />
          </Field>
          <Field label="Password">
            <input type="password" className={inputClass} value={form.password} onChange={(e) => update("password", e.target.value)} required />
          </Field>
          {error && <p className="rounded-lg bg-red-50 p-3 text-sm font-semibold text-red-700">{error}</p>}
          <Button disabled={loading} className="w-full">
            {loading ? "Please wait..." : mode === "login" ? "Login" : "Create account"}
          </Button>
        </form>
        <div className="my-5 flex items-center gap-3">
          <div className="h-px flex-1 bg-pink-100" />
          <span className="text-xs font-bold uppercase tracking-wide text-neutral-400">or</span>
          <div className="h-px flex-1 bg-pink-100" />
        </div>
        <Button type="button" variant="secondary" disabled={loading} className="w-full" onClick={googleSubmit}>
          <span className="grid h-5 w-5 place-items-center rounded-full bg-white text-sm font-black text-blue-600">G</span>
          Continue with Google
        </Button>
        <p className="mt-3 text-center text-xs text-neutral-500">
          Google signup uses the selected role: {form.role}.
        </p>
      </div>
    </main>
  );
}
