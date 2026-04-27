
import { Outlet, Link, createRootRoute, HeadContent, Scripts } from "@tanstack/react-router";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { DevNavSidebar } from "@/components/dev-nav-sidebar";

import appCss from "../styles.css?url";

function NotFoundComponent() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-7xl font-bold text-foreground">404</h1>
        <h2 className="mt-4 text-xl font-semibold text-foreground">Page not found</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <div className="mt-6">
          <Link
            to="/"
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Go home
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
      { name: "description", content: "Спокойный, сфокусированный навигатор для руководителя проекта: митигирование рисков, ресурсное состояние, переговоры с заказчиком." },
      { name: "author", content: "Practice" },
      { property: "og:title", content: "Practice — навигатор PM" },
      { property: "og:description", content: "Спокойный, сфокусированный навигатор для руководителя проекта." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: "Practice — навигатор PM" },
      { name: "twitter:description", content: "Спокойный, сфокусированный навигатор для руководителя проекта." },
      { property: "og:image", content: "https://pub-bb2e103a32db4e198524a2e9ed8f35b4.r2.dev/0a659cc7-f5ad-42f1-beb5-c2ef9a6323b1/id-preview-4f3f2b1c--db999886-97fc-4aea-9c57-c50604f0f95a.lovable.app-1776849755133.png" },
      { name: "twitter:image", content: "https://pub-bb2e103a32db4e198524a2e9ed8f35b4.r2.dev/0a659cc7-f5ad-42f1-beb5-c2ef9a6323b1/id-preview-4f3f2b1c--db999886-97fc-4aea-9c57-c50604f0f95a.lovable.app-1776849755133.png" },
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
    <html lang="en">
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
          <SidebarTrigger
            className="fixed left-3 top-[max(0.75rem,env(safe-area-inset-top))] z-50 h-9 w-9 rounded-full border border-[var(--hairline)] bg-background/70 text-foreground/80 shadow-sm backdrop-blur-md transition-colors hover:bg-background/90 hover:text-foreground sm:left-4 sm:top-4"
            aria-label="Открыть навигацию"
          />
          <Outlet />
        </div>
      </div>
    </SidebarProvider>
  );
}
