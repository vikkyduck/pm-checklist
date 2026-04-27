import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  BarChart3,
  Battery,
  BellRing,
  ChevronDown,
  ChevronRight,
  Download,
  RotateCcw,
  Sparkles,
  TriangleAlert,
} from "lucide-react";
import {
  ARCHETYPES,
  BLOCKS,
  TOTAL_CRITERIA,
  type BlockId,
} from "@/lib/resource-radar";
import { ResourceRadarChart } from "@/components/resource-radar-chart";
import { printRadar } from "@/lib/print-radar";

export const Route = createFileRoute("/resource-radar")({
  component: ResourceRadarPage,
  head: () => ({
    meta: [
      { title: "Радар ресурсности · Practice" },
      {
        name: "description",
        content:
          "Тонус-менеджмент: интерактивный опрос на 36 утверждений, который покажет ваш архетип восстановления и карту источников энергии.",
      },
      {
        property: "og:title",
        content: "Радар ресурсности · Practice",
      },
      {
        property: "og:description",
        content:
          "Карта ваших источников энергии и архетип восстановления — за 5 минут.",
      },
    ],
  }),
});

const STORAGE_KEY = "resource_radar_v1";

type CheckedState = Record<BlockId, boolean[]>;

function emptyChecked(): CheckedState {
  return BLOCKS.reduce<CheckedState>((acc, b) => {
    acc[b.id] = new Array(b.criteria.length).fill(false);
    return acc;
  }, {} as CheckedState);
}

function readChecked(): CheckedState {
  if (typeof window === "undefined") return emptyChecked();
  try {
    const raw = JSON.parse(localStorage.getItem(STORAGE_KEY) || "null");
    if (!raw || typeof raw !== "object") return emptyChecked();
    const base = emptyChecked();
    for (const b of BLOCKS) {
      const arr = raw[b.id];
      if (Array.isArray(arr) && arr.length === b.criteria.length) {
        base[b.id] = arr.map(Boolean);
      }
    }
    return base;
  } catch {
    return emptyChecked();
  }
}

