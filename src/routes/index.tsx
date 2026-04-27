import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState, useEffect } from "react";
import { Download } from "lucide-react";
import { ROADMAP, META, type Stage, type Item } from "@/lib/pm-roadmap";
import { useChecklistProgress, itemId } from "@/hooks/use-checklist-progress";
import { printChecklist } from "@/lib/print-checklist";

export const Route = createFileRoute("/")({
  component: MindMapPage,
  head: () => ({
    meta: [
      { title: "Митигирование рисков · Practice" },
      {
        name: "description",
        content:
          "Чек-лист руководителя проекта от первого дня до закрытия. Шесть этапов, конкретные шаги, прогресс — всё в одном спокойном пространстве.",
      },
    ],
  }),
});

function MindMapPage() {
  const { progress, toggle } = useChecklistProgress();

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

  function handleDownload() {
    printChecklist({
      title: META.title,
      subtitle: META.subtitle,
      description: META.description,
      usage: META.usage,
      sections: ROADMAP.map((s) => ({
        number: `Этап ${s.index}`,
        title: s.title,
        subtitle: s.subtitle,
        intro: s.intro,
        accentColor: cssVar(`--${s.color}`),
        groups: s.categories.map((c) => ({
          title: c.title,
          intro: c.intro,
          items: c.items.map((it) => ({
            title: it.title,
            detail: it.detail,
          })),
        })),
      })),
    });
  }

  return (
    <main className="relative min-h-screen">
      <div className="relative z-10 mx-auto max-w-6xl px-4 py-10 sm:px-6 sm:py-14 lg:px-10 lg:py-20">

        {/* Header */}
        <header className="mb-10 sm:mb-14 lg:mb-20">
          <div className="pl-12 sm:pl-14 lg:pl-0">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="eyebrow">{META.subtitle}</div>
              <button
                type="button"
                onClick={handleDownload}
                className="inline-flex items-center gap-1.5 rounded-full border border-[var(--hairline)] bg-[var(--surface)] px-3 py-1.5 text-[11px] font-medium text-foreground/80 transition-colors hover:border-[var(--hairline-strong)] hover:bg-[var(--surface-strong)] hover:text-foreground"
                title="Открыть для печати или сохранения в PDF"
              >
                <DownloadIcon />
                Скачать чек-лист
              </button>
            </div>
            <h1 className="mt-5 text-balance text-[2rem] font-semibold leading-[1.04] tracking-[-0.025em] text-foreground sm:text-5xl md:text-6xl lg:text-[5rem]">
              {META.title}
            </h1>
            <p className="mt-3 text-base leading-snug text-muted-foreground sm:text-lg lg:text-xl">
              от первого дня до закрытия проекта
            </p>
            <p className="mt-6 max-w-xl text-sm leading-relaxed text-foreground/75 sm:text-base">
              {META.description}
            </p>
          </div>

          {/* Meta strip — quiet stats + search, single row on desktop */}
          <div className="mt-8 grid gap-3 sm:mt-10 sm:grid-cols-[1fr_auto] sm:items-center sm:gap-6">
            <dl className="grid grid-cols-3 divide-x divide-[var(--hairline)] text-left">
              <Stat value="6" label="этапов" />
              <Stat
                value={ROADMAP.reduce((s, x) => s + x.categories.length, 0)}
                label="блоков"
                offset
              />
              <Stat value={totalItems} label="шагов" offset />
            </dl>

            {/* Search */}
            <div className="surface-strong relative flex h-11 items-center gap-3 rounded-full px-4 sm:w-72">
              <SearchIcon />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Поиск по чек-листу"
                className="w-full bg-transparent text-sm text-foreground placeholder:text-muted-foreground focus:outline-none"
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
          progress={progress}
        />

        {/* Detail */}
        <section className="mt-10 grid gap-8 sm:mt-14 lg:mt-20 lg:grid-cols-12 lg:gap-12">
          {/* Stage summary */}
          <aside className="lg:col-span-4">
            <StageSummary stage={stage} progress={progress} />
          </aside>

          {/* Categories */}
          <div className="lg:col-span-8">
            <div className="grid gap-2.5 sm:gap-3 sm:grid-cols-2">
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
                    progress={progress}
                    onItemToggle={toggle}
                  />
                );
              })}
              {filteredCategories.length === 0 && (
                <div className="surface col-span-full rounded-2xl p-8 text-center text-sm text-muted-foreground">
                  Ничего не найдено по запросу «{query}»
                </div>
              )}
            </div>
          </div>
        </section>

        {/* How to use */}
        <section className="mt-12 sm:mt-16 lg:mt-20">
          <div className="hairline mb-8" />
          <div className="eyebrow mb-5">Как пользоваться</div>
          <ol className="grid gap-x-10 gap-y-6 sm:grid-cols-3">
            {META.usage.map((u, i) => (
              <li key={i} className="flex gap-4">
                <span className="text-sm font-medium tabular-nums text-muted-foreground">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <p className="text-sm leading-relaxed text-foreground/85">{u}</p>
              </li>
            ))}
          </ol>
        </section>

        {/* Footer */}
        <footer className="mt-16 sm:mt-24">
          <div className="hairline mb-6" />
          <div className="flex flex-col items-start justify-between gap-2 text-xs text-muted-foreground sm:flex-row sm:items-center">
            <span className="font-medium tracking-tight text-foreground">Practice</span>
            <span>навигатор PM · 2026</span>
          </div>
        </footer>
      </div>
    </main>
  );
}

