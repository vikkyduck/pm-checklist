import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { api, auth } from "@/lib/api";

export const Route = createFileRoute("/auth/callback")({
  component: CallbackPage,
  validateSearch: (search: Record<string, unknown>) => ({
    token: typeof search.token === "string" ? search.token : "",
  }),
  head: () => ({ meta: [{ title: "Входим… · PM Чек-лист" }] }),
});

function CallbackPage() {
  const { token } = Route.useSearch();
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!token) { setError("В ссылке нет токена"); return; }
    let cancelled = false;
    (async () => {
      try {
        const { token: jwt, user } = await api.verifyToken(token);
        if (cancelled) return;
        auth.setSession(jwt, user);
        navigate({ to: "/", replace: true });
      } catch (e) {
        if (!cancelled) setError(e instanceof Error ? e.message : "Ошибка входа");
      }
    })();
    return () => { cancelled = true; };
  }, [token, navigate]);

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
