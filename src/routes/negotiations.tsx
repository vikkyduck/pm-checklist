import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useRef } from "react";
import { useAuth } from "@/hooks/use-auth";

export const Route = createFileRoute("/negotiations")({
  component: NegotiationsPage,
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

function NegotiationsPage() {
  const navigate = useNavigate();
  const { user, ready, logout } = useAuth();

  useEffect(() => {
    if (ready && !user) navigate({ to: "/login", replace: true });
  }, [ready, user, navigate]);

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
          className="absolute -top-40 -left-40 h-[480px] w-[480px] rounded-full blur-3xl opacity-40 animate-float-slow"
          style={{ background: "var(--stage-4)" }}
        />
        <div
          className="absolute top-1/3 -right-32 h-[520px] w-[520px] rounded-full blur-3xl opacity-35 animate-float-slow"
          style={{ background: "var(--stage-3)", animationDelay: "-4s" }}
        />
        <div
          className="absolute bottom-0 left-1/4 h-[460px] w-[460px] rounded-full blur-3xl opacity-35 animate-float-slow"
          style={{ background: "var(--stage-5)", animationDelay: "-8s" }}
        />
      </div>

      <div
        ref={ambientRef}
        className="pointer-events-none fixed inset-0 z-0"
        style={{
          background:
            "radial-gradient(600px circle at var(--mx, 50%) var(--my, 50%), oklch(1 0 0 / 0.06), transparent 50%)",
        }}
      />

      <div className="relative z-10 mx-auto max-w-6xl px-6 py-10 lg:px-10 lg:py-14">
        {/* Top bar */}
        <div className="mb-8 flex items-center justify-between gap-3">
          <Link
            to="/"
            className="glass-pill inline-flex items-center gap-2 rounded-full px-3.5 py-1.5 text-xs font-medium text-foreground/85 transition-colors hover:text-foreground"
          >
            <span aria-hidden>←</span>
            <span>К чек-листу</span>
          </Link>
          {user && (
            <button
              onClick={logout}
              className="glass-pill rounded-full px-3.5 py-1.5 text-xs text-muted-foreground transition-colors hover:text-foreground"
            >
              Выйти
            </button>
          )}
        </div>

        {/* Hero */}
        <header className="mb-12 space-y-4 lg:mb-16">
          <div className="glass-pill inline-flex items-center gap-2 rounded-full px-3.5 py-1.5 text-xs font-medium tracking-wide text-foreground/80">
            <span className="h-1.5 w-1.5 rounded-full bg-accent shadow-[0_0_8px_var(--accent)]" />
            Практика
          </div>
          <h1 className="text-balance text-4xl font-semibold leading-[1.05] tracking-tight text-foreground sm:text-5xl lg:text-6xl">
            Переговоры в&nbsp;ресурсном состоянии
            <span className="mt-2 block bg-gradient-to-r from-[var(--stage-4)] via-[var(--stage-3)] to-[var(--stage-5)] bg-clip-text text-transparent">
              четыре уровня ассертивности
            </span>
          </h1>
          <p className="max-w-2xl text-base leading-relaxed text-muted-foreground">
            Чтобы вернуть ассертивность — способность уверенно и экологично
            отстаивать свои границы и позицию — нужно восстановить ресурс.
            Энергия — это способность выполнять работу, и ассертивность требует
            высокого её уровня сразу на четырёх уровнях.
          </p>

          {/* Quick nav */}
          <nav className="mt-6 flex flex-wrap gap-2">
            {LEVELS.map((l) => (
              <a
                key={l.id}
                href={`#${l.id}`}
                className="glass-soft rounded-full px-3.5 py-1.5 text-xs font-medium text-foreground/80 transition-colors hover:text-foreground"
              >
                <span className="mr-1.5 text-muted-foreground">{l.number}</span>
                {l.title}
              </a>
            ))}
          </nav>
        </header>

        {/* Levels */}
        <div className="grid gap-6 lg:gap-8">
          {LEVELS.map((level, idx) => (
            <article
              key={level.id}
              id={level.id}
              className="glass stage-glow relative overflow-hidden rounded-3xl p-6 lg:p-10"
              style={
                {
                  "--stage-color": `var(${level.stageVar})`,
                  animationDelay: `${idx * 60}ms`,
                } as React.CSSProperties
              }
            >
              {/* number watermark */}
              <span
                aria-hidden
                className="pointer-events-none absolute -right-4 -top-6 select-none text-[120px] font-semibold leading-none tracking-tighter opacity-[0.06] lg:text-[180px]"
                style={{ color: `var(${level.stageVar})` }}
              >
                {level.number}
              </span>

              <div className="relative grid gap-8 lg:grid-cols-12">
                {/* Header column */}
                <div className="lg:col-span-4">
                  <div
                    className="mb-3 inline-flex items-center gap-2 rounded-full px-3 py-1 text-[11px] font-medium uppercase tracking-wider"
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
                  <h2 className="text-2xl font-semibold leading-tight tracking-tight text-foreground lg:text-3xl">
                    {level.title}
                  </h2>
                  <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                    {level.subtitle}
                  </p>
                </div>

                {/* Body */}
                <div className="space-y-5 lg:col-span-8">
                  <p className="text-base leading-relaxed text-foreground/90">
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
        <section className="mt-12">
          <div className="glass rounded-3xl p-6 lg:p-8">
            <div className="mb-3 flex items-center gap-2">
              <span className="h-1.5 w-1.5 rounded-full bg-accent shadow-[0_0_8px_var(--accent)]" />
              <h2 className="text-sm font-medium uppercase tracking-wider text-foreground/80">
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
