import { useState, type ReactNode } from "react";

type Props = {
  /** Маленький лейбл слева (например, номер «01» или «Уровень 02») */
  number?: string;
  /** Цвет акцента — CSS-переменная, например "--stage-2" */
  accentVar?: string;
  /** Главный заголовок бокса */
  title: ReactNode;
  /** Подзаголовок / короткое описание под заголовком */
  subtitle?: ReactNode;
  /** Маленькая метка справа (например, "3 / 4") */
  meta?: ReactNode;
  /** Открыт ли бокс по умолчанию */
  defaultOpen?: boolean;
  /** Контролируемое состояние (опционально) */
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  /** id для якорной навигации */
  id?: string;
  /** Дополнительный класс для внешнего контейнера */
  className?: string;
  children: ReactNode;
};

/**
 * Editorial-style раскрывающийся бокс.
 * Используется для упаковки длинных рекомендаций / блоков чек-листа,
 * чтобы вся страница помещалась в обзорный список.
 */
export function DisclosureBox({
  number,
  accentVar,
  title,
  subtitle,
  meta,
  defaultOpen = false,
  open: openProp,
  onOpenChange,
  id,
  className,
  children,
}: Props) {
  const [internalOpen, setInternalOpen] = useState(defaultOpen);
  const isControlled = openProp !== undefined;
  const open = isControlled ? !!openProp : internalOpen;

  function handleToggle() {
    const next = !open;
    if (!isControlled) setInternalOpen(next);
    onOpenChange?.(next);
  }

  return (
    <section
      id={id}
      className={[
        "surface group/box relative overflow-hidden rounded-2xl border transition-all duration-300 animate-fade-up scroll-mt-20",
        open
          ? "border-[var(--hairline-strong)] bg-[var(--surface-strong)]/40 shadow-[var(--shadow-md)]"
          : "border-[var(--hairline)] bg-[var(--surface)] hover:-translate-y-px hover:border-[var(--hairline-strong)] hover:bg-[var(--surface-strong)]/60",
        className ?? "",
      ].join(" ")}
    >
      {/* Top accent bar — visible when open */}
      {accentVar && (
        <span
          aria-hidden
          className={[
            "absolute inset-x-5 top-0 h-[2px] rounded-b-full transition-opacity duration-300 sm:inset-x-6",
            open ? "opacity-100" : "opacity-0 group-hover/box:opacity-60",
          ].join(" ")}
          style={{ background: `var(${accentVar})` }}
        />
      )}

      <button
        type="button"
        onClick={handleToggle}
        aria-expanded={open}
        className="flex w-full cursor-pointer items-start justify-between gap-4 px-5 py-4 text-left transition-colors sm:px-6 sm:py-5"
      >
        <div className="flex min-w-0 flex-1 items-baseline gap-4 sm:gap-5">
          {number && (
            <span
              className="num shrink-0 text-sm font-semibold tabular-nums tracking-tight"
              style={{ color: accentVar ? `var(${accentVar})` : "var(--muted-foreground)" }}
            >
              {number}
            </span>
          )}
          <div className="min-w-0 flex-1">
            <h3
              className="text-balance text-[17px] font-semibold leading-snug tracking-tight text-foreground sm:text-[19px]"
              style={{ fontFamily: "var(--font-sans)", letterSpacing: "-0.012em" }}
            >
              {title}
            </h3>
            {subtitle && (
              <p className="mt-1.5 text-xs leading-relaxed text-muted-foreground sm:text-[13px]">
                {subtitle}
              </p>
            )}
          </div>
        </div>
        <div className="flex shrink-0 items-center gap-3">
          {meta && (
            <span
              className="hidden text-[10.5px] uppercase tracking-[0.12em] text-muted-foreground sm:inline"
              style={{ fontFamily: "var(--font-mono)" }}
            >
              {meta}
            </span>
          )}
          <Chevron open={open} />
        </div>
      </button>

      {/* Content — animated grid trick */}
      <div
        className="grid transition-[grid-template-rows] duration-400 ease-out"
        style={{ gridTemplateRows: open ? "1fr" : "0fr" }}
      >
        <div className="overflow-hidden">
          <div className="border-t border-[var(--hairline)] px-5 py-5 sm:px-6 sm:py-6">
            {children}
          </div>
        </div>
      </div>
    </section>
  );
}

function Chevron({ open }: { open: boolean }) {
  return (
    <span
      className={[
        "flex h-7 w-7 items-center justify-center rounded-full border border-[var(--hairline)] bg-background/40 text-muted-foreground transition-all duration-300",
        open ? "rotate-180 border-[var(--hairline-strong)] text-foreground" : "group-hover/box:text-foreground",
      ].join(" ")}
      aria-hidden
    >
      <svg
        width="13"
        height="13"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="m6 9 6 6 6-6" />
      </svg>
    </span>
  );
}
