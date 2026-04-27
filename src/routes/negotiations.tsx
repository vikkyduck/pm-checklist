import { createFileRoute } from "@tanstack/react-router";
import { useMemo } from "react";
import { useChecklistProgress } from "@/hooks/use-checklist-progress";

export const Route = createFileRoute("/negotiations")({
  component: NegotiationsPage,
  head: () => ({
    meta: [
      { title: "Переговоры с заказчиком · PM Чек-лист" },
      {
        name: "description",
        content:
          "Чек-лист оценки PM в переговорах с заказчиком: запуск, аргументация, работа со стейкхолдерами, фиксация результата.",
      },
      {
        property: "og:title",
        content: "Переговоры с заказчиком · PM Чек-лист",
      },
      {
        property: "og:description",
        content:
          "Чек-лист оценки игрока (РМ) в ролевой игре переговоров с заказчиком.",
      },
    ],
  }),
});

type Section = {
  id: string;
  number: string;
  title: string;
  subtitle: string;
  stageVar: string;
  items: string[];
};

const SECTIONS: Section[] = [
  {
    id: "kickoff",
    number: "01",
    title: "Запуск и диагностика",
    subtitle: "Начало встречи",
    stageVar: "--stage-2",
    items: [
      "Игрок в начале встречи явно сослался на заранее разосланную повестку или контекст (например: «Как я и писал в Mattermost…»).",
      "Игрок задал вопрос: «Почему этот проект/задача важны именно сейчас?» (поиск скрытых триггеров).",
      "Игрок применил метод Барбары Минто: сначала озвучил контекст, потом — ключевой вывод или предложение, а детали предложил обсудить позже, или сформулировал аргументы.",
      "Игрок в первые минуты встречи обозначил цель общения (согласование, эскалация или информирование).",
    ],
  },
  {
    id: "influence",
    number: "02",
    title: "Техники влияния и аргументации",
    subtitle: "В процессе",
    stageVar: "--stage-3",
    items: [
      "Игрок упаковал свою мысль в структуру PREP: Тезис → Обоснование → Пример → Тезис.",
      "Игрок использовал связку «Проблема — Решение — Выгода» при предложении идеи.",
      "Игрок задал вопрос: «Что будет, если мы НЕ сделаем это?» (контрфактический анализ).",
      "Игрок обращался к ключевым KPI собеседника: финансовые термины для спонсора или операционные (сроки/ресурсы) для руководителя.",
      "Игрок использовал приём «Да, и…» для обработки возражения собеседника вместо слова «Нет».",
    ],
  },
  {
    id: "stakeholders",
    number: "03",
    title: "Управление «трудным» стейкхолдером",
    subtitle: "Работа с людьми",
    stageVar: "--stage-4",
    items: [
      "Игрок задал вопрос для выяснения личной мотивации собеседника (например: «Что для тебя самое важное в этой задаче?»).",
      "Игрок сформулировал запрос к перегруженному участнику как закрытый вопрос (выбор из 2 вариантов или «Да/Нет»).",
      "Игрок явно обозначил, сколько времени займёт действие от собеседника (например: «Тебе нужно всего 5 минут на ревью»).",
      "Игрок публично отметил вклад собеседника или пообещал сделать его видимым для руководства.",
    ],
  },
  {
    id: "risks",
    number: "04",
    title: "Профессиональное поведение РМ",
    subtitle: "Управление рисками",
    stageVar: "--stage-5",
    items: [
      "Игрок представил проблему в формате: «Проблема + 2 варианта решения + рекомендация».",
      "Игрок явно озвучил «лестницу последствий» или SLA при обсуждении задержек (например: «Если ответа не будет 2 дня, я эскалирую вопрос руководителю»).",
      "Игрок при появлении нового требования от стейкхолдера явно проговорил: «Это Change Request, мне нужно оценить влияние на сроки и бюджет».",
      "Игрок зафиксировал зависимость фразой: «Команда X делает Y к дате Z, верно?».",
    ],
  },
  {
    id: "closing",
    number: "05",
    title: "Фиксация результата",
    subtitle: "Финал встречи",
    stageVar: "--stage-1",
    items: [
      "Игрок в конце встречи произнёс итоговую формулировку цели (проекта/задачи) и получил от собеседника явное «Да».",
      "Игрок назвал конкретные фамилии ответственных за принятые решения (Owner-ов).",
      "Игрок озвучил дедлайн и формат follow-up сообщения (например: «Пришлю итоги через 2 часа, правило: молчание = согласие»).",
    ],
  },
];

