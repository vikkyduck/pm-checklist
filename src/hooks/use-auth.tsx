import { useEffect, useState } from "react";
import { auth, type AuthUser } from "@/lib/api";

export function useAuth() {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setUser(auth.getUser());
    setReady(true);
    const onStorage = () => setUser(auth.getUser());
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  return {
    user,
    ready,
    logout: () => {
      auth.clear();
      setUser(null);
      window.location.href = "/login";
    },
  };
}
