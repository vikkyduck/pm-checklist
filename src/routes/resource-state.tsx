import { createFileRoute } from "@tanstack/react-router";
export const Route = createFileRoute("/resource-state")({
  component: ResourceStatePage,
  head: () => ({
    meta: [
      { title: "Переговоры в ресурсном состоянии · PM Чек-лист" },
      {
        name: "description",
        content:
          "Как вернуть ассертивность через четыре уровня ресурса: смысл, интеллект, эмоции и тело.",
      },
      {
        property: "og:title",
        content: "Переговоры в ресурсном состоянии · PM Чек-лист",
      },
      {
        property: "og:description",
        content:
          "Четырёхуровневая модель восстановления ассертивности перед сложным разговором.",
      },
    ],
  }),
});

type Level = {
  id: string;
  number: string;
  title: string;
  subtitle: string;
  intro: string;
  diagnosis: string;
  tool: { name: string; body: string };
  action: string;
  stageVar: string;
  hue: string;
};

const LEVELS: Level[] = [
  {
    id: "essence",
    number: "01",
    title: "Сущностный уровень",
    subtitle: "Ассертивность как архитектура смысла",
    intro:
      "Ответ на вопрос: «На каком основании я имею право это утверждать?». Если вы чувствуете экзистенциальный вакуум или задавленность оперативкой — ваша позиция будет слабой.",
    diagnosis:
      "Вы чувствуете потерю собственной роли в метапроцессах и не понимаете, ради чего вступаете в спор.",
    tool: {
      name: "Аксиологическая калибровка",
      body: "Соотнесите требование ситуации с вашими личными ценностями. Если конфликт затрагивает то, что для вас супер-важно, ассертивность вернётся автоматически как форма защиты ваших смыслов.",
    },
    action:
      "Визуализируйте позитивный образ собственного будущего. Поймите, как этот диалог влияет на вашу личную историю. Это даёт масштаб, на фоне которого страх перед собеседником исчезает.",
    stageVar: "--stage-4",
    hue: "indigo",
  },
  {
    id: "intellect",
    number: "02",
    title: "Интеллектуальный уровень",
    subtitle: "Ассертивность как когнитивная ясность",
    intro:
      "Способность мозга выдать чёткое аргументированное «нет» или «да». Энергию здесь забирает информационная перегруженность и многозадачность.",
    diagnosis:
      "Вы ловите себя на выполнении дел на автомате и не можете найти нестандартный ответ на давление.",
    tool: {
      name: "Интеллектуальный дебаггинг",
      body: "Вместо стереотипных реакций примените творческую активность. Сформулируйте проблему как интеллектуальный вызов.",
    },
    action:
      "Сделайте зарядку для мозга прямо во время переговоров — осознанно переключите фокус на концентрацию внимания. Это вернёт вас из режима автопилота в режим управления дискуссией.",
    stageVar: "--stage-3",
    hue: "aqua",
  },
  {
    id: "emotion",
    number: "03",
    title: "Эмоциональный уровень",
    subtitle: "Ассертивность как баланс уважения",
    intro:
      "Точка, где самоуважение и уважение к другим — обязательное условие. Если вы сваливаетесь в агрессию, страх или чувство вины, вы теряете ассертивность.",
    diagnosis:
      "Появление деперсонализации — негативного или циничного отношения к собеседнику. Вы чувствуете себя на пределе возможностей.",
    tool: {
      name: "Матрица эмоциональности",
      body: "Осознайте, в какой зоне вы сейчас находитесь — в позитиве или негативе. Ассертивность возможна только при высоком уровне энергии и позитиве.",
    },
    action:
      "Используйте позитивное мышление и улыбку как физиологический триггер. Найдите повод для искренней эмпатии к оппоненту. Это позволит не принимать его атаку на свой счёт и сохранить самоуважение.",
    stageVar: "--stage-5",
    hue: "magenta",
  },
  {
    id: "body",
    number: "04",
    title: "Физический уровень",
    subtitle: "Ассертивность как биологический ресурс",
    intro:
      "Ваше тело — транслятор уверенности. Физическое истощение и вялость делают ассертивное поведение физиологически невозможным.",
    diagnosis:
      "Вы чувствуете мышечный панцирь в плечах и общее снижение физиологической работоспособности.",
    tool: {
      name: "Индивидуальный биологический профиль",
      body: "Учитывайте свои циркадные ритмы. Если вы «сова», не пытайтесь быть ассертивным в 9 утра — назначайте сложные разговоры на пик своей формы.",
    },
    action:
      "Используйте упражнения для плеч и шеи прямо на месте. Это снимет дискомфорт и позволит голосу звучать свободнее. Ассертивность требует полной бодрости.",
    stageVar: "--stage-2",
    hue: "mint",
  },
];

