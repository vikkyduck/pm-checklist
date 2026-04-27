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
    <main className="relative min-h-screen">
      <div className="relative z-10 mx-auto max-w-4xl px-4 py-10 sm:px-6 sm:py-14 lg:px-10 lg:py-20">
        {/* Hero */}
        <header className="mb-10 sm:mb-14 lg:mb-20">
          <div className="pl-12 sm:pl-14 lg:pl-0">
            <div className="eyebrow mb-5">Переговоры с заказчиком</div>
            <h1 className="text-balance text-[2rem] font-semibold leading-[1.04] tracking-[-0.025em] text-foreground sm:text-5xl md:text-6xl lg:text-[4.5rem]">
              Что должен сделать игрок
            </h1>
            <p className="mt-4 max-w-2xl text-base leading-snug text-muted-foreground sm:text-lg">
              Пять блоков наблюдаемого поведения PM: от запуска встречи до
              фиксации результата. Отмечайте по ходу разбора — прогресс
              сохраняется автоматически.
            </p>
          </div>

          {/* Progress — single hairline */}
          <div className="mt-10 sm:mt-12">
            <div className="mb-2 flex items-baseline justify-between">
              <span className="text-2xl font-semibold tabular-nums tracking-tight text-foreground sm:text-3xl">
                {totals.done}
                <span className="text-muted-foreground">/{totals.total}</span>
              </span>
              <span className="text-sm font-medium tabular-nums text-accent">
                {totals.pct}%
              </span>
            </div>
            <div className="h-px w-full overflow-hidden bg-[var(--hairline)]">
              <div
                className="h-full bg-accent transition-all duration-700 ease-out"
                style={{ width: `${totals.pct}%` }}
              />
            </div>
          </div>

          {/* Quick nav */}
          <nav className="-mx-4 mt-8 flex gap-1 overflow-x-auto px-4 sm:mx-0 sm:flex-wrap sm:px-0">
            {SECTIONS.map((s) => (
              <a
                key={s.id}
                href={`#${s.id}`}
                className="group inline-flex shrink-0 items-center gap-2 rounded-full border border-[var(--hairline)] px-3 py-1.5 text-[11px] font-medium text-foreground/80 transition-colors hover:border-[var(--hairline-strong)] hover:text-foreground sm:text-xs"
              >
                <span className="text-muted-foreground">{s.number}</span>
                {s.title}
              </a>
            ))}
          </nav>
        </header>

        {/* Sections */}
        <div className="space-y-12 sm:space-y-16">
          <a
            href="#guide"
            className="inline-flex w-fit items-center gap-2 text-xs font-medium text-foreground/70 transition-colors hover:text-foreground sm:text-sm"
          >
            <span>Перейти к руководству по аргументации</span>
            <span aria-hidden>→</span>
          </a>
          {SECTIONS.map((section) => {
            const doneInSection = section.items.filter(
              (_, i) => progress[negotiationItemId(section.id, i)],
            ).length;
            const allDone =
              doneInSection === section.items.length && section.items.length > 0;
            return (
              <section
                key={section.id}
                id={section.id}
                className="relative animate-fade-up scroll-mt-20"
              >
                <header className="mb-5 sm:mb-6">
                  <div className="flex items-baseline gap-4 sm:gap-5">
                    <span
                      className="text-sm font-semibold tabular-nums tracking-tight"
                      style={{ color: `var(${section.stageVar})` }}
                    >
                      {section.number}
                    </span>
                    <div className="min-w-0 flex-1">
                      <h2 className="text-balance text-xl font-semibold leading-tight tracking-tight text-foreground sm:text-2xl lg:text-3xl">
                        {section.title}
                      </h2>
                      <div className="mt-1.5 flex items-center gap-3 text-xs text-muted-foreground">
                        <span>{section.subtitle}</span>
                        <span className="h-3 w-px bg-[var(--hairline-strong)]" />
                        <span
                          className="tabular-nums"
                          style={
                            allDone
                              ? { color: `var(${section.stageVar})` }
                              : undefined
                          }
                        >
                          {doneInSection}/{section.items.length}
                        </span>
                      </div>
                    </div>
                  </div>
                </header>

                <ul className="divide-y divide-[var(--hairline)] border-y border-[var(--hairline)]">
                  {section.items.map((text, i) => {
                    const id = negotiationItemId(section.id, i);
                    const checked = !!progress[id];
                    return (
                      <li key={id}>
                        <button
                          type="button"
                          onClick={() => toggle(id)}
                          className="group flex w-full items-start gap-3.5 px-1 py-3.5 text-left transition-colors hover:bg-[var(--surface)] sm:gap-4 sm:px-2 sm:py-4"
                        >
                          <span
                            className="mt-[3px] flex h-[18px] w-[18px] shrink-0 items-center justify-center rounded-md border transition-all duration-200"
                            style={
                              checked
                                ? {
                                    borderColor: `var(${section.stageVar})`,
                                    background: `var(${section.stageVar})`,
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
                                viewBox="0 0 24 24"
                                className="h-3 w-3"
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
                          <span
                            className={[
                              "text-[14.5px] leading-relaxed transition-colors sm:text-[15px]",
                              checked
                                ? "text-muted-foreground line-through decoration-muted-foreground/30"
                                : "text-foreground/90",
                            ].join(" ")}
                          >
                            {text}
                          </span>
                        </button>
                      </li>
                    );
                  })}
                </ul>
              </section>
            );
          })}
        </div>

        <GuideSection />
      </div>
    </main>
  );
}