/* ─────────────────────────────────────── Stat */

function Stat({ value, label, offset }: { value: number | string; label: string; offset?: boolean }) {
  return (
    <div className={offset ? "pl-4 sm:pl-6" : ""}>
      <div className="text-2xl font-semibold tabular-nums tracking-tight text-foreground sm:text-3xl">
        {value}
      </div>
      <div className="eyebrow mt-1">{label}</div>
    </div>
  );
}

/* ─────────────────────────────────────── Stage Rail */

function StageRail({
  activeStage,
  onSelect,
  progress,
}: {
  activeStage: string;
  onSelect: (id: string) => void;
  progress: Record<string, boolean>;
}) {
  return (
    <div className="-mx-4 flex gap-1.5 overflow-x-auto px-4 sm:mx-0 sm:gap-2 sm:px-0">
      {ROADMAP.map((s) => {
        const active = s.id === activeStage;
        const total = s.categories.reduce((sum, c) => sum + c.items.length, 0);
        const done = s.categories.reduce(
          (sum, c) =>
            sum +
            c.items.filter((_, i) => progress[itemId(s.id, c.title, i)]).length,
          0,
        );
        const pct = total ? done / total : 0;
        return (
          <button
            key={s.id}
            onClick={() => onSelect(s.id)}
            className={[
              "group relative min-w-[150px] flex-1 rounded-2xl border px-3.5 py-3 text-left transition-all duration-300 sm:min-w-[170px] sm:px-4 sm:py-3.5",
              active
                ? "border-[var(--hairline-strong)] bg-[var(--surface-strong)]"
                : "border-[var(--hairline)] bg-[var(--surface)] hover:border-[var(--hairline-strong)]",
            ].join(" ")}
          >
            <div className="flex items-center gap-3">
              <span
                className={[
                  "flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-[11px] font-semibold tabular-nums tracking-tight transition-colors",
                  active ? "text-background" : "text-foreground/80",
                ].join(" ")}
                style={
                  active
                    ? {
                        background: `var(--${s.color})`,
                      }
                    : {
                        background: "var(--surface-strong)",
                        border: "1px solid var(--hairline-strong)",
                      }
                }
              >
                {s.index}
              </span>
              <div className="min-w-0 flex-1">
                <div className="truncate text-[13px] font-medium leading-tight text-foreground">
                  {s.title}
                </div>
                <div className="mt-1 flex items-center gap-2">
                  <div className="h-[2px] flex-1 overflow-hidden rounded-full bg-[var(--hairline)]">
                    <div
                      className="h-full rounded-full transition-all duration-500"
                      style={{
                        width: `${Math.round(pct * 100)}%`,
                        background: active
                          ? `var(--${s.color})`
                          : "var(--hairline-strong)",
                      }}
                    />
                  </div>
                  <span className="shrink-0 text-[10px] tabular-nums text-muted-foreground">
                    {done}/{total}
                  </span>
                </div>
              </div>
            </div>
          </button>
        );
      })}
    </div>
  );
}

