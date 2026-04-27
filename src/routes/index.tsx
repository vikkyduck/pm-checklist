import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import {
  ShieldCheck,
  Battery,
  Radar as RadarIcon,
  MessagesSquare,
  ArrowUpRight,
  Check,
} from "lucide-react";
import { ROADMAP } from "@/lib/pm-roadmap";
import { useChecklistProgress, itemId } from "@/hooks/use-checklist-progress";

export const Route = createFileRoute("/")({
  component: HomePage,
  head: () => ({
    meta: [
      { title: "Practice — навигатор PM" },
      {
        name: "description",
        content:
          "Четыре раздела для руководителя проекта: митигирование рисков, ресурсное состояние, радар восстановления и переговоры с заказчиком.",
      },
    ],
  }),
});

/* ─────────────────────────────────────────────── Topics */

type Topic = {
  id: string;
  to: "/pm-checklist" | "/resource-state" | "/resource-radar" | "/negotiations";
  number: string;
  kicker: string;
  title: string;
  italic: string;
  description: string;
  bullets: string[];
  icon: React.ComponentType<{ className?: string }>;
  accent: string; // css var name
  cta: string;
  meta?: string;
};

const TOPICS: Topic[] = [
  {
    id: "checklist",
    to: "/pm-checklist",
    number: "01",
    kicker: "Митигирование рисков",
    title: "Чек-лист",
    italic: "руководителя проекта",
    description:
      "Шесть этапов от первого дня до закрытия. Конкретные шаги, прогресс сохраняется автоматически.",
    bullets: [
      "6 этапов · от инициации до завершения",
      "Поиск и быстрый переход по шагам",
      "Печать в PDF одним кликом",
    ],
    icon: ShieldCheck,
    accent: "--stage-1",
    cta: "Открыть чек-лист",
  },
  {
    id: "resource",
    to: "/resource-state",
    number: "02",
    kicker: "Ресурсное состояние",
    title: "Памятка",
    italic: "по уровням восстановления",
    description:
      "У каждого свой ведущий тип. Памятка собирает рекомендации, как возвращать себе ресурс на работе и вне её.",
    bullets: [
      "Описание четырёх ведущих типов",
      "Сценарии и быстрые практики",
      "Связана с радаром — открывает ваш профиль",
    ],
    icon: Battery,
    accent: "--stage-2",
    cta: "Читать памятку",
  },
  {
    id: "radar",
    to: "/resource-radar",
    number: "03",
    kicker: "Радар ресурсности",
    title: "Опрос",
    italic: "и ваш архетип",
    description:
      "Короткий радар из четырёх блоков. По итогу — ваш ведущий тип и точка входа в памятку.",
    bullets: [
      "4 блока критериев",
      "Результат сохраняется в браузере",
      "Можно перепройти в любой момент",
    ],
    icon: RadarIcon,
    accent: "--stage-3",
    cta: "Пройти радар",
    meta: "≈ 5 минут",
  },
  {
    id: "negotiations",
    to: "/negotiations",
    number: "04",
    kicker: "Переговоры с заказчиком",
    title: "Дебриф",
    italic: "ролевой игры",
    description:
      "Поведенческий чек-лист для разбора ролевой переговорной игры — что должен был сделать PM в каждом ходе.",
    bullets: [
      "Поведенческие маркеры по раундам",
      "Прогресс по навыкам",
      "Печать отчёта о разборе",
    ],
    icon: MessagesSquare,
    accent: "--stage-4",
    cta: "Открыть дебриф",
  },
];

/* ─────────────────────────────────────────────── Page */

