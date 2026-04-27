import { Link, useLocation } from "@tanstack/react-router";
import { ChevronRight } from "lucide-react";

type Crumb = { label: string; to?: string };

const ROUTE_LABELS: Record<string, string> = {
  "/": "Митигирование рисков",
  "/negotiations": "Переговоры",
  "/resource-state": "Ресурсное состояние",
  "/resource-radar": "Радар ресурсности",
};

const PARENT: Record<string, string> = {
  "/resource-radar": "/resource-state",
};

function buildTrail(pathname: string): Crumb[] {
  const trail: Crumb[] = [];
  let current: string | undefined = pathname;
  const seen = new Set<string>();

  while (current && !seen.has(current)) {
    seen.add(current);
    const label = ROUTE_LABELS[current] ?? current;
    trail.unshift({ label, to: current });
    current = PARENT[current];
  }

  if (pathname !== "/") {
    trail.unshift({ label: "Practice", to: "/" });
  }

  if (trail.length > 0) {
    trail[trail.length - 1] = { label: trail[trail.length - 1].label };
  }

  return trail;
}

export function Breadcrumbs() {
  const { pathname } = useLocation();
  const trail = buildTrail(pathname);

  if (trail.length <= 1) return null;

  return (
    <nav
      aria-label="Хлебные крошки"
      className="mx-auto w-full max-w-6xl px-4 pt-3 pb-1 sm:px-6 lg:px-10"
    >
      <ol
        className="flex flex-wrap items-center gap-x-2 gap-y-1 text-[10.5px] uppercase tracking-[0.12em]"
        style={{ fontFamily: "var(--font-mono)" }}
      >
        {trail.map((crumb, i) => {
          const isLast = i === trail.length - 1;
          return (
            <li key={`${crumb.label}-${i}`} className="flex items-center gap-2">
              {i > 0 && (
                <ChevronRight
                  className="h-3 w-3 text-[var(--hairline-strong)]"
                  aria-hidden
                />
              )}
              {crumb.to && !isLast ? (
                <Link
                  to={crumb.to}
                  className="text-muted-foreground transition-colors hover:text-foreground"
                >
                  {crumb.label}
                </Link>
              ) : (
                <span className="text-foreground/90" aria-current="page">
                  {crumb.label}
                </span>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
