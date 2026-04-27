import { Link, useLocation } from "@tanstack/react-router";
import { Home, MessageSquare } from "lucide-react";
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
};

const PUBLIC_ITEMS: NavItem[] = [
  { title: "Главная (чек-лист)", url: "/", icon: Home },
  { title: "Переговоры", url: "/negotiations", icon: MessageSquare },
];

export function DevNavSidebar() {
  const { state } = useSidebar();
  const collapsed = state === "collapsed";
  const location = useLocation();
  const currentPath = location.pathname;

  const isActive = (path: string) =>
    path === "/" ? currentPath === "/" : currentPath === path || currentPath.startsWith(path + "/");

  const renderItem = (item: NavItem) => {
    const active = isActive(item.url);
    return (
      <SidebarMenuItem key={item.url}>
        <SidebarMenuButton
          asChild
          tooltip={item.title}
          className={active ? "bg-sidebar-accent text-sidebar-accent-foreground font-medium" : ""}
        >
          <Link to={item.url}>
            <item.icon className="h-4 w-4" />
            {!collapsed && <span className="flex-1 truncate">{item.title}</span>}
          </Link>
        </SidebarMenuButton>
      </SidebarMenuItem>
    );
  };

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader className="border-b">
        {!collapsed && (
          <div className="px-2 py-1.5">
            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Dev navigation
            </p>
            <p className="text-[10px] text-muted-foreground/70">только в превью</p>
          </div>
        )}
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Страницы</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>{PUBLIC_ITEMS.map(renderItem)}</SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}