function HomePage() {
  const { progress } = useChecklistProgress();

  // Checklist progress
  const { checklistDone, checklistTotal } = useMemo(() => {
    let total = 0;
    let done = 0;
    for (const stage of ROADMAP) {
      for (const cat of stage.categories) {
        cat.items.forEach((_, i) => {
          total += 1;
          if (progress[itemId(stage.id, cat.title, i)]) done += 1;
        });
      }
    }
    return { checklistDone: done, checklistTotal: total };
  }, [progress]);

  // Radar status (localStorage)
  const [radarArchetype, setRadarArchetype] = useState<string | null>(null);
  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      const raw = localStorage.getItem("resource_radar_state");
      if (raw) {
        const parsed = JSON.parse(raw);
        if (parsed?.archetype) setRadarArchetype(String(parsed.archetype));
      }
    } catch {
      /* ignore */
    }
  }, []);

  // Map id -> status string
  const statusFor = (id: string): { label: string; done: boolean } | null => {
    if (id === "checklist") {
      if (checklistTotal === 0) return null;
      return {
        label: `${checklistDone} / ${checklistTotal}`,
        done: checklistDone === checklistTotal,
      };
    }
    if (id === "radar") {
      return radarArchetype
        ? { label: `Архетип · ${radarArchetype}`, done: true }
        : { label: "Не пройден", done: false };
    }
    return null;
  };

  return (
    <main className="relative min-h-screen">
      <div className="relative z-10 mx-auto max-w-6xl px-4 py-10 sm:px-6 sm:py-14 lg:px-10 lg:py-20">
        {/* Hero */}
        <header className="mb-14 sm:mb-20">
          <div className="eyebrow">Practice · навигатор PM · 2026</div>

          <h1 className="mt-7 text-balance display text-foreground text-[2.5rem] sm:text-6xl md:text-7xl lg:text-[5.5rem]">
            Четыре{" "}
            <em
              className="display-italic"
              style={{ color: "var(--accent)" }}
            >
              опоры
            </em>{" "}
            руководителя проекта
          </h1>

          <div className="mt-7 grid gap-6 sm:mt-10 sm:grid-cols-[2fr_1fr] sm:items-end sm:gap-12">
            <p className="lede max-w-xl">
              С чего начать? Выберите тему ниже — это разделы навигатора.
              Каждый можно открывать независимо, прогресс сохраняется автоматически.
            </p>
            <p
              className="hidden text-right text-muted-foreground sm:block"
              style={{
                fontFamily: "var(--font-mono)",
                fontSize: "11px",
                letterSpacing: "0.08em",
                textTransform: "uppercase",
              }}
            >
              митигирование · ресурс<br />радар · переговоры
            </p>
          </div>

          <div className="hairline mt-12" />
        </header>

        {/* Topics overview */}
        <section aria-labelledby="topics-heading">
          <div className="mb-6 flex items-baseline justify-between gap-3">
            <h2 id="topics-heading" className="eyebrow">
              Разделы — выберите, с чего начать
            </h2>
            <span className="text-[11px] text-muted-foreground">
              {TOPICS.length} темы
            </span>
          </div>

          <div className="grid gap-3 sm:gap-4 md:grid-cols-2">
            {TOPICS.map((t) => {
              const status = statusFor(t.id);
              return (
                <TopicCard key={t.id} topic={t} status={status} />
              );
            })}
          </div>
        </section>

        {/* Suggested path */}
        <section className="mt-16 sm:mt-20">
          <div className="hairline mb-8" />
          <div className="mb-5 eyebrow">Рекомендованный маршрут</div>
          <ol className="grid gap-x-10 gap-y-6 sm:grid-cols-3">
            <PathStep
              n="01"
              title="Пройдите радар"
              text="Узнайте ваш ведущий тип восстановления — это ≈ 5 минут."
              to="/resource-radar"
            />
            <PathStep
              n="02"
              title="Откройте памятку"
              text="Прочитайте рекомендации именно для вашего типа."
              to="/resource-state"
            />
            <PathStep
              n="03"
              title="Ведите чек-лист"
              text="Используйте митигирование рисков как ежедневную опору."
              to="/pm-checklist"
            />
          </ol>
        </section>

        {/* Footer */}
        <footer className="mt-16 sm:mt-24">
          <div className="hairline mb-6" />
          <div className="flex flex-col items-start justify-between gap-2 text-xs text-muted-foreground sm:flex-row sm:items-center">
            <span className="font-medium tracking-tight text-foreground">
              Practice
            </span>
            <span>навигатор PM · 2026</span>
          </div>
        </footer>
      </div>
    </main>
  );
}

/* ─────────────────────────────────────────────── Topic Card */