function ResourceRadarPage() {
  const [checked, setChecked] = useState<CheckedState>(() => emptyChecked());
  const [hydrated, setHydrated] = useState(false);
  const [openBlocks, setOpenBlocks] = useState<Record<string, boolean>>({});
  const [view, setView] = useState<"form" | "results">("form");
  const [showMobileRadar, setShowMobileRadar] = useState(true);
  const [resetConfirm, setResetConfirm] = useState(false);

  // Hydrate from localStorage on client
  useEffect(() => {
    setChecked(readChecked());
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(checked));
    } catch {
      /* ignore */
    }
  }, [checked, hydrated]);

  const scores = useMemo(() => {
    const out = {} as Record<BlockId, number>;
    for (const b of BLOCKS) {
      const arr = checked[b.id];
      const c = arr.filter(Boolean).length;
      out[b.id] = Math.round((c / b.criteria.length) * 10);
    }
    return out;
  }, [checked]);

  const blockStats = useMemo(
    () =>
      BLOCKS.map((b) => {
        const c = checked[b.id].filter(Boolean).length;
        const total = b.criteria.length;
        return {
          id: b.id,
          label: b.label,
          shortLabel: b.shortLabel,
          stageVar: b.stageVar,
          checked: c,
          total,
          pct: total > 0 ? Math.round((c / total) * 100) : 0,
        };
      }),
    [checked],
  );

  const totalChecked = blockStats.reduce((s, b) => s + b.checked, 0);
  const overallPct = Math.round((totalChecked / TOTAL_CRITERIA) * 100);
  const filledBlocks = blockStats.filter((b) => b.checked > 0).length;
  const hasAnyChecked = totalChecked > 0;

  const sorted = [...blockStats].sort((a, b) => b.pct - a.pct);
  const maxPct = sorted[0]?.pct ?? 0;
  const dominantBlocks = sorted
    .filter((b) => maxPct > 0 && maxPct - b.pct <= 10)
    .slice(0, 2);
  const dominantArchetypes = dominantBlocks.map((b) => ARCHETYPES[b.id]);
  const hasDual = dominantArchetypes.length > 1;

  function toggleCriterion(blockId: BlockId, idx: number, value: boolean) {
    setChecked((prev) => {
      const next = { ...prev };
      const arr = [...next[blockId]];
      arr[idx] = value;
      next[blockId] = arr;
      return next;
    });
  }

  function handleReset() {
    if (!resetConfirm) {
      setResetConfirm(true);
      window.setTimeout(() => setResetConfirm(false), 3000);
      return;
    }
    setChecked(emptyChecked());
    setResetConfirm(false);
    setView("form");
  }

  if (view === "results") {
    return (
      <ResultsView
        scores={scores}
        blockStats={blockStats}
        dominantArchetypes={dominantArchetypes}
        hasDual={hasDual}
        totalChecked={totalChecked}
        overallPct={overallPct}
        onBack={() => setView("form")}
        onReset={handleReset}
        resetConfirm={resetConfirm}
      />
    );
  }

  return (
    <main className="relative min-h-screen">
      {/* Top progress bar */}
      <div className="sticky top-0 z-30 h-0.5 bg-[var(--hairline)]">
        <div
          className="h-full bg-accent transition-all duration-700 ease-out"
          style={{ width: `${overallPct}%` }}
        />
      </div>

      <div className="relative z-10 mx-auto max-w-5xl px-4 py-10 sm:px-6 sm:py-14 lg:px-10 lg:py-20">
        {/* Header */}
        <header className="mb-8 sm:mb-12 lg:mb-16">
          <div className="pl-12 sm:pl-14 lg:pl-0">
            <Link
              to="/resource-state"
              className="inline-flex items-center gap-1.5 text-xs text-muted-foreground transition-colors hover:text-foreground"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              Ресурсное состояние
            </Link>
            <div className="eyebrow mt-5 mb-4">Тонус-менеджмент</div>
            <h1 className="text-balance text-[2rem] font-semibold leading-[1.04] tracking-[-0.025em] text-foreground sm:text-5xl lg:text-[3.75rem]">
              Где мой источник ресурса?
            </h1>
            <p className="mt-4 max-w-2xl text-base leading-snug text-muted-foreground sm:text-lg">
              Отметьте утверждения, которые про вас. Получите карту источников
              энергии и архетип восстановления.
            </p>
            <div className="mt-5 inline-flex items-center gap-2 rounded-full border border-[var(--hairline)] bg-[var(--surface)] px-3 py-1 text-[11px] text-muted-foreground">
              <span>4 блока · {TOTAL_CRITERIA} утверждений</span>
              <span className="text-[var(--hairline-strong)]">·</span>
              <span>~5 мин</span>
            </div>
          </div>
        </header>

        <div className="grid gap-5 md:grid-cols-[1fr_2fr] md:gap-6 lg:grid-cols-[1fr_2.2fr] lg:gap-8">
          {/* Sticky sidebar with radar */}
          <aside className="hidden self-start md:sticky md:top-10 md:block">
            <div className="surface h-[20rem] rounded-2xl p-4">
              <ResourceRadarChart scores={scores} />
            </div>

            <div className="surface mt-3 rounded-2xl p-4">
              <div className="mb-3 flex items-center justify-between">
                <span className="eyebrow">Прогресс</span>
                <span className="text-[11px] tabular-nums text-muted-foreground">
                  {filledBlocks}/{BLOCKS.length}
                </span>
              </div>
              <div className="space-y-2">
                {blockStats.map((b, i) => {
                  const done = b.checked === b.total;
                  return (
                    <div key={b.id} className="flex items-center gap-2">
                      <span
                        className="flex h-4 w-4 shrink-0 items-center justify-center rounded text-[9px] font-semibold tabular-nums"
                        style={{
                          background: done
                            ? `color-mix(in oklab, var(${b.stageVar}) 18%, transparent)`
                            : b.checked > 0
                              ? "var(--surface-strong)"
                              : "var(--surface)",
                          color: done
                            ? `var(${b.stageVar})`
                            : b.checked > 0
                              ? "var(--foreground)"
                              : "var(--muted-foreground)",
                          border: "1px solid var(--hairline)",
                        }}
                      >
                        {done ? "✓" : i + 1}
                      </span>
                      <span
                        className={`flex-1 truncate text-[11px] ${
                          done
                            ? "font-medium text-foreground"
                            : "text-muted-foreground"
                        }`}
                      >
                        {b.shortLabel}
                      </span>
                      <span className="text-[10px] tabular-nums text-muted-foreground">
                        {b.checked}/{b.total}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          </aside>

          {/* Blocks */}
          <div className="space-y-3">
            {BLOCKS.map((block, index) => {
              const arr = checked[block.id];
              const c = arr.filter(Boolean).length;
              const total = block.criteria.length;
              const isOpen = openBlocks[block.id] ?? index === 0;
              const done = c === total;

              return (
                <section
                  key={block.id}
                  className="surface overflow-hidden rounded-2xl animate-fade-up"
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  <button
                    type="button"
                    onClick={() =>
                      setOpenBlocks((prev) => ({
                        ...prev,
                        [block.id]: !isOpen,
                      }))
                    }
                    className="flex w-full items-center justify-between gap-3 px-4 py-4 text-left transition-colors hover:bg-[var(--surface-strong)] sm:px-5"
                  >
                    <div className="flex min-w-0 flex-1 items-center gap-3">
                      <span
                        className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-[12px] font-semibold tabular-nums"
                        style={{
                          background: done
                            ? `color-mix(in oklab, var(${block.stageVar}) 22%, transparent)`
                            : c > 0
                              ? "var(--surface-strong)"
                              : "var(--surface)",
                          color: done
                            ? `var(${block.stageVar})`
                            : "var(--foreground)",
                          border: "1px solid var(--hairline)",
                        }}
                      >
                        {done ? "✓" : index + 1}
                      </span>
                      <div className="min-w-0">
                        <h2 className="truncate text-sm font-semibold leading-tight text-foreground sm:text-base">
                          {block.label}
                        </h2>
                        <p className="mt-0.5 truncate text-[11px] text-muted-foreground sm:text-xs">
                          {block.description}
                        </p>
                      </div>
                    </div>
                    <div className="flex shrink-0 items-center gap-3">
                      <span className="text-[11px] tabular-nums text-muted-foreground">
                        {c}/{total}
                      </span>
                      <ChevronRight
                        className={`h-4 w-4 text-muted-foreground transition-transform ${
                          isOpen ? "rotate-90" : ""
                        }`}
                      />
                    </div>
                  </button>

                  {isOpen && (
                    <ul className="divide-y divide-[var(--hairline)] border-t border-[var(--hairline)]">
                      {block.criteria.map((c, i) => {
                        const id = `${block.id}-${i}`;
                        const isChecked = arr[i] || false;
                        return (
                          <li key={i}>
                            <label
                              htmlFor={id}
                              className="flex cursor-pointer items-start gap-3 px-4 py-3 transition-colors hover:bg-[var(--surface-strong)] sm:px-5"
                            >
                              <input
                                type="checkbox"
                                id={id}
                                checked={isChecked}
                                onChange={(e) =>
                                  toggleCriterion(
                                    block.id,
                                    i,
                                    e.target.checked,
                                  )
                                }
                                className="mt-[3px] h-[18px] w-[18px] shrink-0 cursor-pointer accent-accent"
                                style={{ accentColor: `var(${block.stageVar})` }}
                              />
                              <div className="min-w-0 flex-1">
                                <p className="text-[13px] font-medium text-foreground sm:text-sm">
                                  {c.title}
                                </p>
                                <p className="mt-0.5 text-xs leading-relaxed text-muted-foreground sm:text-[13px]">
                                  {c.description}
                                </p>
                              </div>
                            </label>
                          </li>
                        );
                      })}
                    </ul>
                  )}
                </section>
              );
            })}

            {/* Mobile radar toggle */}
            <div className="md:hidden">
              <button
                type="button"
                onClick={() => setShowMobileRadar((v) => !v)}
                className="surface flex w-full items-center justify-between rounded-2xl p-4"
              >
                <div className="flex items-center gap-3">
                  <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-[var(--surface-strong)]">
                    <BarChart3 className="h-4 w-4 text-foreground/80" />
                  </span>
                  <div className="text-left">
                    <span className="block text-sm font-medium text-foreground">
                      Карта ресурсов
                    </span>
                    <span className="text-[11px] text-muted-foreground">
                      {hasAnyChecked
                        ? `${filledBlocks}/${BLOCKS.length} блоков`
                        : "Нажмите, чтобы открыть"}
                    </span>
                  </div>
                </div>
                <ChevronDown
                  className={`h-4 w-4 text-muted-foreground transition-transform ${
                    showMobileRadar ? "rotate-180" : ""
                  }`}
                />
              </button>
              {showMobileRadar && (
                <div className="surface mt-2 h-64 rounded-2xl p-4">
                  <ResourceRadarChart scores={scores} />
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Footer dock */}
        <div
          className={`fixed inset-x-0 bottom-0 z-40 transition-all duration-300 ${
            hasAnyChecked
              ? "translate-y-0 opacity-100"
              : "translate-y-full opacity-0"
          }`}
        >
          <div className="border-t border-[var(--hairline)] bg-background/80 px-4 py-3 backdrop-blur-md sm:px-6">
            <div className="mx-auto flex max-w-5xl items-center gap-2">
              <button
                type="button"
                onClick={() => setView("results")}
                className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl bg-foreground px-4 py-3 text-sm font-medium text-background transition-opacity hover:opacity-90"
              >
                {filledBlocks < BLOCKS.length
                  ? `Карта (${filledBlocks}/${BLOCKS.length})`
                  : "Карта ресурсов"}
                <ArrowRight className="h-4 w-4" />
              </button>
              <button
                type="button"
                onClick={handleReset}
                className={`inline-flex items-center justify-center gap-1.5 rounded-xl border px-3 py-3 text-sm transition-colors ${
                  resetConfirm
                    ? "border-destructive/40 bg-destructive/10 text-destructive"
                    : "border-[var(--hairline)] bg-[var(--surface)] text-foreground/80 hover:border-[var(--hairline-strong)]"
                }`}
              >
                <RotateCcw className="h-4 w-4" />
                <span className="hidden sm:inline">
                  {resetConfirm ? "Точно?" : "Сбросить"}
                </span>
              </button>
            </div>
          </div>
        </div>

        {hasAnyChecked && <div className="h-24" />}
      </div>
    </main>
  );
}

/* ─────────────────────────────────────── Results view */

function ResultsView({
  scores,
  blockStats,
  dominantArchetypes,
  hasDual,
  totalChecked,
  overallPct,
  onBack,
  onReset,
  resetConfirm,
}: {
  scores: Record<BlockId, number>;
  blockStats: {
    id: BlockId;
    label: string;
    shortLabel: string;
    stageVar: string;
    checked: number;
    total: number;
    pct: number;
  }[];
  dominantArchetypes: ReturnType<() => (typeof ARCHETYPES)[BlockId]>[];
  hasDual: boolean;
  totalChecked: number;
  overallPct: number;
  onBack: () => void;
  onReset: () => void;
  resetConfirm: boolean;
}) {
  const primary = dominantArchetypes[0];
  const primaryStage =
    BLOCKS.find((b) => b.id === primary?.id)?.stageVar ?? "--accent";

  function handleDownload() {
    printRadar({
      blocks: blockStats.map((b) => ({
        id: b.id,
        label: b.label,
        shortLabel: b.shortLabel,
        color: cssVar(b.stageVar),
        checked: b.checked,
        total: b.total,
        pct: b.pct,
        score: scores[b.id] ?? 0,
      })),
      dominantArchetypes: dominantArchetypes.map((a) => ({
        id: a.id,
        name: a.name,
        tagline: a.tagline,
        uniqueness: a.uniqueness,
        whyDrains: a.whyDrains,
        recovery: a.recovery,
        earlyWarnings: a.earlyWarnings,
        color: cssVar(
          BLOCKS.find((b) => b.id === a.id)?.stageVar ?? "--accent",
        ),
      })),
      hasDual,
      totalChecked,
      totalCriteria: TOTAL_CRITERIA,
      overallPct,
    });
  }

  return (
    <main className="relative min-h-screen">
      <div className="relative z-10 mx-auto max-w-4xl px-4 py-10 sm:px-6 sm:py-14 lg:px-10 lg:py-20">
        <header className="mb-10 sm:mb-12">
          <div className="mb-6 flex items-center justify-between gap-2">
            <button
              type="button"
              onClick={onBack}
              className="-ml-1 inline-flex items-center gap-1.5 text-xs text-muted-foreground transition-colors hover:text-foreground"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              Вернуться к опросу
            </button>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleDownload}
                className="inline-flex items-center gap-1.5 rounded-full border border-[var(--hairline)] bg-foreground px-3 py-1.5 text-[11px] font-medium text-background transition-opacity hover:opacity-90"
                title="Сохранить результаты в PDF"
              >
                <Download className="h-3 w-3" />
                <span className="hidden sm:inline">Скачать PDF</span>
                <span className="sm:hidden">PDF</span>
              </button>
              <button
                type="button"
                onClick={onReset}
                className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-[11px] transition-colors ${
                  resetConfirm
                    ? "border-destructive/40 bg-destructive/10 text-destructive"
                    : "border-[var(--hairline)] bg-[var(--surface)] text-foreground/70 hover:border-[var(--hairline-strong)]"
                }`}
              >
                <RotateCcw className="h-3 w-3" />
                {resetConfirm ? "Точно?" : "Сбросить"}
              </button>
            </div>
          </div>

          <div className="pl-12 sm:pl-14 lg:pl-0">
            <div className="eyebrow mb-4">Карта ваших ресурсов</div>
            <h1 className="text-balance text-3xl font-semibold leading-[1.06] tracking-[-0.022em] text-foreground sm:text-4xl lg:text-5xl">
              {primary
                ? hasDual
                  ? `${dominantArchetypes.map((a) => a.name).join(" + ")}`
                  : primary.name
                : "Заполните хотя бы один блок"}
            </h1>
            {primary && (
              <p className="mt-3 max-w-2xl text-base text-muted-foreground sm:text-lg">
                {hasDual
                  ? "Двойной источник ресурса — оба профиля важны для восстановления."
                  : primary.tagline}
              </p>
            )}
          </div>
        </header>

        <div className="grid gap-5 sm:grid-cols-2">
          {/* Stats card */}
          <div
            className="surface rounded-2xl p-6"
            style={{
              borderColor: `color-mix(in oklab, var(${primaryStage}) 30%, var(--hairline))`,
            }}
          >
            <div className="flex items-start gap-3">
              <Sparkles
                className="mt-0.5 h-5 w-5 shrink-0"
                style={{ color: `var(${primaryStage})` }}
              />
              <div>
                <div className="eyebrow mb-1">
                  {hasDual ? "Архетипы" : "Архетип восстановления"}
                </div>
                <p className="text-sm text-foreground/85">
                  Доминирующий блок определяет, что вернёт вам энергию быстрее
                  всего.
                </p>
              </div>
            </div>
            <div className="mt-5 grid grid-cols-2 gap-4 border-t border-[var(--hairline)] pt-4">
              <div>
                <div className="eyebrow mb-1">Отмечено</div>
                <p className="text-2xl font-semibold tabular-nums text-foreground">
                  {totalChecked}
                  <span className="text-sm font-normal text-muted-foreground">
                    /{TOTAL_CRITERIA}
                  </span>
                </p>
              </div>
              <div>
                <div className="eyebrow mb-1">Сила сигнала</div>
                <p
                  className="text-2xl font-semibold tabular-nums"
                  style={{ color: `var(${primaryStage})` }}
                >
                  {overallPct}%
                </p>
              </div>
            </div>
          </div>

          {/* Radar */}
          <div className="surface h-72 rounded-2xl p-4 sm:h-auto">
            <ResourceRadarChart scores={scores} />
          </div>
        </div>

        {/* Archetype details */}
        {dominantArchetypes.map((archetype, idx) => {
          const stageVar =
            BLOCKS.find((b) => b.id === archetype.id)?.stageVar ?? "--accent";
          return (
            <section
              key={archetype.id}
              className="mt-6 space-y-5 rounded-2xl p-6 sm:p-8"
              style={{
                background: "var(--surface)",
                border: `1px solid color-mix(in oklab, var(${stageVar}) 25%, var(--hairline))`,
              }}
            >
              {hasDual && (
                <div className="flex items-center gap-2 border-b border-[var(--hairline)] pb-3">
                  <Sparkles
                    className="h-4 w-4"
                    style={{ color: `var(${stageVar})` }}
                  />
                  <h2
                    className="text-base font-semibold sm:text-lg"
                    style={{ color: `var(${stageVar})` }}
                  >
                    {idx + 1}. {archetype.name}
                  </h2>
                  <span className="text-xs text-muted-foreground">
                    · {archetype.tagline}
                  </span>
                </div>
              )}

              <div>
                <div className="mb-2 flex items-center gap-2">
                  <Sparkles
                    className="h-4 w-4"
                    style={{ color: `var(${stageVar})` }}
                  />
                  <h3 className="text-sm font-semibold text-foreground">
                    Ваша уникальность
                  </h3>
                </div>
                <p className="text-[13px] leading-relaxed text-foreground/80 sm:text-sm">
                  {archetype.uniqueness}
                </p>
              </div>

              <div className="border-t border-[var(--hairline)] pt-4">
                <div className="mb-2 flex items-center gap-2">
                  <TriangleAlert
                    className="h-4 w-4"
                    style={{ color: `var(${stageVar})` }}
                  />
                  <h3 className="text-sm font-semibold text-foreground">
                    Почему вы «гаснете»
                  </h3>
                </div>
                <p className="text-[13px] leading-relaxed text-foreground/80 sm:text-sm">
                  {archetype.whyDrains}
                </p>
              </div>

              <div className="border-t border-[var(--hairline)] pt-4">
                <div className="mb-3 flex items-center gap-2">
                  <Battery
                    className="h-4 w-4"
                    style={{ color: `var(${stageVar})` }}
                  />
                  <h3 className="text-sm font-semibold text-foreground">
                    Экологичное восстановление
                  </h3>
                </div>
                <div className="grid gap-3 sm:grid-cols-2">
                  {archetype.recovery.map((r, i) => (
                    <div
                      key={i}
                      className="rounded-xl border border-[var(--hairline)] bg-[var(--surface-strong)] p-3"
                    >
                      <p className="mb-1 text-[13px] font-medium text-foreground">
                        {r.title}
                      </p>
                      <p className="text-[12px] leading-relaxed text-foreground/70 sm:text-[13px]">
                        {r.text}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="border-t border-[var(--hairline)] pt-4">
                <div className="mb-2 flex items-center gap-2">
                  <BellRing
                    className="h-4 w-4"
                    style={{ color: `var(${stageVar})` }}
                  />
                  <h3 className="text-sm font-semibold text-foreground">
                    Карта сигналов: пора восстановиться
                  </h3>
                </div>
                <p className="mb-3 text-[11px] text-muted-foreground">
                  Маркеры раннего оповещения · {archetype.earlyWarnings.level}
                </p>
                <ul className="space-y-2">
                  {archetype.earlyWarnings.signals.map((s, i) => (
                    <li
                      key={i}
                      className="flex gap-2 text-[13px] leading-relaxed text-foreground/80 sm:text-sm"
                    >
                      <span
                        className="mt-1 inline-block h-1 w-1 shrink-0 rounded-full"
                        style={{ background: `var(${stageVar})` }}
                      />
                      <span>{s}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </section>
          );
        })}

        {/* Per-block bars */}
        <section className="surface mt-6 rounded-2xl p-6 sm:p-8">
          <h2 className="text-base font-semibold text-foreground sm:text-lg">
            Источники энергии по блокам
          </h2>
          <p className="mt-1 text-xs text-muted-foreground">
            Чем выше процент — тем сильнее этот блок влияет на ваш ресурс.
          </p>
          <div className="mt-5 space-y-4">
            {blockStats.map((b) => (
              <div key={b.id} className="space-y-1.5">
                <div className="flex items-center justify-between gap-3">
                  <span className="text-[13px] font-medium text-foreground">
                    {b.label}
                  </span>
                  <span className="text-[11px] tabular-nums text-muted-foreground">
                    {b.checked}/{b.total} · {b.pct}%
                  </span>
                </div>
                <div className="h-1.5 overflow-hidden rounded-full bg-[var(--hairline)]">
                  <div
                    className="h-full rounded-full transition-all duration-700 ease-out"
                    style={{
                      width: `${b.pct}%`,
                      background: `var(${b.stageVar})`,
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* CTA back */}
        <section className="mt-8 text-center">
          <Link
            to="/resource-state"
            className="inline-flex items-center gap-2 rounded-full border border-[var(--hairline)] bg-[var(--surface)] px-4 py-2 text-sm text-foreground/80 transition-colors hover:border-[var(--hairline-strong)] hover:text-foreground"
          >
            Вернуться к ресурсному состоянию
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </section>
      </div>
    </main>
  );
}
