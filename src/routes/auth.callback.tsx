import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/auth/callback")({
  component: CallbackPage,
  head: () => ({ meta: [{ title: "Входим… · PM Чек-лист" }] }),
});

function CallbackPage() {
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function finish() {
      // Supabase auto-detects session from URL hash/query (detectSessionInUrl).
      // We just wait for the session to materialise.
      const { data, error } = await supabase.auth.getSession();
      if (cancelled) return;
      if (error) {
        setError(error.message);
        return;
      }
      if (data.session) {
        // Make sure profile.display_name reflects the name from login form.
        const meta = data.session.user.user_metadata as Record<string, unknown>;
        const displayName =
          (typeof meta?.display_name === "string" && meta.display_name) ||
          (typeof meta?.name === "string" && meta.name) ||
          null;
        if (displayName) {
          await supabase
            .from("profiles")
            .update({ display_name: displayName })
            .eq("id", data.session.user.id);
        }
        navigate({ to: "/", replace: true });
        return;
      }

      // If session not ready yet, listen briefly.
      const { data: sub } = supabase.auth.onAuthStateChange((_e, session) => {
        if (session) {
          sub.subscription.unsubscribe();
          navigate({ to: "/", replace: true });
        }
      });
      // Timeout fallback
      setTimeout(() => {
        if (!cancelled) {
          sub.subscription.unsubscribe();
          setError("Не удалось войти. Запросите ссылку ещё раз.");
        }
      }, 5000);
    }

    finish();
    return () => {
      cancelled = true;
    };
  }, [navigate]);

  return (
    <main className="relative flex min-h-screen items-center justify-center px-6">
      <div className="glass specular w-full max-w-sm rounded-3xl p-8 text-center animate-fade-up">
        {error ? (
          <>
            <h1 className="text-lg font-semibold text-foreground">Не удалось войти</h1>
            <p className="mt-2 text-sm text-muted-foreground">{error}</p>
            <button
              onClick={() => navigate({ to: "/login" })}
              className="mt-6 rounded-xl bg-accent px-4 py-2.5 text-sm font-semibold text-[oklch(0.18_0.03_255)] shadow-[0_8px_24px_-8px_var(--accent)] hover:brightness-110"
            >
              Запросить новую ссылку
            </button>
          </>
        ) : (
          <>
            <div className="mx-auto h-8 w-8 animate-spin rounded-full border-2 border-white/20 border-t-accent" />
            <p className="mt-4 text-sm text-muted-foreground">Входим в чек-лист…</p>
          </>
        )}
      </div>
    </main>
  );
}