function TopicCard({
  topic,
  status,
}: {
  topic: Topic;
  status: { label: string; done: boolean } | null;
}) {
  const Icon = topic.icon;
  return (
    <Link
      to={topic.to}
      className="group surface relative flex flex-col gap-5 overflow-hidden rounded-2xl border border-[var(--hairline)] bg-[var(--surface)] p-6 transition-all duration-300 hover:-translate-y-px hover:border-[var(--hairline-strong)] hover:bg-[var(--surface-strong)] hover:shadow-[var(--shadow-md)] sm:p-7"
    >
      {/* top accent */}
      <span
        aria-hidden
        className="absolute inset-x-6 top-0 h-[2px] rounded-b-full opacity-0 transition-opacity duration-300 group-hover:opacity-100 sm:inset-x-7"
        style={{ background: `var(${topic.accent})` }}
      />

      {/* header row */}
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-3">
          <span
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-[var(--hairline-strong)] bg-[var(--surface-strong)]"
            style={{ color: `var(${topic.accent})` }}
          >
            <Icon className="h-4 w-4" />
          </span>
          <div className="min-w-0">
            <div className="eyebrow">
              {topic.number} · {topic.kicker}
            </div>
            {status && (
              <div className="mt-1.5 inline-flex items-center gap-1.5 text-[11px] tabular-nums text-muted-foreground">
                {status.done && (
                  <Check
                    className="h-3 w-3"
                    style={{ color: `var(${topic.accent})` }}
                  />
                )}
                <span style={status.done ? { color: `var(${topic.accent})` } : undefined}>
                  {status.label}
                </span>
              </div>
            )}
          </div>
        </div>
        <ArrowUpRight className="h-4 w-4 shrink-0 text-muted-foreground transition-all duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-foreground" />
      </div>

      {/* title */}
      <h3
        className="display text-foreground text-[1.75rem] leading-[1.05] sm:text-[2rem]"
        style={{ letterSpacing: "-0.02em" }}
      >
        {topic.title}{" "}
        <em className="display-italic" style={{ color: `var(${topic.accent})` }}>
          {topic.italic}
        </em>
      </h3>

      {/* description */}
      <p className="text-sm leading-relaxed text-muted-foreground">
        {topic.description}
      </p>

      {/* bullets */}
      <ul className="space-y-1.5 border-t border-[var(--hairline)] pt-4">
        {topic.bullets.map((b, i) => (
          <li
            key={i}
            className="flex items-start gap-2.5 text-[13px] leading-snug text-foreground/85"
          >
            <span
              aria-hidden
              className="mt-[7px] h-1 w-1 shrink-0 rounded-full"
              style={{ background: `var(${topic.accent})` }}
            />
            {b}
          </li>
        ))}
      </ul>

      {/* footer cta */}
      <div className="mt-auto flex items-center justify-between gap-3 pt-1">
        <span className="text-[13px] font-medium text-foreground">
          {topic.cta}
        </span>
        {topic.meta && (
          <span
            className="text-[10.5px] uppercase tracking-[0.12em] text-muted-foreground"
            style={{ fontFamily: "var(--font-mono)" }}
          >
            {topic.meta}
          </span>
        )}
      </div>
    </Link>
  );
}

/* ─────────────────────────────────────────────── Path Step */

function PathStep({
  n,
  title,
  text,
  to,
}: {
  n: string;
  title: string;
  text: string;
  to: "/pm-checklist" | "/resource-state" | "/resource-radar" | "/negotiations";
}) {
  return (
    <li className="flex gap-4">
      <span className="text-sm font-medium tabular-nums text-muted-foreground">
        {n}
      </span>
      <div className="min-w-0">
        <Link
          to={to}
          className="group inline-flex items-baseline gap-1.5 text-[15px] font-medium text-foreground transition-colors hover:text-accent"
        >
          {title}
          <ArrowUpRight className="h-3.5 w-3.5 shrink-0 translate-y-[1px] opacity-50 transition-all group-hover:-translate-y-0 group-hover:translate-x-0.5 group-hover:opacity-100" />
        </Link>
        <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">
          {text}
        </p>
      </div>
    </li>
  );
}
