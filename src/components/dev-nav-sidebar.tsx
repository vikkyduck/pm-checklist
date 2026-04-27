import { Link, useLocation } from "@tanstack/react-router";
import { ShieldCheck, Battery, MessagesSquare, Radar } from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";

type NavItem = {
  title: string;
  url: string;
  icon: React.ComponentType<{ className?: string }>;
  hint?: string;
};

const NAV_ITEMS: NavItem[] = [
  {
    title: "Митигирование рисков",
    url: "/",
    icon: ShieldCheck,
    hint: "Чек-лист от первого дня до закрытия",
  },
  {
    title: "Ресурсное состояние",
    url: "/resource-state",
    icon: Battery,
    hint: "Четыре уровня ассертивности",
  },
  {
    title: "Радар ресурсности",
    url: "/resource-radar",
    icon: Radar,
    hint: "Опрос · ваш архетип восстановления",
  },
  {
    title: "Переговоры с заказчиком",
    url: "/negotiations",
    icon: MessagesSquare,
    hint: "Оценка PM в ролевой игре",
  },
];

export function DevNavSidebar() {
  const { state } = useSidebar();
  const collapsed = state === "collapsed";
  const location = useLocation();
  const currentPath = location.pathname;

  const isActive = (path: string) =>
    path === "/"
      ? currentPath === "/"
      : currentPath === path || currentPath.startsWith(path + "/");

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader className="border-b border-[var(--hairline)]">
        {!collapsed ? (
          <div className="flex items-center gap-3 px-2 py-3">
            <span
              className="flex h-8 w-8 items-center justify-center rounded-md bg-foreground text-[13px] font-medium text-background"
              style={{ fontFamily: "var(--font-display)" }}
            >
              P
            </span>
            <div className="min-w-0">
              <p
                className="truncate text-[15px] leading-tight text-foreground"
                style={{ fontFamily: "var(--font-display)", letterSpacing: "-0.02em" }}
              >
                Practice
              </p>
              <p className="eyebrow mt-1 truncate">Навигатор PM</p>
            </div>
          </div>
        ) : (
          <div className="flex justify-center px-1 py-3">
            <span
              className="flex h-8 w-8 items-center justify-center rounded-md bg-foreground text-[13px] font-medium text-background"
              style={{ fontFamily: "var(--font-display)" }}
            >
              P
            </span>
          </div>
        )}
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          {!collapsed && (
            <SidebarGroupLabel className="eyebrow !text-[10px] !text-muted-foreground/80">
              Разделы
            </SidebarGroupLabel>
          )}
          <SidebarGroupContent>
            <SidebarMenu>
              {NAV_ITEMS.map((item) => {
                const active = isActive(item.url);
                return (
                  <SidebarMenuItem key={item.url}>
                    <SidebarMenuButton
                      asChild
                      tooltip={item.title}
                      className={[
                        "group/nav h-auto items-start py-2.5 transition-colors",
                        active
                          ? "bg-sidebar-accent text-sidebar-accent-foreground"
                          : "",
                      ].join(" ")}
                    >
                      <Link to={item.url}>
                        <item.icon
                          className={[
                            "h-4 w-4 mt-0.5 shrink-0 transition-colors",
                            active
                              ? "text-accent"
                              : "text-muted-foreground group-hover/nav:text-foreground",
                          ].join(" ")}
                        />
                        {!collapsed && (
                          <div className="flex-1 min-w-0">
                            <div
                              className={[
                                "truncate text-[13.5px] leading-tight",
                                active ? "font-medium text-foreground" : "text-foreground/90",
                              ].join(" ")}
                            >
                              {item.title}
                            </div>
                            {item.hint && (
                              <div className="truncate text-[10.5px] leading-tight text-muted-foreground/80 mt-1">
                                {item.hint}
                              </div>
                            )}
                          </div>
                        )}
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      {!collapsed && (
        <SidebarFooter className="border-t border-[var(--hairline)] px-3 py-3">
          <p className="eyebrow !text-[9.5px] text-muted-foreground/70">
            v.2026 · Practice
          </p>
        </SidebarFooter>
      )}
    </Sidebar>
  );
}
