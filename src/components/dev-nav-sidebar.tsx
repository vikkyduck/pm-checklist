import { Link, useLocation } from "@tanstack/react-router";
import { ShieldCheck, Battery, MessagesSquare } from "lucide-react";
import {
  Sidebar,
  SidebarContent,
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
    title: "Митигирование рисков в проекте",
    url: "/",
    icon: ShieldCheck,
    hint: "Чек-лист от первого дня до закрытия",
  },
  {
    title: "Ресурсное состояние",
    url: "/resource-state",
    icon: Battery,
  },
  {
    title: "Переговоры с заказчиком",
    url: "/negotiations",
    icon: MessagesSquare,
  },
];

export function DevNavSidebar() {
  const { state } = useSidebar();
  const collapsed = state === "collapsed";
  const location = useLocation();
  const currentPath = location.pathname;

  const isActive = (path: string) =>
    path === "/" ? currentPath === "/" : currentPath === path || currentPath.startsWith(path + "/");

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader className="border-b border-[var(--hairline)]">
        {!collapsed ? (
          <div className="flex items-center gap-2.5 px-2 py-2">
            <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-foreground text-[11px] font-semibold tracking-tight text-background">
              P
            </span>
            <div className="min-w-0">
              <p className="truncate text-sm font-medium leading-tight text-foreground">
                Practice
              </p>
              <p className="truncate text-[10px] leading-tight text-muted-foreground">
                навигатор PM
              </p>
            </div>
          </div>
        ) : (
          <div className="flex justify-center px-1 py-2">
            <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-foreground text-[11px] font-semibold tracking-tight text-background">
              P
            </span>
          </div>
        )}
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel className="text-[10px] uppercase tracking-[0.08em] text-muted-foreground/70">
            Направления
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {NAV_ITEMS.map((item) => {
                const active = isActive(item.url);
                return (
                  <SidebarMenuItem key={item.url}>
                    <SidebarMenuButton
                      asChild
                      tooltip={item.title}
                      className={
                        active
                          ? "bg-sidebar-accent text-sidebar-accent-foreground font-medium h-auto py-2 items-start"
                          : "h-auto py-2 items-start"
                      }
                    >
                      <Link to={item.url}>
                        <item.icon className="h-4 w-4 mt-0.5 shrink-0" />
                        {!collapsed && (
                          <div className="flex-1 min-w-0">
                            <div className="truncate text-sm leading-tight">
                              {item.title}
                            </div>
                            {item.hint && (
                              <div className="truncate text-[10px] text-muted-foreground/80 mt-0.5">
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
    </Sidebar>
  );
}