const negotiationItemId = (sectionId: string, idx: number) =>
  `negotiations::${sectionId}::${idx}`;

function NegotiationsPage() {
  const { progress, toggle } = useChecklistProgress();

  const totals = useMemo(() => {
    const total = SECTIONS.reduce((s, sec) => s + sec.items.length, 0);
    const done = SECTIONS.reduce(
      (s, sec) =>
        s + sec.items.filter((_, i) => progress[negotiationItemId(sec.id, i)]).length,
      0,
    );
    return { total, done, pct: total ? Math.round((done / total) * 100) : 0 };
  }, [progress]);

  return (
    <main className="relative min-h-screen overflow-hidden">
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div
          className="absolute -top-40 -left-40 h-[480px] w-[480px] rounded-full blur-3xl opacity-40 animate-float-slow"
          style={{ background: "var(--stage-3)" }}
        />
        <div
          className="absolute bottom-0 right-0 h-[460px] w-[460px] rounded-full blur-3xl opacity-30 animate-float-slow"
          style={{ background: "var(--stage-5)", animationDelay: "-6s" }}
        />
      </div>

      <div className="relative z-10 mx-auto max-w-5xl px-4 py-8 sm:px-6 sm:py-12 lg:px-10 lg:py-20">
        {/* Hero */}
        <header className="mb-8 space-y-4 sm:mb-10 lg:mb-14">
          <div className="pl-12 sm:pl-14 lg:pl-0">
            <div className="glass-pill inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-[11px] font-medium tracking-wide text-foreground/80 sm:px-3.5 sm:text-xs">
              <span className="h-1.5 w-1.5 rounded-full bg-accent shadow-[0_0_8px_var(--accent)]" />
              Чек-лист оценки PM в ролевой игре
            </div>
            <h1 className="mt-3 text-balance text-3xl font-semibold leading-[1.05] tracking-tight text-foreground sm:text-4xl md:text-5xl lg:text-6xl">
              Переговоры с заказчиком
              <span className="mt-2 block bg-gradient-to-r from-[var(--stage-3)] via-[var(--stage-4)] to-[var(--stage-5)] bg-clip-text text-transparent">
                что должен сделать игрок
              </span>
            </h1>
            <p className="mt-3 max-w-2xl text-sm leading-relaxed text-muted-foreground sm:text-base">
              Пять блоков наблюдаемого поведения PM: от запуска встречи до
              фиксации результата. Отмечайте по ходу разбора — прогресс
              сохраняется локально.
            </p>
          </div>

          {/* Progress */}
          <div className="glass mt-5 flex flex-col gap-3 rounded-2xl p-3.5 sm:mt-6 sm:flex-row sm:items-center sm:justify-between sm:p-4">
            <div className="flex items-center gap-3">
              <div className="text-xl font-semibold tabular-nums text-foreground sm:text-2xl">
                {totals.done}
                <span className="text-muted-foreground">/{totals.total}</span>
              </div>
              <div className="text-xs text-muted-foreground">
                выполнено по чек-листу
              </div>
            </div>
            <div className="flex items-center gap-3 sm:w-1/2">
              <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-white/[0.06]">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-[var(--stage-3)] to-[var(--stage-5)] transition-all duration-500"
                  style={{ width: `${totals.pct}%` }}
                />
              </div>
              <div className="text-xs font-medium tabular-nums text-foreground/80">
                {totals.pct}%
              </div>
            </div>
          </div>

          {/* Quick nav */}
          <nav className="-mx-4 mt-4 flex gap-2 overflow-x-auto px-4 sm:mx-0 sm:flex-wrap sm:px-0">
            {SECTIONS.map((s) => (
              <a
                key={s.id}
                href={`#${s.id}`}
                className="glass-soft shrink-0 rounded-full px-3 py-1.5 text-[11px] font-medium text-foreground/80 transition-colors hover:text-foreground sm:px-3.5 sm:text-xs"
              >
                <span className="mr-1.5 text-muted-foreground">{s.number}</span>
                {s.title}
              </a>
            ))}
          </nav>
        </header>

        {/* Sections */}
        <div className="grid gap-5 sm:gap-6 lg:gap-8">
          {SECTIONS.map((section, idx) => {
            const doneInSection = section.items.filter(
              (_, i) => progress[negotiationItemId(section.id, i)],
            ).length;
            return (
              <article
                key={section.id}
                id={section.id}
                className="glass stage-glow relative overflow-hidden rounded-2xl p-4 sm:rounded-3xl sm:p-6 lg:p-9"
                style={
                  {
                    "--stage-color": `var(${section.stageVar})`,
                    animationDelay: `${idx * 60}ms`,
                  } as React.CSSProperties
                }
              >
                <span
                  aria-hidden
                  className="pointer-events-none absolute -right-3 -top-4 select-none text-[90px] font-semibold leading-none tracking-tighter opacity-[0.06] sm:-right-4 sm:-top-6 sm:text-[120px] lg:text-[170px]"
                  style={{ color: `var(${section.stageVar})` }}
                >
                  {section.number}
                </span>

                <div className="relative space-y-4 sm:space-y-5">
                  <div className="flex flex-wrap items-end justify-between gap-3">
                    <div className="min-w-0 flex-1">
                      <div
                        className="mb-2 inline-flex items-center gap-2 rounded-full px-2.5 py-1 text-[10px] font-medium uppercase tracking-wider sm:px-3 sm:text-[11px]"
                        style={{
                          background: `color-mix(in oklab, var(${section.stageVar}) 18%, transparent)`,
                          color: `var(${section.stageVar})`,
                        }}
                      >
                        <span
                          className="h-1.5 w-1.5 rounded-full"
                          style={{
                            background: `var(${section.stageVar})`,
                            boxShadow: `0 0 10px var(${section.stageVar})`,
                          }}
                        />
                        Блок {section.number}
                      </div>
                      <h2 className="text-xl font-semibold leading-tight tracking-tight text-foreground sm:text-2xl lg:text-3xl">
                        {section.title}
                      </h2>
                      <p className="mt-1 text-xs leading-relaxed text-muted-foreground sm:text-sm">
                        {section.subtitle}
                      </p>
                    </div>
                    <span
                      className="rounded-full px-2.5 py-1 text-[11px] font-medium tabular-nums"
                      style={{
                        background: `color-mix(in oklab, var(${section.stageVar}) 18%, transparent)`,
                        color: `var(${section.stageVar})`,
                      }}
                    >
                      {doneInSection}/{section.items.length}
                    </span>
                  </div>

                  <ul className="grid gap-2 sm:gap-2.5">
                    {section.items.map((text, i) => {
                      const id = negotiationItemId(section.id, i);
                      const checked = !!progress[id];
                      return (
                        <li key={id}>
                          <button
                            type="button"
                            onClick={() => toggle(id)}
                            className={[
                              "group flex w-full items-start gap-3 rounded-2xl border border-white/[0.06] bg-white/[0.02] px-3 py-2.5 text-left transition-all sm:px-4 sm:py-3",
                              "hover:border-white/[0.12] hover:bg-white/[0.05]",
                              checked ? "opacity-70" : "",
                            ].join(" ")}
                          >
                            <span
                              className={[
                                "mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-md border transition-all",
                                checked
                                  ? "border-transparent"
                                  : "border-white/20 group-hover:border-white/40",
                              ].join(" ")}
                              style={
                                checked
                                  ? {
                                      background: `var(${section.stageVar})`,
                                      boxShadow: `0 0 14px color-mix(in oklab, var(${section.stageVar}) 60%, transparent)`,
                                    }
                                  : undefined
                              }
                              aria-hidden
                            >
                              {checked && (
                                <svg
                                  viewBox="0 0 16 16"
                                  className="h-3 w-3"
                                  fill="none"
                                  stroke="oklch(0.18 0.03 255)"
                                  strokeWidth="3"
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                >
                                  <path d="M3 8.5l3 3 7-7" />
                                </svg>
                              )}
                            </span>
                            <span
                              className={[
                                "text-sm leading-relaxed text-foreground/90",
                                checked ? "line-through decoration-foreground/30" : "",
                              ].join(" ")}
                            >
                              {text}
                            </span>
                          </button>
                        </li>
                      );
                    })}
                  </ul>
                </div>
              </article>
            );
          })}
        </div>
      </div>
    </main>
  );
}
