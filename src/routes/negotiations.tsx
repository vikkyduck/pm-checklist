import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/negotiations")({
  component: NegotiationsPage,
  head: () => ({
    meta: [
      { title: "Переговоры с заказчиком · PM Чек-лист" },
      {
        name: "description",
        content:
          "Подходы и инструменты для переговоров с заказчиком: ожидания, скоуп, риски и эскалации.",
      },
      {
        property: "og:title",
        content: "Переговоры с заказчиком · PM Чек-лист",
      },
      {
        property: "og:description",
        content:
          "Раздел про работу с заказчиком — управление ожиданиями, согласования, эскалации.",
      },
    ],
  }),
});

function NegotiationsPage() {
  return (
    <main className="relative min-h-screen overflow-hidden">
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div
          className="absolute -top-40 -left-40 h-[480px] w-[480px] rounded-full blur-3xl opacity-40"
          style={{ background: "var(--stage-3)" }}
        />
        <div
          className="absolute bottom-0 right-0 h-[420px] w-[420px] rounded-full blur-3xl opacity-30"
          style={{ background: "var(--stage-5)" }}
        />
      </div>

      <div className="relative z-10 mx-auto max-w-4xl px-6 py-16 lg:px-10 lg:py-24">
        <div className="glass-pill mb-6 inline-flex items-center gap-2 rounded-full px-3.5 py-1.5 text-xs font-medium tracking-wide text-foreground/80">
          <span className="h-1.5 w-1.5 rounded-full bg-accent shadow-[0_0_8px_var(--accent)]" />
          Раздел в разработке
        </div>
        <h1 className="text-balance text-4xl font-semibold leading-[1.05] tracking-tight text-foreground sm:text-5xl">
          Переговоры с заказчиком
          <span className="block bg-gradient-to-r from-[var(--stage-3)] via-[var(--stage-4)] to-[var(--stage-5)] bg-clip-text text-transparent">
            ожидания, скоуп, эскалации
          </span>
        </h1>
        <p className="mt-6 max-w-2xl text-base leading-relaxed text-muted-foreground">
          Здесь будут практики работы с заказчиком: как фиксировать
          договорённости, как сообщать плохие новости, как защищать скоуп и
          выстраивать эскалации. Скоро появится контент.
        </p>

        <div className="glass mt-10 grid gap-3 rounded-3xl p-6 sm:grid-cols-2">
          {[
            { t: "Ожидания", d: "Синхронизация целей, рамок и критериев успеха" },
            { t: "Скоуп", d: "Защита границ и работа с change request" },
            { t: "Плохие новости", d: "Как сообщать о срывах и рисках без потери доверия" },
            { t: "Эскалации", d: "Когда и как поднимать вопрос на уровень выше" },
          ].map((b) => (
            <div
              key={b.t}
              className="glass-soft rounded-2xl p-4 text-sm leading-relaxed text-foreground/85"
            >
              <div className="mb-1 text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
                Тема
              </div>
              <div className="text-base font-medium text-foreground">{b.t}</div>
              <div className="mt-1 text-xs text-muted-foreground">{b.d}</div>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
