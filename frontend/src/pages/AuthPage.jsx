import { useEffect, useState } from "react";
import { Button } from "../components/Button";
import { Field, inputClass } from "../components/Field";
import { LocationPicker } from "../components/LocationPicker";
import { useAuth } from "../context/AuthContext";
import { useLang } from "../context/LanguageContext";

function dashboardPageForRole(role) {
  if (role === "tailor") return "tailor";
  if (role === "admin") return "admin";
  return "customer";
}

export function AuthPage({ setPage, initialRole = "customer" }) {
  const { user, login, register, loginWithGoogle, loading } = useAuth();
  const { t } = useLang();

  const [mode, setMode] = useState("login");
  const [error, setError] = useState("");
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
    role: initialRole,
    address: "",
    location: { lat: 28.6139, lng: 77.209 },
  });

  useEffect(() => {
    update("role", initialRole);
  }, [initialRole]);

  useEffect(() => {
    if (user) setPage(dashboardPageForRole(user.role));
  }, [user, setPage]);

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
      setPage(dashboardPageForRole(user.role));
    } catch (err) {
      setError(err.message);
    }
  }

  async function googleSubmit() {
    setError("");
    try {
      const user = await loginWithGoogle(form.role);
      setPage(dashboardPageForRole(user.role));
    } catch (err) {
      setError(err.message);
    }
  }

  return (
    <main className="mx-auto max-w-xl px-4 py-12">
      <div className="rounded-2xl border border-pink-100 bg-white p-6 shadow-lg">

        {/* Login / Sign Up tab */}
        <div className="mb-6 flex rounded-lg bg-pink-50 p-1">
          {["login", "signup"].map((item) => (
            <button
              key={item}
              onClick={() => setMode(item)}
              className={`flex-1 rounded-md px-4 py-2 font-bold transition-all ${
                mode === item
                  ? "bg-white text-rosewood shadow-sm"
                  : "text-neutral-600 hover:text-rosewood"
              }`}
            >
              {item === "login" ? t.loginTab : t.signupTab}
            </button>
          ))}
        </div>

        {/* Role selector */}
        <div className="mb-5 rounded-xl border border-pink-100 bg-pink-50 p-4">
          <p className="mb-3 text-sm font-bold text-neutral-700">{t.roleLabel}</p>
          <div className="grid grid-cols-2 gap-2">
            {[
              ["customer", t.roleCustomer],
              ["tailor", t.roleTailor],
            ].map(([role, label]) => (
              <button
                key={role}
                type="button"
                onClick={() => update("role", role)}
                className={`rounded-lg px-3 py-2.5 text-sm font-bold transition-all ${
                  form.role === role
                    ? "bg-rosewood text-white shadow"
                    : "bg-white text-neutral-700 hover:bg-pink-100"
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        {/* Form */}
        <form onSubmit={submit} className="space-y-4">
          {mode === "signup" && (
            <>
              <Field label={t.name}>
                <input
                  className={inputClass}
                  value={form.name}
                  onChange={(e) => update("name", e.target.value)}
                  required
                />
              </Field>
              <Field label={t.phone}>
                <input
                  className={inputClass}
                  value={form.phone}
                  onChange={(e) => update("phone", e.target.value)}
                  placeholder="10-digit mobile number"
                  required
                />
              </Field>
              {form.role === "tailor" && (
                <>
                  <Field label={t.address}>
                    <textarea
                      className={inputClass}
                      value={form.address}
                      onChange={(e) => update("address", e.target.value)}
                      placeholder={t.addressPlaceholder}
                      required
                    />
                  </Field>
                  <LocationPicker
                    value={form.location}
                    onChange={(location) => update("location", location)}
                  />
                </>
              )}
            </>
          )}

          <Field label={t.email}>
            <input
              type="email"
              className={inputClass}
              value={form.email}
              onChange={(e) => update("email", e.target.value)}
              required
            />
          </Field>
          <Field label={t.password}>
            <input
              type="password"
              className={inputClass}
              value={form.password}
              onChange={(e) => update("password", e.target.value)}
              required
            />
          </Field>

          {error && (
            <p className="rounded-lg bg-red-50 p-3 text-sm font-semibold text-red-700">
              {error}
            </p>
          )}

          <Button disabled={loading} className="w-full">
            {loading
              ? t.pleaseWait
              : mode === "login"
              ? t.loginBtn
              : t.createAccountBtn}
          </Button>
        </form>

        {/* Divider */}
        <div className="my-5 flex items-center gap-3">
          <div className="h-px flex-1 bg-pink-100" />
          <span className="text-xs font-bold uppercase tracking-wide text-neutral-400">
            {t.orDivider}
          </span>
          <div className="h-px flex-1 bg-pink-100" />
        </div>

        {/* Google */}
        <Button
          type="button"
          variant="secondary"
          disabled={loading}
          className="w-full"
          onClick={googleSubmit}
        >
          <span className="grid h-5 w-5 place-items-center rounded-full bg-white text-sm font-black text-blue-600 shadow-sm">
            G
          </span>
          {t.googleBtn}
        </Button>

        <p className="mt-3 text-center text-xs text-neutral-500">
          {t.googleRoleNote} <span className="font-semibold text-rosewood">{form.role}</span>
        </p>
      </div>
    </main>
  );
}