/* ────────────────────────────────────────────────────────────────────────── */
/*  Guide: Argumentation & Stakeholder Interaction                            */
/* ────────────────────────────────────────────────────────────────────────── */

type GuideBlock = {
  id: string;
  number: string;
  title: string;
  lead: string;
  stageVar: string;
};

const GUIDE_BLOCKS: GuideBlock[] = [
  {
    id: "guide-type",
    number: "01",
    title: "По типу стейкхолдера",
    lead: "Первичная классификация: определяет формат канала и уровень детализации коммуникации.",
    stageVar: "--stage-1",
  },
  {
    id: "guide-interest",
    number: "02",
    title: "По типу интереса стейкхолдера",
    lead: "Язык аргументации должен совпадать с системой ценностей и целями конкретного стейкхолдера.",
    stageVar: "--stage-2",
  },
  {
    id: "guide-argument",
    number: "03",
    title: "По типу аргумента",
    lead: "Комбинирование типов повышает убедительность: логика создаёт доверие, риторика мотивирует, практика снимает скептицизм.",
    stageVar: "--stage-3",
  },
  {
    id: "guide-goal",
    number: "04",
    title: "По цели взаимодействия",
    lead: "Выбор цели определяет структуру встречи, формат документа и необходимый уровень детализации.",
    stageVar: "--stage-4",
  },
  {
    id: "guide-matrix",
    number: "05",
    title: "По уровню власти и интереса",
    lead: "Матрица «Власть / Интерес» помогает приоритизировать усилия на коммуникацию и определить глубину вовлечения.",
    stageVar: "--stage-5",
  },
  {
    id: "guide-methods",
    number: "06",
    title: "Методы аргументации",
    lead: "Выбор метода зависит от цели взаимодействия, типа стейкхолдера и характера его возражений.",
    stageVar: "--stage-3",
  },
];

const STAKEHOLDER_TYPES: { group: string; items: string[] }[] = [
  {
    group: "Внутренние",
    items: [
      "Команда проекта",
      "Функциональные руководители",
      "Топ-менеджмент",
      "Смежные отделы",
    ],
  },
  {
    group: "Внешние",
    items: [
      "Заказчики и клиенты",
      "Подрядчики и вендоры",
      "Регуляторы и органы надзора",
      "Конечные пользователи",
    ],
  },
];

