import { useEffect, useState } from "react";
import { Scissors, Sparkles } from "lucide-react";
import { Field, inputClass } from "../components/Field";
import { LocationPicker } from "../components/LocationPicker";
import { useAuth } from "../context/AuthContext";
import { useLang } from "../context/LanguageContext";

function dashboardPageForRole(role) {
  if (role === "tailor") return "tailor";
  if (role === "admin") return "admin";
  return "customer";
}

function roleMismatchMessage(selectedRole, actualRole) {
  return `This account is registered as ${actualRole}. Please login from the ${actualRole} option.`;
}

export function AuthPage({ setPage, initialRole = "customer" }) {
  const { user, login, register, loginWithGoogle, logout, loading } = useAuth();
  const { t } = useLang();

  const [mode, setMode] = useState("login");
  const [error, setError] = useState("");
  const [form, setForm] = useState({
    name: "", email: "", phone: "", password: "",
    role: initialRole, address: "",
    location: { lat: 28.6139, lng: 77.209 },
  });

  useEffect(() => { update("role", initialRole); }, [initialRole]);
  useEffect(() => { if (user) setPage(dashboardPageForRole(user.role)); }, [user, setPage]);

  function update(field, value) {
    setForm((c) => ({ ...c, [field]: value }));
  }

  async function submit(e) {
    e.preventDefault(); setError("");
    try {
      const u = mode === "login"
        ? await login(form.email, form.password, form.role)
        : await register(form);
      if (u.role !== form.role && u.role !== "admin") {
        logout(); setError(roleMismatchMessage(form.role, u.role)); return;
      }
      setPage(dashboardPageForRole(u.role));
    } catch (err) { setError(err.message); }
  }

  async function googleSubmit() {
    setError("");
    try {
      const u = await loginWithGoogle(form.role);
      if (u.role !== form.role && u.role !== "admin") {
        logout(); setError(roleMismatchMessage(form.role, u.role)); return;
      }
      setPage(dashboardPageForRole(u.role));
    } catch (err) { setError(err.message); }
  }

  const roleOptions = [["customer", t.roleCustomer], ["tailor", t.roleTailor]];

  return (
    <main className="min-h-[calc(100vh-64px)] bg-gradient-to-br from-neutral-950 via-[#1a0a1f] to-[#0f0a1e] flex items-center justify-center px-4 py-12 relative overflow-hidden">
      {/* blobs */}
      <div className="pointer-events-none absolute top-0 left-1/2 -translate-x-1/2 h-[400px] w-[500px] rounded-full bg-rosewood/15 blur-[100px]" />
      <div className="pointer-events-none absolute bottom-0 right-0 h-64 w-64 rounded-full bg-amethyst/10 blur-[80px]" />

      <div className="relative w-full max-w-md">
        {/* logo */}
        <div className="flex flex-col items-center mb-8">
          <div className="h-12 w-12 rounded-2xl bg-rosewood/20 border border-rosewood/30 flex items-center justify-center mb-3">
            <Scissors size={22} className="text-pink-400" />
          </div>
          <h1 className="text-2xl font-extrabold text-white">Silrahi</h1>
          <p className="text-sm text-neutral-400 mt-1 flex items-center gap-1">
            <Sparkles size={11} className="text-pink-400" />
            Women's Tailor Network
          </p>
        </div>

        <div className="rounded-2xl border border-neutral-700 bg-neutral-900 backdrop-blur-md p-7 shadow-2xl">
          {/* mode tabs */}
          <div className="mb-6 flex rounded-xl bg-neutral-800 p-1">
            {["login", "signup"].map((item) => (
              <button key={item} onClick={() => setMode(item)}
                className={`flex-1 rounded-lg px-4 py-2.5 text-sm font-bold transition-all
                  ${mode === item ? "bg-gradient-to-r from-rosewood to-pink-600 text-white shadow-lg" : "text-neutral-400 hover:text-white"}`}>
                {item === "login" ? t.loginTab : t.signupTab}
              </button>
            ))}
          </div>

          {/* role selector */}
          <div className="mb-5 rounded-xl border border-neutral-700 bg-neutral-800 p-4">
            <p className="mb-3 text-xs font-bold text-neutral-400 uppercase tracking-widest">{t.roleLabel}</p>
            <div className="grid grid-cols-2 gap-2">
              {roleOptions.map(([role, label]) => (
                <button key={role} type="button" onClick={() => update("role", role)}
                  className={`rounded-xl px-3 py-2.5 text-sm font-bold transition-all
                    ${form.role === role
                      ? "bg-gradient-to-r from-rosewood to-pink-600 text-white shadow-md"
                      : "bg-neutral-700 text-neutral-300 hover:bg-neutral-600 border border-neutral-600"}`}>
                  {label}
                </button>
              ))}
            </div>
          </div>

          {/* form */}
          <form onSubmit={submit} className="space-y-4">
            {mode === "signup" && (
              <>
                <DarkField label={t.name}>
                  <input className={darkInput} value={form.name} onChange={(e) => update("name", e.target.value)} required />
                </DarkField>
                <DarkField label={t.phone}>
                  <input className={darkInput} value={form.phone} onChange={(e) => update("phone", e.target.value)} placeholder="10-digit mobile" required />
                </DarkField>
                {form.role === "tailor" && (
                  <>
                    <DarkField label={t.address}>
                      <textarea className={darkInput} value={form.address} onChange={(e) => update("address", e.target.value)} placeholder={t.addressPlaceholder} required />
                    </DarkField>
                    <LocationPicker value={form.location} onChange={(loc) => update("location", loc)} />
                  </>
                )}
              </>
            )}

            <DarkField label={t.email}>
              <input type="email" className={darkInput} value={form.email} onChange={(e) => update("email", e.target.value)} required />
            </DarkField>
            <DarkField label={t.password}>
              <input type="password" className={darkInput} value={form.password} onChange={(e) => update("password", e.target.value)} required />
            </DarkField>

            {error && (
              <p className="rounded-xl bg-red-500/10 border border-red-500/20 p-3 text-sm font-semibold text-red-400">{error}</p>
            )}

            <button disabled={loading}
              className="w-full rounded-xl bg-gradient-to-r from-rosewood to-pink-600 text-white font-bold py-3 text-sm hover:opacity-90 transition-opacity shadow-lg disabled:opacity-50">
              {loading ? t.pleaseWait : mode === "login" ? t.loginBtn : t.createAccountBtn}
            </button>
          </form>

          {/* divider */}
          <div className="my-5 flex items-center gap-3">
            <div className="h-px flex-1 bg-neutral-700" />
            <span className="text-xs font-bold uppercase tracking-wide text-neutral-500">{t.orDivider}</span>
            <div className="h-px flex-1 bg-neutral-700" />
          </div>

          {/* google */}
          <button type="button" disabled={loading} onClick={googleSubmit}
            className="w-full flex items-center justify-center gap-2.5 rounded-xl border border-neutral-600 bg-neutral-800 text-white font-semibold py-3 text-sm hover:bg-neutral-700 transition-colors">
            <span className="grid h-5 w-5 place-items-center rounded-full bg-white text-sm font-black text-blue-600 shadow-sm">G</span>
            {t.googleBtn}
          </button>

          <p className="mt-3 text-center text-xs text-neutral-500">
            {t.googleRoleNote} <span className="font-semibold text-pink-400">{form.role}</span>
          </p>
        </div>
      </div>
    </main>
  );
}

function DarkField({ label, children }) {
  return (
    <div>
      <label className="mb-1.5 block text-xs font-semibold text-neutral-400 uppercase tracking-wide">{label}</label>
      {children}
    </div>
  );
}

const darkInput = "w-full rounded-xl border border-neutral-700 bg-neutral-800 px-4 py-2.5 text-sm text-white placeholder-neutral-500 focus:border-pink-500 focus:ring-1 focus:ring-pink-500 outline-none transition-colors";
