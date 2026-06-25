import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import { firebaseAuth } from "../firebase";
import { api } from "../services/api";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem("silrahi_user");
    return saved ? JSON.parse(saved) : null;
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("silrahi_token");
    if (!token) return;

    let cancelled = false;
    setLoading(true);
    api.me()
      .then((data) => {
        if (!cancelled) setUser(data.user);
      })
      .catch(() => {
        localStorage.removeItem("silrahi_token");
        localStorage.removeItem("silrahi_user");
        if (!cancelled) setUser(null);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (user) {
      localStorage.setItem("silrahi_user", JSON.stringify(user));
    } else {
      localStorage.removeItem("silrahi_user");
    }
  }, [user]);

  async function login(email, password) {
    setLoading(true);
    try {
      const data = await api.login({ email, password });
      localStorage.setItem("silrahi_token", data.token);
      setUser(data.user);
      return data.user;
    } finally {
      setLoading(false);
    }
  }

  async function register(payload) {
    setLoading(true);
    try {
      const data = await api.register(payload);
      localStorage.setItem("silrahi_token", data.token);
      setUser(data.user);
      return data.user;
    } finally {
      setLoading(false);
    }
  }

  async function loginWithGoogle(role = "customer") {
    setLoading(true);
    try {
      const provider = new GoogleAuthProvider();
      provider.setCustomParameters({ prompt: "select_account" });
      const result = await signInWithPopup(firebaseAuth, provider);
      const idToken = await result.user.getIdToken();
      const data = await api.firebaseLogin({ idToken, role });
      localStorage.setItem("silrahi_token", data.token);
      setUser(data.user);
      return data.user;
    } finally {
      setLoading(false);
    }
  }

  function logout() {
    localStorage.removeItem("silrahi_token");
    localStorage.removeItem("silrahi_user");
    setUser(null);
  }

  const value = useMemo(
    () => ({ user, loading, login, register, loginWithGoogle, logout }),
    [user, loading]
  );
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  return useContext(AuthContext);
}
