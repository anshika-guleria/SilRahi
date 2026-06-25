import { Scissors, Languages } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { useLang } from "../context/LanguageContext";
import { Button } from "./Button";

export function Shell({ currentPage, setPage, openAuth, children }) {
  const { user, logout } = useAuth();
  const { lang, t, toggle } = useLang();

  const links = [
    ["landing", t.home],
    ["map", t.findTailors],
    user?.role === "customer" && ["customer", t.customer],
    user?.role === "tailor" && ["tailor", t.tailor],
    user?.role === "admin" && ["admin", t.admin],
  ].filter(Boolean);

  return (
    <div className="min-h-screen">
      <header className="sticky top-0 z-30 border-b border-pink-100 bg-white/90 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3">
          {/* Logo */}
          <button onClick={() => setPage("landing")} className="flex items-center gap-3">
            <span className="grid h-10 w-10 place-items-center rounded-lg bg-pink-100 text-rosewood">
              <Scissors size={20} />
            </span>
            <span className="text-xl font-extrabold text-neutral-950">Silrahi</span>
          </button>

          {/* Nav links */}
          <nav className="hidden items-center gap-2 md:flex">
            {links.map(([key, label]) => (
              <button
                key={key}
                onClick={() => setPage(key)}
                className={`rounded-lg px-3 py-2 text-sm font-semibold ${
                  currentPage === key
                    ? "bg-pink-100 text-rosewood"
                    : "text-neutral-600 hover:bg-pink-50"
                }`}
              >
                {label}
              </button>
            ))}
          </nav>

          {/* Right side: lang toggle + auth */}
          <div className="flex items-center gap-2">
            {/* Language Toggle */}
            <button
              onClick={toggle}
              title={lang === "en" ? "Switch to Hindi" : "Switch to English"}
              className="flex items-center gap-1.5 rounded-lg border border-pink-200 bg-pink-50 px-3 py-2 text-xs font-bold text-rosewood hover:bg-pink-100 transition-colors"
            >
              <Languages size={14} />
              <span>{lang === "en" ? "हिंदी" : "EN"}</span>
            </button>

            {/* Auth */}
            {user ? (
              <div className="flex items-center gap-3">
                <span className="hidden text-sm text-neutral-600 sm:inline">{user.name}</span>
                <Button variant="secondary" onClick={logout}>{t.logout}</Button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Button variant="secondary" onClick={() => openAuth?.("customer") || setPage("auth")}>
                  Customer
                </Button>
                <Button onClick={() => openAuth?.("tailor") || setPage("auth")}>
                  Tailor
                </Button>
              </div>
            )}
          </div>
        </div>
      </header>
      {children}
    </div>
  );
}