const INTEREST_ROWS: {
  type: string;
  who: string;
  args: string;
}[] = [
  {
    type: "Финансовый",
    who: "Спонсор, CFO, инвестор",
    args: "ROI, бюджет, экономия, риски затрат",
  },
  {
    type: "Операционный",
    who: "Функц. руководитель, PMO",
    args: "Сроки, процессы, ресурсы, KPI",
  },
  {
    type: "Стратегический",
    who: "CEO, совет директоров",
    args: "Цели компании, конкурентное преимущество",
  },
  {
    type: "Политический",
    who: "Руководители смежных отделов",
    args: "Влияние, статус, зоны ответственности",
  },
  {
    type: "Технический",
    who: "Архитекторы, тех. лиды",
    args: "Архитектура, качество, feasibility",
  },
];

const ARGUMENT_ROWS: { type: string; sub: string; desc: string }[] = [
  {
    type: "Логическая",
    sub: "Дедуктивная",
    desc: "От общего к частному: общая закономерность → конкретный вывод для проекта",
  },
  {
    type: "Логическая",
    sub: "Индуктивная",
    desc: "От частного к общему: накопленные факты → обоснованный прогноз",
  },
  {
    type: "Риторическая",
    sub: "Эмоциональное воздействие (пафос)",
    desc: "Апелляция к ценностям, рискам для репутации, командному духу и доверию",
  },
  {
    type: "Риторическая",
    sub: "Апелляция к авторитету (этос)",
    desc: "Ссылки на экспертов, индустриальные стандарты, референсные кейсы",
  },
  {
    type: "Практическая",
    sub: "Опыт и прецеденты",
    desc: "Аналогичные проекты, ретроспективные данные, уроки из прошлого",
  },
  {
    type: "Практическая",
    sub: "Факты и метрики",
    desc: "KPI, ROI, данные мониторинга, измеримые результаты",
  },
];

const GOALS: { title: string; desc: string }[] = [
  { title: "Информирование", desc: "статус, риски, изменения в плане" },
  { title: "Согласование", desc: "решения, ресурсы, приоритеты" },
  { title: "Эскалация", desc: "блокеры, конфликты интересов, отклонения" },
  { title: "Вовлечение", desc: "получение поддержки, сбор экспертизы" },
  {
    title: "Управление ожиданиями",
    desc: "сдвиг сроков, изменение scope, пересмотр KPI",
  },
];

const MATRIX: {
  power: string;
  highInterest: string;
  lowInterest: string;
}[] = [
  {
    power: "Высокая власть",
    highInterest: "Управлять вплотную — ключевые партнёры проекта",
    lowInterest: "Держать довольными — информировать о стратегических решениях",
  },
  {
    power: "Низкая власть",
    highInterest: "Держать информированными — регулярный статус и вовлечение",
    lowInterest: "Минимальное взаимодействие — точечные обновления",
  },
];

const METHODS: { name: string; desc: string; use: string }[] = [
  {
    name: "Сократовский метод",
    desc: "Последовательные вопросы, подводящие стейкхолдера к самостоятельному выводу",
    use: "Согласование приоритетов, работа с сопротивлением",
  },
  {
    name: "Метод «PREP»",
    desc: "Position → Reason → Example → Position. Чёткая структура: тезис — обоснование — пример — повторение тезиса",
    use: "Презентации, эскалации, принятие решений",
  },
  {
    name: "«Проблема — Решение — Выгода»",
    desc: "Сначала обозначить боль стейкхолдера, затем предложить решение и показать конкретную выгоду",
    use: "Продажа идеи изменений, защита бюджета",
  },
  {
    name: "Контрфактический анализ",
    desc: "«Что будет, если мы НЕ сделаем X?» — акцент на потерях при бездействии",
    use: "Преодоление инерции, обоснование срочности",
  },
  {
    name: "Метод аналогии",
    desc: "Сравнение с известным и успешным кейсом для снижения неопределённости",
    use: "Новые инициативы, убеждение скептиков",
  },
  {
    name: "Метод «Айсберга»",
    desc: "Сначала вывод, потом детали по запросу (pyramid principle). Краткий executive summary, развёрнутые приложения — по запросу",
    use: "Коммуникация с топ-менеджментом",
  },
  {
    name: "Метод «Да, и…»",
    desc: "Принять позицию оппонента, добавить свой аргумент, не создавая конфронтации",
    use: "Управление возражениями, переговоры",
  },
  {
    name: "Стейкхолдерские нарративы",
    desc: "Перевод технических/операционных проблем в язык целей и ценностей конкретного стейкхолдера",
    use: "Финансовые споры, кросс-функциональные конфликты",
  },
];

