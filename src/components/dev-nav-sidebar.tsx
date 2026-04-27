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
      <SidebarHeader className="border-b">
        {!collapsed && (
          <div className="px-2 py-1.5">
            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              PM Навигатор
            </p>
            <p className="text-[10px] text-muted-foreground/70">три направления</p>
          </div>
        )}
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Направления</SidebarGroupLabel>
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
