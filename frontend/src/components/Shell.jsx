import { useState } from "react";
import { Scissors, Languages, Menu, X } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { useLang } from "../context/LanguageContext";

export function Shell({ currentPage, setPage, openAuth, children }) {
  const { user, logout } = useAuth();
  const { lang, t, toggle } = useLang();
  const [mobileOpen, setMobileOpen] = useState(false);

  const isLanding = currentPage === "landing";

  const links = [
    ["landing", t.home],
    ["map", t.findTailors],
    user?.role === "customer" && ["customer", t.customer],
    user?.role === "tailor"   && ["tailor",   t.tailor],
    user?.role === "admin"    && ["admin",     t.admin],
  ].filter(Boolean);

  return (
    <div className="min-h-screen">
      <header className={`sticky top-0 z-30 transition-colors duration-300
        ${isLanding
          ? "border-b border-neutral-800 bg-neutral-950 backdrop-blur-lg"
          : "border-b border-pink-100 bg-white/95 backdrop-blur"}`}
      >
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-3 px-4 py-3 sm:py-3.5">

          {/* Logo */}
          <button onClick={() => setPage("landing")} className="group flex min-w-0 items-center gap-2.5">
            <span className={`grid h-9 w-9 place-items-center rounded-lg transition-colors
              ${isLanding ? "bg-rosewood/30 text-pink-400" : "bg-pink-100 text-rosewood"}`}>
              <Scissors size={18} />
            </span>
            <span className={`truncate text-lg font-extrabold sm:text-xl ${isLanding ? "text-white" : "text-neutral-950"}`}>
              Silrahi
            </span>
          </button>

          {/* Desktop Nav */}
          <nav className="hidden items-center gap-1 md:flex">
            {links.map(([key, label]) => (
              <button key={key} onClick={() => setPage(key)}
                className={`rounded-lg px-3.5 py-2 text-sm font-semibold transition-colors
                  ${currentPage === key
                    ? isLanding ? "bg-neutral-800 text-white" : "bg-pink-100 text-rosewood"
                    : isLanding ? "text-neutral-400 hover:text-white hover:bg-neutral-800" : "text-neutral-600 hover:bg-pink-50 hover:text-rosewood"}`}
              >
                {label}
              </button>
            ))}
          </nav>

          {/* Right */}
          <div className="flex min-w-0 items-center gap-2">
            {/* Language Toggle */}
            <button onClick={toggle}
              className={`hidden items-center gap-1.5 rounded-lg border px-3 py-2 text-xs font-bold transition-colors min-[380px]:flex
                ${isLanding
                  ? "border-neutral-700 bg-neutral-800 text-neutral-300 hover:bg-neutral-700 hover:text-white"
                  : "border-pink-200 bg-pink-50 text-rosewood hover:bg-pink-100"}`}
            >
              <Languages size={13} />
              <span>{lang === "en" ? "हिंदी" : "EN"}</span>
            </button>

            {/* Auth */}
            {user ? (
              <div className="hidden sm:flex items-center gap-2">
                <span className={`text-sm ${isLanding ? "text-neutral-300" : "text-neutral-600"}`}>
                  {user.name}
                </span>
                <button onClick={logout}
                  className={`rounded-lg border px-4 py-2 text-sm font-semibold transition-colors
                    ${isLanding
                      ? "border-neutral-700 bg-neutral-800 text-white hover:bg-neutral-700"
                      : "border-pink-200 bg-white text-rosewood hover:bg-pink-50"}`}
                >
                  {t.logout}
                </button>
              </div>
            ) : (
              <div className="hidden sm:flex items-center gap-2">
                <button onClick={() => openAuth?.("customer") || setPage("auth")}
                  className={`rounded-lg border px-4 py-2 text-sm font-semibold transition-colors
                    ${isLanding
                      ? "border-neutral-700 bg-neutral-800 text-white hover:bg-neutral-700"
                      : "border-pink-200 bg-white text-rosewood hover:bg-pink-50"}`}
                >
                  Customer
                </button>
                <button onClick={() => openAuth?.("tailor") || setPage("auth")}
                  className="rounded-lg bg-rosewood text-white px-4 py-2 text-sm font-semibold hover:bg-pink-800 transition-colors shadow-sm"
                >
                  Tailor
                </button>
              </div>
            )}

            {/* Mobile hamburger */}
            <button onClick={() => setMobileOpen(!mobileOpen)}
              className={`md:hidden rounded-lg p-2 transition-colors
                ${isLanding ? "text-white hover:bg-neutral-800" : "text-neutral-700 hover:bg-pink-50"}`}
              aria-label="Toggle menu"
            >
              {mobileOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        {mobileOpen && (
          <div className={`md:hidden border-t px-4 py-4 flex flex-col gap-2
            ${isLanding ? "border-neutral-800 bg-neutral-950" : "border-pink-100 bg-white"}`}
          >
            <button onClick={toggle}
              className={`flex items-center justify-center gap-1.5 rounded-lg border px-3 py-2 text-xs font-bold transition-colors min-[380px]:hidden
                ${isLanding
                  ? "border-neutral-700 bg-neutral-800 text-neutral-300 hover:bg-neutral-700 hover:text-white"
                  : "border-pink-200 bg-pink-50 text-rosewood hover:bg-pink-100"}`}
            >
              <Languages size={13} />
              <span>{lang === "en" ? "à¤¹à¤¿à¤‚à¤¦à¥€" : "EN"}</span>
            </button>
            {links.map(([key, label]) => (
              <button key={key}
                onClick={() => { setPage(key); setMobileOpen(false); }}
                className={`rounded-lg px-4 py-2.5 text-sm font-semibold text-left transition-colors
                  ${currentPage === key
                    ? isLanding ? "bg-neutral-800 text-white" : "bg-pink-100 text-rosewood"
                    : isLanding ? "text-neutral-300 hover:bg-neutral-800" : "text-neutral-600 hover:bg-pink-50"}`}
              >
                {label}
              </button>
            ))}
            <div className={`grid gap-2 pt-2 mt-1 border-t sm:flex ${isLanding ? "border-neutral-800" : "border-pink-100"}`}>
              {user ? (
                <button onClick={() => { logout(); setMobileOpen(false); }}
                  className="flex-1 rounded-lg border border-pink-200 bg-white text-rosewood py-2.5 text-sm font-semibold"
                >
                  {t.logout}
                </button>
              ) : (
                <>
                  <button onClick={() => { openAuth?.("customer"); setMobileOpen(false); }}
                    className={`flex-1 rounded-lg border py-2.5 text-sm font-semibold
                      ${isLanding ? "border-neutral-700 bg-neutral-800 text-white" : "border-pink-200 text-rosewood"}`}
                  >
                    Customer
                  </button>
                  <button onClick={() => { openAuth?.("tailor"); setMobileOpen(false); }}
                    className="flex-1 rounded-lg bg-rosewood text-white py-2.5 text-sm font-semibold"
                  >
                    Tailor
                  </button>
                </>
              )}
            </div>
          </div>
        )}
      </header>

      {children}
    </div>
  );
}
