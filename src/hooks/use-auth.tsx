import { useEffect, useState } from "react";
import type { User } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";
// Auth hook backed by Lovable Cloud (magic link).

export type PMUser = {
  id: string;
  email: string;
  name: string;
};

function toPMUser(u: User | null, displayName?: string | null): PMUser | null {
  if (!u) return null;
  const meta = (u.user_metadata ?? {}) as Record<string, unknown>;
  const fromMeta =
    typeof meta.display_name === "string"
      ? meta.display_name
      : typeof meta.name === "string"
        ? meta.name
        : null;
  return {
    id: u.id,
    email: u.email ?? "",
    name: displayName || fromMeta || (u.email ? u.email.split("@")[0] : "PM"),
  };
}

export function useAuth() {
  const [user, setUser] = useState<PMUser | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    // Subscribe FIRST, then fetch session — avoids missed events.
    const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(toPMUser(session?.user ?? null));
    });

    supabase.auth.getSession().then(async ({ data }) => {
      const u = data.session?.user ?? null;
      let display: string | null = null;
      if (u) {
        const { data: profile } = await supabase
          .from("profiles")
          .select("display_name")
          .eq("id", u.id)
          .maybeSingle();
        display = profile?.display_name ?? null;
      }
      setUser(toPMUser(u, display));
      setReady(true);
    });

    return () => sub.subscription.unsubscribe();
  }, []);

  return {
    user,
    ready,
    logout: async () => {
      await supabase.auth.signOut();
      setUser(null);
      window.location.href = "/login";
    },
  };
}
