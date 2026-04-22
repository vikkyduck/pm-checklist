import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState, useEffect, useRef } from "react";
import { ROADMAP, META, type Stage, type Item } from "@/lib/pm-roadmap";

export const Route = createFileRoute("/")({
  component: MindMapPage,
  head: () => ({
    meta: [
      { title: "PM Roadmap · Liquid Glass Mind Map" },
      {
        name: "description",
        content:
          "Интерактивная инфографическая карта чек-листа Project Manager в эстетике liquid glass.",
      },
    ],
  }),
});

function MindMapPage() {
  const [activeStage, setActiveStage] = useState<string>(ROADMAP[0].id);
  const [openCategory, setOpenCategory] = useState<string | null>(null);
  const [query, setQuery] = useState("");

  const stage = useMemo(
    () => ROADMAP.find((s) => s.id === activeStage) ?? ROADMAP[0],
    [activeStage],
  );

  const totalItems = useMemo(
    () =>
      ROADMAP.reduce(
        (sum, s) =>
          sum + s.categories.reduce((cs, c) => cs + c.items.length, 0),
        0,
      ),
    [],
  );

  const filteredCategories = useMemo(() => {
    if (!query.trim()) return stage.categories;
    const q = query.toLowerCase();
    return stage.categories
      .map((c) => ({
        ...c,
        items: c.items.filter(
          (i) =>
            i.title.toLowerCase().includes(q) ||
            i.detail.toLowerCase().includes(q) ||
            c.title.toLowerCase().includes(q),
        ),
      }))
      .filter((c) => c.items.length > 0);
  }, [stage, query]);

  // Reset open category on stage change
  useEffect(() => {
    setOpenCategory(null);
  }, [activeStage]);

  // Cursor-following ambient light
  const ambientRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const onMove = (e: MouseEvent) => {
      if (!ambientRef.current) return;
      ambientRef.current.style.setProperty("--mx", `${e.clientX}px`);
      ambientRef.current.style.setProperty("--my", `${e.clientY}px`);
    };
    window.addEventListener("mousemove", onMove);
    return () => window.removeEventListener("mousemove", onMove);
  }, []);

  return (
    <main className="relative min-h-screen overflow-hidden">
      {/* Aurora blobs */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div
          className="absolute -top-40 -left-40 h-[480px] w-[480px] rounded-full blur-3xl opacity-50 animate-float-slow"
          style={{ background: "var(--stage-0)" }}
        />
        <div
          className="absolute top-1/3 -right-32 h-[520px] w-[520px] rounded-full blur-3xl opacity-40 animate-float-slow"
          style={{ background: "var(--stage-3)", animationDelay: "-4s" }}
        />
        <div
          className="absolute bottom-0 left-1/3 h-[460px] w-[460px] rounded-full blur-3xl opacity-40 animate-float-slow"
          style={{ background: "var(--stage-4)", animationDelay: "-8s" }}
        />
      </div>

      {/* Cursor ambient */}
      <div
        ref={ambientRef}
        className="pointer-events-none fixed inset-0 z-0"
        style={{
          background:
            "radial-gradient(600px circle at var(--mx, 50%) var(--my, 50%), oklch(1 0 0 / 0.06), transparent 50%)",
        }}
      />

      <div className="relative z-10 mx-auto max-w-7xl px-6 py-10 lg:px-10 lg:py-14">
        {/* Header */}
        <header className="mb-8 flex flex-col gap-6 lg:mb-12 lg:flex-row lg:items-end lg:justify-between">
          <div className="space-y-3">
            <div className="glass-pill inline-flex items-center gap-2 rounded-full px-3.5 py-1.5 text-xs font-medium tracking-wide text-foreground/80">
              <span className="h-1.5 w-1.5 rounded-full bg-accent shadow-[0_0_8px_var(--accent)]" />
              {META.subtitle}
            </div>
            <h1 className="text-balance text-4xl font-semibold leading-[1.05] tracking-tight text-foreground sm:text-5xl lg:text-6xl">
              {META.title}
              <span className="block bg-gradient-to-r from-[var(--stage-3)] via-[var(--stage-4)] to-[var(--stage-5)] bg-clip-text text-transparent">
                от первого дня до закрытия
              </span>
            </h1>
            <p className="max-w-xl text-base leading-relaxed text-muted-foreground">
              {META.description}
            </p>
            <p className="max-w-xl text-xs text-muted-foreground/80">
              Шесть этапов · {ROADMAP.reduce((s, x) => s + x.categories.length, 0)}{" "}
              блоков · {totalItems} конкретных шагов
            </p>
          </div>

          {/* Search */}
          <div className="glass relative w-full max-w-sm rounded-2xl px-4 py-2.5">
            <div className="flex items-center gap-3">
              <SearchIcon />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Поиск по чек-листу…"
                className="w-full bg-transparent text-sm text-foreground placeholder:text-muted-foreground/70 focus:outline-none"
              />
              {query && (
                <button
                  onClick={() => setQuery("")}
                  className="text-xs text-muted-foreground hover:text-foreground"
                  aria-label="Очистить"
                >
                  ⌫
                </button>
              )}
            </div>
          </div>
        </header>

        {/* Stage rail */}
        <StageRail
          activeStage={activeStage}
          onSelect={setActiveStage}
        />

        {/* Detail */}
        <section className="mt-10 grid gap-6 lg:mt-14 lg:grid-cols-12">
          {/* Stage summary */}
          <aside className="lg:col-span-4">
            <StageSummary stage={stage} />
          </aside>

          {/* Categories */}
          <div className="lg:col-span-8">
            <div className="grid gap-4 sm:grid-cols-2">
              {filteredCategories.map((cat, idx) => {
                const key = `${stage.id}-${cat.title}`;
                const isOpen = openCategory === key;
                return (
                  <CategoryCard
                    key={key}
                    stage={stage}
                    title={cat.title}
                    intro={cat.intro}
                    items={cat.items}
                    open={isOpen}
                    onToggle={() => setOpenCategory(isOpen ? null : key)}
                    index={idx}
                  />
                );
              })}
              {filteredCategories.length === 0 && (
                <div className="glass col-span-full rounded-2xl p-8 text-center text-muted-foreground">
                  Ничего не найдено по запросу «{query}»
                </div>
              )}
            </div>
          </div>
        </section>

        {/* How to use */}
        <section className="mt-10">
          <div className="glass rounded-3xl p-6 lg:p-8">
            <div className="mb-4 flex items-center gap-2">
              <span className="h-1.5 w-1.5 rounded-full bg-accent shadow-[0_0_8px_var(--accent)]" />
              <h2 className="text-sm font-medium uppercase tracking-wider text-foreground/80">
                Как пользоваться
              </h2>
            </div>
            <ul className="grid gap-3 sm:grid-cols-3">
              {META.usage.map((u, i) => (
                <li
                  key={i}
                  className="glass-soft rounded-2xl p-4 text-sm leading-relaxed text-foreground/85"
                >
                  <span className="mb-2 block text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  {u}
                </li>
              ))}
            </ul>
          </div>
        </section>

        {/* Footer */}
        <footer className="mt-16 flex flex-col items-center gap-2 text-center text-xs text-muted-foreground/70">
          <div className="glass-pill rounded-full px-3 py-1">
            Liquid Glass · 2026
          </div>
          <p>Designed with the restraint Steve & Jony would approve.</p>
        </footer>
      </div>
    </main>
  );
}