function GuideCard({
  block,
  children,
}: {
  block: GuideBlock;
  children: React.ReactNode;
}) {
  return (
    <section id={block.id} className="scroll-mt-20">
      <header className="mb-5 sm:mb-6">
        <div className="flex items-baseline gap-4 sm:gap-5">
          <span
            className="text-sm font-semibold tabular-nums tracking-tight"
            style={{ color: `var(${block.stageVar})` }}
          >
            {block.number}
          </span>
          <div className="min-w-0 flex-1">
            <h3 className="text-balance text-xl font-semibold leading-tight tracking-tight text-foreground sm:text-2xl lg:text-3xl">
              {block.title}
            </h3>
            <p className="mt-2 max-w-2xl text-sm leading-relaxed text-muted-foreground">
              {block.lead}
            </p>
          </div>
        </div>
      </header>
      <div className="pl-0 sm:pl-9">{children}</div>
    </section>
  );
}

function GuideSection() {
  return (
    <section id="guide" className="mt-10 sm:mt-14 lg:mt-20">
      <header className="mb-6 space-y-3 sm:mb-8 lg:mb-10">
        <div className="glass-pill inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-[11px] font-medium tracking-wide text-foreground/80 sm:px-3.5 sm:text-xs">
          <span className="h-1.5 w-1.5 rounded-full bg-accent shadow-[0_0_8px_var(--accent)]" />
          Руководство для руководителей проектов
        </div>
        <h2 className="text-balance text-2xl font-semibold leading-[1.05] tracking-tight text-foreground sm:text-3xl md:text-4xl lg:text-5xl">
          Аргументация и взаимодействие
          <span className="mt-1 block bg-gradient-to-r from-[var(--stage-1)] via-[var(--stage-3)] to-[var(--stage-5)] bg-clip-text text-transparent">
            со стейкхолдерами
          </span>
        </h2>
        <p className="max-w-2xl text-sm leading-relaxed text-muted-foreground sm:text-base">
          Шесть осей анализа: от классификации стейкхолдеров до выбора метода
          аргументации.
        </p>
      </header>

      <div className="grid gap-5 sm:gap-6 lg:gap-8">
        {/* 01 — Тип стейкхолдера */}
        <GuideCard block={GUIDE_BLOCKS[0]}>
          <div className="grid gap-3 sm:grid-cols-2 sm:gap-4">
            {STAKEHOLDER_TYPES.map((g) => (
              <div
                key={g.group}
                className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-3.5 sm:p-4"
              >
                <div className="mb-2 text-[11px] font-medium uppercase tracking-wider text-foreground/70 sm:text-xs">
                  {g.group}
                </div>
                <ul className="space-y-1.5">
                  {g.items.map((it) => (
                    <li
                      key={it}
                      className="flex items-start gap-2 text-sm text-foreground/90"
                    >
                      <span
                        className="mt-1.5 h-1 w-1 shrink-0 rounded-full"
                        style={{ background: `var(${GUIDE_BLOCKS[0].stageVar})` }}
                      />
                      {it}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </GuideCard>

        {/* 02 — Тип интереса */}
        <GuideCard block={GUIDE_BLOCKS[1]}>
          {/* Mobile: stacked cards */}
          <div className="grid gap-2.5 sm:hidden">
            {INTEREST_ROWS.map((r) => (
              <div
                key={r.type}
                className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-3.5"
              >
                <div className="text-sm font-semibold text-foreground">
                  {r.type}
                </div>
                <dl className="mt-2 grid gap-1.5 text-sm">
                  <div className="grid grid-cols-[auto_1fr] gap-x-2">
                    <dt className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
                      Кто
                    </dt>
                    <dd className="text-foreground/85">{r.who}</dd>
                  </div>
                  <div className="grid grid-cols-[auto_1fr] gap-x-2">
                    <dt className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
                      Аргументы
                    </dt>
                    <dd className="text-foreground/85">{r.args}</dd>
                  </div>
                </dl>
              </div>
            ))}
          </div>
          {/* Desktop: table */}
          <div className="hidden sm:block">
            <table className="w-full border-separate border-spacing-y-1.5 text-left text-sm">
              <thead>
                <tr className="text-[11px] uppercase tracking-wider text-muted-foreground">
                  <th className="px-3 pb-1 font-medium">Тип интереса</th>
                  <th className="px-3 pb-1 font-medium">Типичные стейкхолдеры</th>
                  <th className="px-3 pb-1 font-medium">Ключевые аргументы</th>
                </tr>
              </thead>
              <tbody>
                {INTEREST_ROWS.map((r) => (
                  <tr key={r.type} className="align-top">
                    <td className="rounded-l-xl border-y border-l border-white/[0.06] bg-white/[0.02] px-3 py-2.5 font-medium text-foreground">
                      {r.type}
                    </td>
                    <td className="border-y border-white/[0.06] bg-white/[0.02] px-3 py-2.5 text-foreground/85">
                      {r.who}
                    </td>
                    <td className="rounded-r-xl border-y border-r border-white/[0.06] bg-white/[0.02] px-3 py-2.5 text-foreground/85">
                      {r.args}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </GuideCard>

        {/* 03 — Тип аргумента */}
        <GuideCard block={GUIDE_BLOCKS[2]}>
          {/* Mobile: grouped cards */}
          <div className="grid gap-2.5 sm:hidden">
            {ARGUMENT_ROWS.map((r, i) => (
              <div
                key={i}
                className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-3.5"
              >
                <div className="flex flex-wrap items-center gap-1.5">
                  <span
                    className="rounded-full px-2 py-0.5 text-[10px] font-medium uppercase tracking-wider"
                    style={{
                      background: `color-mix(in oklab, var(${GUIDE_BLOCKS[2].stageVar}) 18%, transparent)`,
                      color: `var(${GUIDE_BLOCKS[2].stageVar})`,
                    }}
                  >
                    {r.type}
                  </span>
                  <span className="text-sm font-semibold text-foreground">
                    {r.sub}
                  </span>
                </div>
                <p className="mt-1.5 text-sm leading-relaxed text-foreground/85">
                  {r.desc}
                </p>
              </div>
            ))}
          </div>
          {/* Desktop: table */}
          <div className="hidden sm:block">
            <table className="w-full border-separate border-spacing-y-1.5 text-left text-sm">
              <thead>
                <tr className="text-[11px] uppercase tracking-wider text-muted-foreground">
                  <th className="px-3 pb-1 font-medium">Тип</th>
                  <th className="px-3 pb-1 font-medium">Подвид</th>
                  <th className="px-3 pb-1 font-medium">Суть и применение</th>
                </tr>
              </thead>
              <tbody>
                {ARGUMENT_ROWS.map((r, i) => (
                  <tr key={i} className="align-top">
                    <td className="rounded-l-xl border-y border-l border-white/[0.06] bg-white/[0.02] px-3 py-2.5 font-medium text-foreground">
                      {r.type}
                    </td>
                    <td className="border-y border-white/[0.06] bg-white/[0.02] px-3 py-2.5 text-foreground/85">
                      {r.sub}
                    </td>
                    <td className="rounded-r-xl border-y border-r border-white/[0.06] bg-white/[0.02] px-3 py-2.5 text-foreground/85">
                      {r.desc}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </GuideCard>

        {/* 04 — Цель взаимодействия */}
        <GuideCard block={GUIDE_BLOCKS[3]}>
          <ul className="grid gap-2 sm:grid-cols-2 sm:gap-2.5">
            {GOALS.map((g) => (
              <li
                key={g.title}
                className="rounded-2xl border border-white/[0.06] bg-white/[0.02] px-3.5 py-3 sm:px-4"
              >
                <div className="text-sm font-semibold text-foreground">
                  {g.title}
                </div>
                <div className="mt-0.5 text-xs leading-relaxed text-muted-foreground sm:text-sm">
                  {g.desc}
                </div>
              </li>
            ))}
          </ul>
        </GuideCard>

        {/* 05 — Власть / Интерес */}
        <GuideCard block={GUIDE_BLOCKS[4]}>
          {/* Mobile: stacked cards */}
          <div className="grid gap-2.5 sm:hidden">
            {MATRIX.map((r) => (
              <div
                key={r.power}
                className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-3.5"
              >
                <div className="text-sm font-semibold text-foreground">
                  {r.power}
                </div>
                <dl className="mt-2 grid gap-2 text-sm">
                  <div>
                    <dt className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
                      Высокий интерес
                    </dt>
                    <dd className="mt-0.5 text-foreground/85">{r.highInterest}</dd>
                  </div>
                  <div>
                    <dt className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
                      Низкий интерес
                    </dt>
                    <dd className="mt-0.5 text-foreground/85">{r.lowInterest}</dd>
                  </div>
                </dl>
              </div>
            ))}
          </div>
          {/* Desktop: table */}
          <div className="hidden sm:block">
            <table className="w-full border-separate border-spacing-y-1.5 text-left text-sm">
              <thead>
                <tr className="text-[11px] uppercase tracking-wider text-muted-foreground">
                  <th className="px-3 pb-1 font-medium" />
                  <th className="px-3 pb-1 font-medium">Высокий интерес</th>
                  <th className="px-3 pb-1 font-medium">Низкий интерес</th>
                </tr>
              </thead>
              <tbody>
                {MATRIX.map((r) => (
                  <tr key={r.power} className="align-top">
                    <td className="rounded-l-xl border-y border-l border-white/[0.06] bg-white/[0.02] px-3 py-2.5 font-medium text-foreground">
                      {r.power}
                    </td>
                    <td className="border-y border-white/[0.06] bg-white/[0.02] px-3 py-2.5 text-foreground/85">
                      {r.highInterest}
                    </td>
                    <td className="rounded-r-xl border-y border-r border-white/[0.06] bg-white/[0.02] px-3 py-2.5 text-foreground/85">
                      {r.lowInterest}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </GuideCard>

        {/* 06 — Методы аргументации */}
        <GuideCard block={GUIDE_BLOCKS[5]}>
          <div className="grid gap-2.5 sm:grid-cols-2 sm:gap-3">
            {METHODS.map((m) => (
              <div
                key={m.name}
                className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-3.5 sm:p-4"
              >
                <div className="text-sm font-semibold text-foreground">
                  {m.name}
                </div>
                <p className="mt-1 text-xs leading-relaxed text-foreground/80 sm:text-sm">
                  {m.desc}
                </p>
                <div
                  className="mt-2.5 inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[10px] font-medium uppercase tracking-wider sm:text-[11px]"
                  style={{
                    background: `color-mix(in oklab, var(${GUIDE_BLOCKS[5].stageVar}) 18%, transparent)`,
                    color: `var(${GUIDE_BLOCKS[5].stageVar})`,
                  }}
                >
                  Применение
                </div>
                <p className="mt-1.5 text-xs leading-relaxed text-muted-foreground sm:text-sm">
                  {m.use}
                </p>
              </div>
            ))}
          </div>
        </GuideCard>

        {/* Принцип */}
        <div
          className="glass relative overflow-hidden rounded-2xl p-4 sm:rounded-3xl sm:p-6 lg:p-8"
          style={
            {
              "--stage-color": "var(--accent)",
              background:
                "linear-gradient(135deg, color-mix(in oklab, var(--accent) 14%, transparent), transparent 60%)",
            } as React.CSSProperties
          }
        >
          <div className="mb-2 inline-flex items-center gap-2 rounded-full bg-accent/15 px-3 py-1 text-[11px] font-medium uppercase tracking-wider text-accent">
            Ключевой принцип
          </div>
          <p className="text-sm leading-relaxed text-foreground/90 sm:text-base">
            Подбирайте метод и тип аргумента под{" "}
            <span className="font-semibold text-foreground">
              конкретного стейкхолдера
            </span>
            , а не под своё удобство. Один и тот же аргумент, поданный разными
            методами, даёт принципиально разный результат.
          </p>
        </div>
      </div>
    </section>
  );
}