/* ─────────────────────────────────────── Stage Summary */

function StageSummary({ stage, progress }: { stage: Stage; progress: Record<string, boolean> }) {
  const itemCount = stage.categories.reduce((s, c) => s + c.items.length, 0);
  const doneCount = stage.categories.reduce(
    (s, c) => s + c.items.filter((_, i) => progress[itemId(stage.id, c.title, i)]).length,
    0,
  );
  const pct = itemCount ? Math.round((doneCount / itemCount) * 100) : 0;
  return (
    <div
      className="animate-fade-up sticky top-6 space-y-7"
      key={stage.id}
    >
      <div>
        <div className="eyebrow mb-3">
          Этап {stage.index} · {doneCount}/{itemCount}
        </div>
        <h2 className="text-balance text-2xl font-semibold leading-[1.1] tracking-tight text-foreground sm:text-3xl">
          {stage.title}
        </h2>
        <p className="mt-3 text-sm leading-relaxed text-muted-foreground sm:text-base">
          {stage.subtitle}
        </p>
      </div>

      {/* Progress — single hairline bar */}
      <div>
        <div className="mb-2 flex items-baseline justify-between">
          <span className="eyebrow">Прогресс</span>
          <span
            className="text-sm font-medium tabular-nums"
            style={{ color: `var(--${stage.color})` }}
          >
            {pct}%
          </span>
        </div>
        <div className="h-px w-full overflow-hidden bg-[var(--hairline)]">
          <div
            className="h-full transition-all duration-700 ease-out"
            style={{
              width: `${pct}%`,
              background: `var(--${stage.color})`,
            }}
          />
        </div>
      </div>

      {stage.intro && (
        <details className="group">
          <summary className="cursor-pointer list-none">
            <span className="inline-flex items-center gap-1.5 text-xs font-medium text-foreground/80 transition-colors hover:text-foreground">
              Контекст этапа
              <span className="opacity-50 transition-transform group-open:rotate-180">
                ▾
              </span>
            </span>
          </summary>
          <p className="mt-3 text-xs leading-relaxed text-muted-foreground">
            {stage.intro}
          </p>
        </details>
      )}

      {/* Category list — quiet rows */}
      <div>
        <div className="eyebrow mb-3">Блоки этапа</div>
        <ul className="divide-y divide-[var(--hairline)] border-y border-[var(--hairline)]">
          {stage.categories.map((c) => {
            const done = c.items.filter(
              (_, i) => progress[itemId(stage.id, c.title, i)],
            ).length;
            const complete = done === c.items.length && c.items.length > 0;
            return (
              <li
                key={c.title}
                className="flex items-center justify-between gap-3 py-2.5"
              >
                <span className="text-sm text-foreground/90">{c.title}</span>
                <span
                  className="text-xs tabular-nums"
                  style={{
                    color: complete
                      ? `var(--${stage.color})`
                      : "var(--muted-foreground)",
                  }}
                >
                  {done}/{c.items.length}
                </span>
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────── Category Card */

function CategoryCard({
  stage,
  title,
  intro,
  items,
  open,
  onToggle,
  index,
  progress,
  onItemToggle,
}: {
  stage: Stage;
  title: string;
  intro?: string;
  items: Item[];
  open: boolean;
  onToggle: () => void;
  index: number;
  progress: Record<string, boolean>;
  onItemToggle: (id: string) => void;
}) {
  const doneCount = items.filter(
    (_, i) => progress[itemId(stage.id, title, i)],
  ).length;
  const complete = doneCount === items.length && items.length > 0;
  return (
    <div
      className={[
        "surface relative overflow-hidden rounded-2xl transition-all duration-300 animate-fade-up",
        open ? "sm:col-span-2" : "",
      ].join(" ")}
      style={{ animationDelay: `${index * 60}ms` }}
    >
      <button
        onClick={onToggle}
        className="relative flex w-full items-center justify-between gap-3 px-4 py-3.5 text-left transition-colors hover:bg-[var(--surface-strong)] sm:px-5 sm:py-4"
      >
        <div className="flex min-w-0 items-center gap-3">
          <span
            className="h-1.5 w-1.5 shrink-0 rounded-full transition-opacity"
            style={{
              background: `var(--${stage.color})`,
              opacity: complete ? 1 : 0.6,
            }}
          />
          <h3 className="truncate text-[15px] font-medium leading-snug text-foreground">
            {title}
          </h3>
        </div>
        <div className="flex shrink-0 items-center gap-3">
          <span
            className="text-xs tabular-nums"
            style={{
              color: complete
                ? `var(--${stage.color})`
                : "var(--muted-foreground)",
            }}
          >
            {doneCount}/{items.length}
          </span>
          <Chevron open={open} />
        </div>
      </button>

      <div
        className="grid transition-[grid-template-rows] duration-400 ease-out"
        style={{ gridTemplateRows: open ? "1fr" : "0fr" }}
      >
        <div className="overflow-hidden">
          <div className="border-t border-[var(--hairline)] px-4 py-4 sm:px-5 sm:py-5">
            {intro && (
              <p className="mb-4 text-sm leading-relaxed text-muted-foreground">
                {intro}
              </p>
            )}
            <ul className="-mx-2 space-y-0.5">
              {items.map((item, i) => {
                const id = itemId(stage.id, title, i);
                const checked = !!progress[id];
                return (
                  <li key={i}>
                    <button
                      type="button"
                      onClick={() => onItemToggle(id)}
                      className="group flex w-full items-start gap-3 rounded-lg px-2 py-2 text-left transition-colors hover:bg-[var(--surface-strong)]"
                    >
                      <span
                        className="mt-[3px] flex h-[18px] w-[18px] shrink-0 items-center justify-center rounded-md border transition-all duration-200"
                        style={
                          checked
                            ? {
                                borderColor: `var(--${stage.color})`,
                                background: `var(--${stage.color})`,
                              }
                            : {
                                borderColor: "var(--hairline-strong)",
                                background: "transparent",
                              }
                        }
                        aria-hidden
                      >
                        {checked && (
                          <svg
                            width="11"
                            height="11"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="oklch(0.16 0.012 255)"
                            strokeWidth="3.5"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          >
                            <path d="M20 6 9 17l-5-5" />
                          </svg>
                        )}
                      </span>
                      <div className="space-y-1">
                        <p
                          className={[
                            "text-[14px] font-medium leading-snug transition-colors",
                            checked
                              ? "text-muted-foreground line-through decoration-muted-foreground/40"
                              : "text-foreground",
                          ].join(" ")}
                        >
                          {item.title}
                        </p>
                        <p className="text-xs leading-relaxed text-muted-foreground">
                          {item.detail}
                        </p>
                      </div>
                    </button>
                  </li>
                );
              })}
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

function DownloadIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      width="13"
      height="13"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <path d="M12 3v12" />
      <path d="m7 10 5 5 5-5" />
      <path d="M5 21h14" />
    </svg>
  );
}

/** Резолвит CSS-переменную из :root в актуальный цвет (для встраивания в печатный HTML) */
function cssVar(name: string): string {
  if (typeof window === "undefined") return "#111827";
  const v = getComputedStyle(document.documentElement)
    .getPropertyValue(name)
    .trim();
  return v || "#111827";
}
