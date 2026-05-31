import { createContext, useContext, useEffect, useState, type ReactNode } from "react";

interface AuthState {
  user: { id: string; email: string } | null;
  token: string | null;
  isAdmin: boolean;
  loading: boolean;
  signOut: () => Promise<void>;
  signIn: (token: string) => Promise<void>;
}

const AuthContext = createContext<AuthState | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<{ id: string; email: string } | null>(null);
  const [token, setToken] = useState<string | null>(() => localStorage.getItem("aurvelia_token"));
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      setLoading(true);
      const t = localStorage.getItem("aurvelia_token");
      setToken(t);
      if (!t) {
        setUser(null);
        setIsAdmin(false);
        setLoading(false);
        return;
      }
      try {
        const res = await fetch(`/api/auth/me`, { headers: { Authorization: `Bearer ${t}` } });
        if (!res.ok) throw new Error("not auth");
        const data = await res.json();
        setUser(data.user ?? null);
        setIsAdmin(!!data.isAdmin);
      } catch (err) {
        setUser(null);
        setIsAdmin(false);
        setToken(null);
        localStorage.removeItem("aurvelia_token");
      }
      setLoading(false);
    }
    load();

    const onStorage = (e: StorageEvent) => {
      if (e.key === "aurvelia_token") {
        // token changed in another tab
        load();
      }
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  const signIn = async (t: string) => {
    localStorage.setItem("aurvelia_token", t);
    setToken(t);
    try {
      const res = await fetch(`/api/auth/me`, { headers: { Authorization: `Bearer ${t}` } });
      const data = await res.json();
      setUser(data.user ?? null);
      setIsAdmin(!!data.isAdmin);
    } catch (err) {
      setUser(null);
      setIsAdmin(false);
    }
  };

  const signOut = async () => {
    localStorage.removeItem("aurvelia_token");
    setToken(null);
    setUser(null);
    setIsAdmin(false);
  };

  return (
    <AuthContext.Provider value={{ user, token, isAdmin, loading, signOut, signIn }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
