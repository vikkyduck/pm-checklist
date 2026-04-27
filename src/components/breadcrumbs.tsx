import { Link, useLocation } from "@tanstack/react-router";
import { ChevronRight, Home } from "lucide-react";

type Crumb = { label: string; to?: string };

const ROUTE_LABELS: Record<string, string> = {
  "/": "Главная",
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
    trail.unshift({ label: ROUTE_LABELS["/"], to: "/" });
  }

  // The current page (last item) shouldn't be a link
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
      className="mx-auto w-full max-w-5xl px-4 pt-[max(3.5rem,calc(env(safe-area-inset-top)+3rem))] pb-2 sm:px-6 sm:pt-14 lg:px-10"
    >
      <ol className="flex flex-wrap items-center gap-1.5 text-[11px] text-muted-foreground sm:text-xs">
        {trail.map((crumb, i) => {
          const isLast = i === trail.length - 1;
          return (
            <li key={`${crumb.label}-${i}`} className="flex items-center gap-1.5">
              {i > 0 && (
                <ChevronRight className="h-3 w-3 text-[var(--hairline-strong)]" />
              )}
              {crumb.to && !isLast ? (
                <Link
                  to={crumb.to}
                  className="inline-flex items-center gap-1 rounded-md px-1.5 py-0.5 transition-colors hover:bg-[var(--surface)] hover:text-foreground"
                >
                  {i === 0 && <Home className="h-3 w-3" />}
                  {crumb.label}
                </Link>
              ) : (
                <span
                  className="inline-flex items-center gap-1 px-1.5 py-0.5 font-medium text-foreground"
                  aria-current="page"
                >
                  {i === 0 && <Home className="h-3 w-3" />}
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