/* ─────────────────────────────────────── Stage Rail */

function StageRail({
  activeStage,
  onSelect,
}: {
  activeStage: string;
  onSelect: (id: string) => void;
}) {
  return (
    <div className="glass relative rounded-3xl p-3 sm:p-4">
      <div className="flex gap-2 overflow-x-auto sm:gap-3">
        {ROADMAP.map((s) => {
          const active = s.id === activeStage;
          return (
            <button
              key={s.id}
              onClick={() => onSelect(s.id)}
              className={[
                "group relative flex-1 min-w-[180px] rounded-2xl px-4 py-4 text-left transition-all duration-500",
                active
                  ? "bg-white/10 shadow-[0_8px_24px_-8px_rgba(0,0,0,0.5)] scale-[1.02]"
                  : "hover:bg-white/5",
              ].join(" ")}
              style={
                {
                  "--stage-color": `var(--${s.color})`,
                } as React.CSSProperties
              }
            >
              {active && (
                <span
                  className="absolute inset-0 rounded-2xl opacity-30"
                  style={{
                    background: `linear-gradient(135deg, var(--${s.color}) 0%, transparent 60%)`,
                  }}
                />
              )}
              <div className="relative flex items-center gap-3">
                <span
                  className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-sm font-semibold"
                  style={{
                    background: `var(--${s.color})`,
                    color: "oklch(0.18 0.03 255)",
                    boxShadow: `0 4px 16px -4px var(--${s.color})`,
                  }}
                >
                  {s.index}
                </span>
                <div className="min-w-0">
                  <div className="text-[11px] uppercase tracking-wider text-muted-foreground">
                    Этап {s.index}
                  </div>
                  <div className="truncate text-sm font-medium text-foreground">
                    {s.title}
                  </div>
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}

/* ─────────────────────────────────────── Stage Summary */

function StageSummary({ stage }: { stage: Stage }) {
  const itemCount = stage.categories.reduce((s, c) => s + c.items.length, 0);
  return (
    <div
      className="glass specular relative overflow-hidden rounded-3xl p-7 animate-fade-up"
      style={{ "--stage-color": `var(--${stage.color})` } as React.CSSProperties}
      key={stage.id}
    >
      {/* Stage chromatic wash */}
      <div
        className="pointer-events-none absolute -right-20 -top-20 h-64 w-64 rounded-full blur-3xl opacity-40"
        style={{ background: `var(--${stage.color})` }}
      />

      <div className="relative space-y-5">
        <div className="flex items-center gap-3">
          <span
            className="flex h-12 w-12 items-center justify-center rounded-2xl text-lg font-semibold"
            style={{
              background: `var(--${stage.color})`,
              color: "oklch(0.18 0.03 255)",
              boxShadow: `0 8px 24px -8px var(--${stage.color})`,
            }}
          >
            {stage.index}
          </span>
          <div className="text-[11px] uppercase tracking-wider text-muted-foreground">
            Этап {stage.index} · {stage.categories.length} блоков · {itemCount} шагов
          </div>
        </div>

        <h2 className="text-2xl font-semibold leading-tight text-foreground">
          {stage.title}
        </h2>

        <p className="text-sm leading-relaxed text-muted-foreground">
          {stage.subtitle}
        </p>

        {stage.intro && (
          <details className="group rounded-2xl border border-white/10 bg-white/[0.03] p-3 text-xs leading-relaxed text-muted-foreground transition-colors hover:bg-white/[0.05]">
            <summary className="cursor-pointer list-none text-[11px] font-medium uppercase tracking-wider text-foreground/80">
              <span className="inline-flex items-center gap-1.5">
                Контекст этапа
                <span className="opacity-50 transition-transform group-open:rotate-180">▾</span>
              </span>
            </summary>
            <p className="mt-2 text-xs leading-relaxed text-muted-foreground">
              {stage.intro}
            </p>
          </details>
        )}

        <div className="grid gap-2 pt-2">
          {stage.categories.map((c) => (
            <div
              key={c.title}
              className="glass-soft flex items-center justify-between rounded-xl px-3.5 py-2.5"
            >
              <span className="text-sm text-foreground/90">{c.title}</span>
              <span
                className="rounded-full px-2 py-0.5 text-[10px] font-medium"
                style={{
                  background: `oklch(from var(--${stage.color}) l c h / 0.2)`,
                  color: `var(--${stage.color})`,
                }}
              >
                {c.items.length}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────── Category Card */

function CategoryCard({
  stage,
  title,
  items,
  open,
  onToggle,
  index,
}: {
  stage: Stage;
  title: string;
  items: string[];
  open: boolean;
  onToggle: () => void;
  index: number;
}) {
  return (
    <div
      className={[
        "glass specular relative overflow-hidden rounded-2xl transition-all duration-500 animate-fade-up",
        open ? "sm:col-span-2" : "",
      ].join(" ")}
      style={
        {
          "--stage-color": `var(--${stage.color})`,
          animationDelay: `${index * 60}ms`,
        } as React.CSSProperties
      }
    >
      <button
        onClick={onToggle}
        className="relative flex w-full items-center justify-between gap-3 px-5 py-4 text-left"
      >
        <div className="flex items-center gap-3">
          <span
            className="h-2 w-2 rounded-full"
            style={{
              background: `var(--${stage.color})`,
              boxShadow: `0 0 12px var(--${stage.color})`,
            }}
          />
          <h3 className="text-base font-medium text-foreground">{title}</h3>
        </div>
        <div className="flex items-center gap-2">
          <span
            className="rounded-full px-2 py-0.5 text-[10px] font-medium text-muted-foreground"
            style={{
              background: "oklch(1 0 0 / 0.08)",
            }}
          >
            {items.length}
          </span>
          <Chevron open={open} />
        </div>
      </button>

      <div
        className="grid transition-[grid-template-rows] duration-500 ease-out"
        style={{ gridTemplateRows: open ? "1fr" : "0fr" }}
      >
        <div className="overflow-hidden">
          <div className="border-t border-white/10 px-5 py-4">
            <ul className="space-y-2.5">
              {items.map((item, i) => (
                <li
                  key={i}
                  className="group flex items-start gap-3 rounded-lg px-2 py-1.5 text-sm text-foreground/90 transition-colors hover:bg-white/5"
                >
                  <span
                    className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full"
                    style={{
                      background: `var(--${stage.color})`,
                      opacity: 0.7,
                    }}
                  />
                  <span className="leading-relaxed">{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────── Icons */

function Chevron({ open }: { open: boolean }) {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={`text-muted-foreground transition-transform duration-300 ${
        open ? "rotate-180" : ""
      }`}
      aria-hidden
    >
      <path d="m6 9 6 6 6-6" />
    </svg>
  );
}

function SearchIcon() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="shrink-0 text-muted-foreground"
      aria-hidden
    >
      <circle cx="11" cy="11" r="8" />
      <path d="m21 21-4.3-4.3" />
    </svg>
  );
}