function ResourceStatePage() {
  return (
    <main className="relative min-h-screen">
      <div className="relative z-10 mx-auto max-w-4xl px-4 py-10 sm:px-6 sm:py-14 lg:px-10 lg:py-20">
        {/* Hero */}
        <header className="mb-10 sm:mb-14 lg:mb-20">
          <div className="pl-12 sm:pl-14 lg:pl-0">
            <div className="eyebrow mb-5">Ресурсное состояние</div>
            <h1 className="text-balance text-[2rem] font-semibold leading-[1.04] tracking-[-0.025em] text-foreground sm:text-5xl md:text-6xl lg:text-[4.5rem]">
              Четыре уровня ассертивности
            </h1>
            <p className="mt-4 max-w-2xl text-base leading-snug text-muted-foreground sm:text-lg">
              Чтобы вернуть ассертивность — способность уверенно и экологично
              отстаивать свои границы — нужно восстановить ресурс на четырёх
              уровнях.
            </p>
          </div>

          {/* Quick nav */}
          <nav className="-mx-4 mt-8 flex gap-1 overflow-x-auto px-4 sm:mx-0 sm:flex-wrap sm:px-0">
            {LEVELS.map((l) => (
              <a
                key={l.id}
                href={`#${l.id}`}
                className="group inline-flex shrink-0 items-center gap-2 rounded-full border border-[var(--hairline)] px-3 py-1.5 text-[11px] font-medium text-foreground/80 transition-colors hover:border-[var(--hairline-strong)] hover:text-foreground sm:text-xs"
              >
                <span className="text-muted-foreground">{l.number}</span>
                {l.title}
              </a>
            ))}
          </nav>
        </header>

        {/* Levels */}
        <div className="grid gap-5 sm:gap-6 lg:gap-8">
          {LEVELS.map((level, idx) => (
            <article
              key={level.id}
              id={level.id}
              className="glass stage-glow relative overflow-hidden rounded-2xl p-4 sm:rounded-3xl sm:p-6 lg:p-10"
              style={
                {
                  "--stage-color": `var(${level.stageVar})`,
                  animationDelay: `${idx * 60}ms`,
                } as React.CSSProperties
              }
            >
              <span
                aria-hidden
                className="pointer-events-none absolute -right-3 -top-4 select-none text-[90px] font-semibold leading-none tracking-tighter opacity-[0.06] sm:-right-4 sm:-top-6 sm:text-[120px] lg:text-[180px]"
                style={{ color: `var(${level.stageVar})` }}
              >
                {level.number}
              </span>

              <div className="relative grid gap-5 sm:gap-8 lg:grid-cols-12">
                <div className="lg:col-span-4">
                  <div
                    className="mb-3 inline-flex items-center gap-2 rounded-full px-2.5 py-1 text-[10px] font-medium uppercase tracking-wider sm:px-3 sm:text-[11px]"
                    style={{
                      background: `color-mix(in oklab, var(${level.stageVar}) 18%, transparent)`,
                      color: `var(${level.stageVar})`,
                    }}
                  >
                    <span
                      className="h-1.5 w-1.5 rounded-full"
                      style={{
                        background: `var(${level.stageVar})`,
                        boxShadow: `0 0 10px var(${level.stageVar})`,
                      }}
                    />
                    Уровень {level.number}
                  </div>
                  <h2 className="text-xl font-semibold leading-tight tracking-tight text-foreground sm:text-2xl lg:text-3xl">
                    {level.title}
                  </h2>
                  <p className="mt-2 text-xs leading-relaxed text-muted-foreground sm:text-sm">
                    {level.subtitle}
                  </p>
                </div>

                <div className="space-y-4 sm:space-y-5 lg:col-span-8">
                  <p className="text-sm leading-relaxed text-foreground/90 sm:text-base">
                    {level.intro}
                  </p>

                  <div className="grid gap-3 sm:grid-cols-3">
                    <Block label="Диагностика" tone="muted">
                      {level.diagnosis}
                    </Block>
                    <Block
                      label={`Инструмент · ${level.tool.name}`}
                      tone="accent"
                      stageVar={level.stageVar}
                    >
                      {level.tool.body}
                    </Block>
                    <Block label="Действие" tone="muted">
                      {level.action}
                    </Block>
                  </div>
                </div>
              </div>
            </article>
          ))}
        </div>

        {/* Footer summary */}
        <section className="mt-8 sm:mt-12">
          <div className="glass rounded-2xl p-5 sm:rounded-3xl sm:p-6 lg:p-8">
            <div className="mb-3 flex items-center gap-2">
              <span className="h-1.5 w-1.5 rounded-full bg-accent shadow-[0_0_8px_var(--accent)]" />
              <h2 className="text-xs font-medium uppercase tracking-wider text-foreground/80 sm:text-sm">
                Памятка
              </h2>
            </div>
            <p className="max-w-3xl text-sm leading-relaxed text-foreground/85">
              Перед сложным разговором задайте себе четыре вопроса:{" "}
              <span className="text-foreground">зачем мне это</span> (смысл),{" "}
              <span className="text-foreground">что именно я отстаиваю</span>{" "}
              (интеллект),{" "}
              <span className="text-foreground">в какой я зоне</span> (эмоции),{" "}
              <span className="text-foreground">готово ли тело</span>{" "}
              (физика). Если хоть один уровень в дефиците — сначала восстановите
              ресурс, потом идите в переговоры.
            </p>
          </div>
        </section>
      </div>
    </main>
  );
}

function Block({
  label,
  children,
  tone,
  stageVar,
}: {
  label: string;
  children: React.ReactNode;
  tone: "muted" | "accent";
  stageVar?: string;
}) {
  if (tone === "accent") {
    return (
      <div
        className="relative overflow-hidden rounded-2xl p-4"
        style={{
          background: stageVar
            ? `linear-gradient(135deg, color-mix(in oklab, var(${stageVar}) 22%, transparent), color-mix(in oklab, var(${stageVar}) 6%, transparent))`
            : undefined,
          border: stageVar
            ? `1px solid color-mix(in oklab, var(${stageVar}) 35%, transparent)`
            : undefined,
        }}
      >
        <div
          className="mb-2 text-[10px] font-medium uppercase tracking-wider"
          style={{ color: stageVar ? `var(${stageVar})` : undefined }}
        >
          {label}
        </div>
        <p className="text-sm leading-relaxed text-foreground/90">{children}</p>
      </div>
    );
  }

  return (
    <div className="glass-soft rounded-2xl p-4">
      <div className="mb-2 text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
        {label}
      </div>
      <p className="text-sm leading-relaxed text-foreground/85">{children}</p>
    </div>
  );
}
