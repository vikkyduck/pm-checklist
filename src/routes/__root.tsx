
import { Outlet, Link, createRootRoute, HeadContent, Scripts } from "@tanstack/react-router";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { DevNavSidebar } from "@/components/dev-nav-sidebar";
import { Breadcrumbs } from "@/components/breadcrumbs";

import appCss from "../styles.css?url";

function NotFoundComponent() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <div className="eyebrow mb-4">Error 404</div>
        <h1
          className="text-foreground"
          style={{ fontFamily: "var(--font-display)", fontSize: "5rem", lineHeight: 1, letterSpacing: "-0.04em" }}
        >
          Страница{" "}
          <em style={{ fontStyle: "italic", color: "var(--accent)" }}>не найдена</em>
        </h1>
        <p className="mt-5 text-sm text-muted-foreground">
          Возможно, страница была перемещена или адрес введён неверно.
        </p>
        <div className="mt-7">
          <Link to="/" className="btn-primary">
            На главную
          </Link>
        </div>
      </div>
    </div>
  );
}

export const Route = createRootRoute({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1, viewport-fit=cover" },
      { name: "theme-color", content: "#1a1f2e" },
      { title: "Practice — навигатор PM" },
      { name: "description", content: "Навигатор для руководителя проекта: митигирование рисков, ресурсное состояние, переговоры с заказчиком." },
      { name: "author", content: "Practice" },
      { property: "og:title", content: "Practice — навигатор PM" },
      { property: "og:description", content: "Навигатор для руководителя проекта: митигирование рисков, ресурсное состояние, переговоры с заказчиком." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: "Practice — навигатор PM" },
      { name: "twitter:description", content: "Навигатор для руководителя проекта: митигирование рисков, ресурсное состояние, переговоры с заказчиком." },
      { property: "og:image", content: "https://storage.googleapis.com/gpt-engineer-file-uploads/attachments/og-images/659939e4-7216-443c-ac37-e24043447c90" },
      { name: "twitter:image", content: "https://storage.googleapis.com/gpt-engineer-file-uploads/attachments/og-images/659939e4-7216-443c-ac37-e24043447c90" },
    ],
    links: [
      {
        rel: "stylesheet",
        href: appCss,
      },
    ],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
});

function RootShell({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ru">
      <head>
        <HeadContent />
      </head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  );
}

function RootComponent() {
  return (
    <SidebarProvider defaultOpen={false}>
      <div className="flex min-h-screen w-full">
        <DevNavSidebar />
        <div className="relative min-w-0 flex-1">
          {/* Top action bar — hosts trigger + breadcrumbs in flow, no overlap */}
          <div className="sticky top-0 z-40 backdrop-blur-md bg-background/70 border-b border-[var(--hairline)]/60">
            <div className="mx-auto flex w-full max-w-6xl items-center gap-2 px-3 py-2 sm:gap-3 sm:px-6 lg:px-10">
              <SidebarTrigger
                className="h-8 w-8 shrink-0 rounded-full border border-[var(--hairline)] bg-background/60 text-foreground/80 transition-colors hover:bg-background/90 hover:text-foreground"
                aria-label="Открыть навигацию"
              />
              <div className="min-w-0 flex-1">
                <Breadcrumbs />
              </div>
            </div>
          </div>
          <Outlet />
        </div>
      </div>
    </SidebarProvider>
  );
}
