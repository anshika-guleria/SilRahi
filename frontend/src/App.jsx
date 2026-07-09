import { useEffect, useState } from "react";
import { Shell } from "./components/Shell";
import { useAuth } from "./context/AuthContext";
import { AdminPanel } from "./pages/AdminPanel";
import { AuthPage } from "./pages/AuthPage";
import { CustomerDashboard } from "./pages/CustomerDashboard";
import { Landing } from "./pages/Landing";
import { StyleAdvisor } from "./pages/StyleAdvisor";
import { TailorDashboard } from "./pages/TailorDashboard";
import { TailorMap } from "./pages/TailorMap";
import { TailorProfile } from "./pages/TailorProfile";

function dashboardPageForRole(role) {
  if (role === "tailor") return "tailor";
  if (role === "admin") return "admin";
  return "customer";
}

export default function App() {
  const { user } = useAuth();
  const [page, setPage] = useState("landing");
  const [selectedTailor, setSelectedTailor] = useState(null);
  const [authRole, setAuthRole] = useState("customer");

  function openAuth(role = "customer") {
    setAuthRole(role);
    setPage("auth");
  }

  useEffect(() => {
    if (!user) return;

    if (page === "auth" || page === "landing") {
      setPage(dashboardPageForRole(user.role));
      return;
    }

    const protectedPages = ["customer", "tailor", "admin"];
    if (protectedPages.includes(page) && page !== dashboardPageForRole(user.role)) {
      setPage(dashboardPageForRole(user.role));
    }
  }, [user, page]);

  function renderPage() {
    if (page === "auth") return <AuthPage setPage={setPage} initialRole={authRole} />;
    if (page === "map") return <TailorMap setPage={setPage} setSelectedTailor={setSelectedTailor} />;
    if (page === "tailorProfile") return <TailorProfile tailor={selectedTailor} setPage={setPage} />;
    if (page === "aiAdvisor") return <StyleAdvisor setPage={setPage} />;
    if (page === "customer") return user?.role === "customer" ? <CustomerDashboard setPage={setPage} /> : <AuthPage setPage={setPage} initialRole="customer" />;
    if (page === "tailor") return user?.role === "tailor" ? <TailorDashboard /> : <AuthPage setPage={setPage} initialRole="tailor" />;
    if (page === "admin") return user?.role === "admin" ? <AdminPanel /> : <AuthPage setPage={setPage} initialRole="customer" />;
    return <Landing setPage={setPage} openAuth={openAuth} />;
  }

  return (
    <Shell currentPage={page} setPage={setPage} openAuth={openAuth}>
      {renderPage()}
    </Shell>
  );
}
