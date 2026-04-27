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

    async function persistDisplayName(userId: string, meta: Record<string, unknown>) {
      const displayName =
        (typeof meta?.display_name === "string" && meta.display_name) ||
        (typeof meta?.name === "string" && meta.name) ||
        null;
      if (displayName) {
        await supabase
          .from("profiles")
          .update({ display_name: displayName })
          .eq("id", userId);
      }
    }

    async function finish() {
      const url = new URL(window.location.href);
      const code = url.searchParams.get("code");
      const errorParam = url.searchParams.get("error_description") || url.searchParams.get("error");

      if (errorParam) {
        setError(decodeURIComponent(errorParam));
        return;
      }

      // PKCE flow: explicitly exchange the ?code=... param for a session
      // and let supabase-js persist it to localStorage.
      if (code) {
        const { data, error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);
        if (cancelled) return;
        if (exchangeError) {
          setError(exchangeError.message);
          return;
        }
        if (data.session) {
          await persistDisplayName(
            data.session.user.id,
            (data.session.user.user_metadata ?? {}) as Record<string, unknown>,
          );
          // clean ?code= from the URL before navigating
          window.history.replaceState({}, "", "/auth/callback");
          navigate({ to: "/", replace: true });
          return;
        }
      }

      // Implicit / hash flow fallback (#access_token=...): supabase-js
      // auto-detects the session from the URL hash on init.
      const { data, error: sessionError } = await supabase.auth.getSession();
      if (cancelled) return;
      if (sessionError) {
        setError(sessionError.message);
        return;
      }
      if (data.session) {
        await persistDisplayName(
          data.session.user.id,
          (data.session.user.user_metadata ?? {}) as Record<string, unknown>,
        );
        navigate({ to: "/", replace: true });
        return;
      }

      // Wait briefly for onAuthStateChange in case session is materialising
      const { data: sub } = supabase.auth.onAuthStateChange((_e, session) => {
        if (session) {
          sub.subscription.unsubscribe();
          navigate({ to: "/", replace: true });
        }
      });
      const timeout = window.setTimeout(() => {
        if (!cancelled) {
          sub.subscription.unsubscribe();
          setError(
            "Не удалось восстановить сессию. Возможно, ссылка уже использована или истекла. Запросите новую.",
          );
        }
      }, 6000);

      return () => {
        sub.subscription.unsubscribe();
        window.clearTimeout(timeout);
      };
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
