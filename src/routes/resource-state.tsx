import { createFileRoute, Link } from "@tanstack/react-router";
import { Radar, ArrowRight } from "lucide-react";
import { DisclosureBox } from "@/components/disclosure-box";

export const Route = createFileRoute("/resource-state")({
  component: ResourceStatePage,
  head: () => ({
    meta: [
      { title: "Ресурсное состояние · Practice" },
      {
        name: "description",
        content:
          "Как вернуть ассертивность через четыре уровня ресурса: смысл, интеллект, эмоции и тело.",
      },
      {
        property: "og:title",
        content: "Ресурсное состояние · Practice",
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
  },
];

function ResourceStatePage() {
  return (
    <main className="relative min-h-screen">
      <div className="relative z-10 mx-auto max-w-4xl px-4 py-10 sm:px-6 sm:py-14 lg:px-10 lg:py-20">
        {/* Hero */}
        <header className="mb-10 sm:mb-14 lg:mb-20">
          <div className="eyebrow mb-6">Раздел 02 · Ресурсное состояние</div>
          <h1 className="text-balance text-foreground display text-[2.25rem] sm:text-5xl md:text-6xl lg:text-[5.25rem]">
            Четыре уровня{" "}
            <em className="display-italic" style={{ color: "var(--accent)" }}>
              ассертивности
            </em>
          </h1>
          <p className="lede mt-6 max-w-2xl">
            Чтобы вернуть ассертивность — способность уверенно и экологично
            отстаивать свои границы — нужно восстановить ресурс на четырёх
            уровнях.
          </p>

          {/* Radar CTA — hero card */}
          <Link
            to="/resource-radar"
            className="surface group mt-10 flex items-center justify-between gap-4 rounded-xl p-4 transition-colors hover:bg-[var(--surface-strong)] sm:mt-12 sm:p-5"
          >
            <div className="flex min-w-0 items-center gap-4">
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[var(--surface-strong)] border border-[var(--hairline)]">
                <Radar className="h-5 w-5 text-accent" />
              </span>
              <div className="min-w-0">
                <div className="eyebrow mb-1.5">Шаг 1 · диагностика</div>
                <div className="text-[15px] font-medium text-foreground sm:text-base" style={{ fontFamily: "var(--font-sans)" }}>
                  Определите свой ведущий уровень
                </div>
                <p className="mt-1 text-[12.5px] text-muted-foreground sm:text-[13px]">
                  Опросник на 5 минут — узнайте свой архетип восстановления
                </p>
              </div>
            </div>
            <ArrowRight className="h-4 w-4 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-1 group-hover:text-foreground" />
          </Link>

          {/* Quick nav */}
          <div className="hairline mt-10" />
          <div className="mt-6">
            <div className="eyebrow mb-3">Уровни</div>
            <nav className="-mx-4 flex gap-1 overflow-x-auto px-4 sm:mx-0 sm:flex-wrap sm:px-0">
              {LEVELS.map((l) => (
                <a
                  key={l.id}
                  href={`#${l.id}`}
                  className="group inline-flex shrink-0 items-center gap-2 rounded-full border border-[var(--hairline)] px-3 py-1.5 text-[12px] font-medium text-foreground/80 transition-colors hover:border-[var(--hairline-strong)] hover:text-foreground"
                >
                  <span className="num text-muted-foreground">{l.number}</span>
                  {l.title}
                </a>
              ))}
            </nav>
          </div>
        </header>

        {/* Levels — каждый в раскрывающемся боксе */}
        <div className="space-y-3">
          {LEVELS.map((level) => (
            <DisclosureBox
              key={level.id}
              id={level.id}
              number={level.number}
              accentVar={level.stageVar}
              title={level.title}
              subtitle={level.subtitle}
              meta="3 раздела"
            >
              <div className="space-y-4">
                <p className="text-sm leading-relaxed text-foreground/90 sm:text-[15px]">
                  {level.intro}
                </p>

                {/* Вложенные боксы — каждая рекомендация сворачивается */}
                <div className="space-y-2">
                  <DisclosureBox
                    title="Диагностика"
                    subtitle="Как понять, что вы здесь"
                    accentVar={level.stageVar}
                  >
                    <p className="text-sm leading-relaxed text-foreground/85">
                      {level.diagnosis}
                    </p>
                  </DisclosureBox>

                  <DisclosureBox
                    title={`Инструмент · ${level.tool.name}`}
                    subtitle="Что применить, чтобы вернуть ресурс"
                    accentVar={level.stageVar}
                  >
                    <p className="text-sm leading-relaxed text-foreground/85">
                      {level.tool.body}
                    </p>
                  </DisclosureBox>

                  <DisclosureBox
                    title="Действие"
                    subtitle="Конкретный шаг прямо сейчас"
                    accentVar={level.stageVar}
                  >
                    <p className="text-sm leading-relaxed text-foreground/85">
                      {level.action}
                    </p>
                  </DisclosureBox>
                </div>
              </div>
            </DisclosureBox>
          ))}
        </div>

        {/* Footer summary */}
        <section className="mt-16 sm:mt-20 lg:mt-28">
          <div className="hairline mb-6" />
          <div className="border-l-2 border-accent pl-5">
            <div className="eyebrow mb-2 text-accent">Как пользоваться</div>
            <p className="max-w-3xl text-sm leading-relaxed text-foreground/85 sm:text-base">
              Четыре уровня — это не чек-лист «закрой каждый». У каждого есть{" "}
              <span className="font-semibold text-foreground">
                свой ведущий уровень восстановления
              </span>
              : кто-то возвращает ассертивность через смысл, кто-то — через
              ясность мысли, эмоции или тело. Чтобы понять свой тип, пройдите{" "}
              <Link
                to="/resource-radar"
                className="font-semibold text-accent underline-offset-4 hover:underline"
              >
                Радар ресурсности
              </Link>{" "}
              — он покажет ваш архетип. Дальше читайте рекомендации именно по
              своему ведущему уровню: оттуда восстановление пойдёт быстрее
              всего, а остальные блоки подтянутся следом.
            </p>
          </div>
        </section>
      </div>
    </main>
  );
}
