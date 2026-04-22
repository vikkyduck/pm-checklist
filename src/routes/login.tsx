import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { api, auth, isApiConfigured } from "@/lib/api";

export const Route = createFileRoute("/login")({
  component: LoginPage,
  head: () => ({
    meta: [{ title: "Вход · Чек-лист PM Авито" }],
  }),
});

function LoginPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (auth.getUser()) navigate({ to: "/" });
  }, [navigate]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      if (!isApiConfigured()) {
        // Демо-режим: без сервера сохраняем имя локально
        auth.setSession("demo-token", { email: email.trim(), name: name.trim() });
        navigate({ to: "/" });
        return;
      }
      await api.requestMagicLink(email.trim(), name.trim());
      setSent(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Ошибка");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden px-6 py-12">
      <div className="pointer-events-none absolute inset-0">
        <div
          className="absolute -top-40 left-1/4 h-[480px] w-[480px] rounded-full opacity-50 blur-3xl animate-float-slow"
          style={{ background: "var(--stage-0)" }}
        />
        <div
          className="absolute bottom-0 right-1/4 h-[480px] w-[480px] rounded-full opacity-40 blur-3xl animate-float-slow"
          style={{ background: "var(--stage-4)", animationDelay: "-6s" }}
        />
      </div>

      <div className="glass specular relative w-full max-w-md rounded-3xl p-8 animate-fade-up">
        <div className="mb-6 space-y-2">
          <div className="glass-pill inline-flex items-center gap-2 rounded-full px-3 py-1 text-[11px] font-medium tracking-wide text-foreground/80">
            <span className="h-1.5 w-1.5 rounded-full bg-accent shadow-[0_0_8px_var(--accent)]" />
            Вход для PM Авито
          </div>
          <h1 className="text-2xl font-semibold leading-tight text-foreground">
            Добро пожаловать в чек-лист
          </h1>
          <p className="text-sm leading-relaxed text-muted-foreground">
            Введите рабочий email — пришлём ссылку для входа. Прогресс сохранится за вами.
          </p>
        </div>

        {sent ? (
          <div className="space-y-4">
            <div
              className="rounded-2xl border border-white/10 bg-white/[0.04] p-4 text-sm leading-relaxed text-foreground/90"
            >
              <p className="font-medium">Письмо отправлено на <span className="text-foreground">{email}</span></p>
              <p className="mt-2 text-muted-foreground">
                Откройте почту и нажмите кнопку «Войти». Ссылка действует 15 минут.
              </p>
            </div>
            <button
              type="button"
              onClick={() => { setSent(false); setEmail(""); }}
              className="w-full rounded-xl px-4 py-2.5 text-sm text-muted-foreground transition-colors hover:bg-white/[0.04] hover:text-foreground"
            >
              Войти под другим email
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <Field
              label="Имя"
              type="text"
              value={name}
              onChange={setName}
              placeholder="Как к вам обращаться"
              autoComplete="name"
              required
            />
            <Field
              label="Email"
              type="email"
              value={email}
              onChange={setEmail}
              placeholder="name@avito.ru"
              autoComplete="email"
              required
            />
            {error && (
              <p className="rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-xs text-red-300">
                {error}
              </p>
            )}
            <button
              type="submit"
              disabled={loading || !email || !name}
              className="w-full rounded-xl bg-accent px-4 py-3 text-sm font-semibold text-[oklch(0.18_0.03_255)] shadow-[0_8px_24px_-8px_var(--accent)] transition-all hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {loading ? "Отправляем…" : isApiConfigured() ? "Получить ссылку на почту" : "Войти (демо-режим)"}
            </button>
            {!isApiConfigured() && (
              <p className="text-center text-[11px] leading-relaxed text-muted-foreground/70">
                Бэкенд ещё не подключён. Сейчас прогресс сохраняется только в этом браузере.
              </p>
            )}
          </form>
        )}
      </div>
    </main>
  );
}

function Field({
  label, type, value, onChange, placeholder, autoComplete, required,
}: {
  label: string;
  type: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  autoComplete?: string;
  required?: boolean;
}) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
        {label}
      </span>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        autoComplete={autoComplete}
        required={required}
        className="w-full rounded-xl border border-white/10 bg-white/[0.04] px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground/60 transition-colors focus:border-white/20 focus:bg-white/[0.06] focus:outline-none"
      />
    </label>
  );
}
