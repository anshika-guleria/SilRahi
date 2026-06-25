import { Scissors } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { Button } from "./Button";

export function Shell({ currentPage, setPage, openAuth, children }) {
  const { user, logout } = useAuth();
  const links = [
    ["landing", "Home"],
    ["map", "Find Tailors"],
    user?.role === "customer" && ["customer", "Customer"],
    user?.role === "tailor" && ["tailor", "Tailor"],
    user?.role === "admin" && ["admin", "Admin"]
  ].filter(Boolean);

  return (
    <div className="min-h-screen">
      <header className="sticky top-0 z-30 border-b border-pink-100 bg-white/90 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3">
          <button onClick={() => setPage("landing")} className="flex items-center gap-3">
            <span className="grid h-10 w-10 place-items-center rounded-lg bg-pink-100 text-rosewood">
              <Scissors size={20} />
            </span>
            <span className="text-xl font-extrabold text-neutral-950">Silrahi</span>
          </button>
          <nav className="hidden items-center gap-2 md:flex">
            {links.map(([key, label]) => (
              <button
                key={key}
                onClick={() => setPage(key)}
                className={`rounded-lg px-3 py-2 text-sm font-semibold ${
                  currentPage === key ? "bg-pink-100 text-rosewood" : "text-neutral-600 hover:bg-pink-50"
                }`}
              >
                {label}
              </button>
            ))}
          </nav>
          {user ? (
            <div className="flex items-center gap-3">
              <span className="hidden text-sm text-neutral-600 sm:inline">{user.name}</span>
              <Button variant="secondary" onClick={logout}>Logout</Button>
            </div>
          ) : (
            <Button onClick={() => openAuth?.("customer") || setPage("auth")}>Login</Button>
          )}
        </div>
      </header>
      {children}
    </div>
  );
}
