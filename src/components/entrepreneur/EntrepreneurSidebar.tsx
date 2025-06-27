import { NavLink, useLocation } from "react-router-dom";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";

const menuItems = [
  { title: "Overview", url: "/entrepreneur", icon: "📊" },
  { title: "My Opportunities", url: "/entrepreneur/opportunities", icon: "🎯" },
  { title: "Create Opportunity", url: "/entrepreneur/create-opportunity", icon: "➕" },
  { title: "Documents", url: "/entrepreneur/documents", icon: "📋" },
  { title: "Investment Offers", url: "/entrepreneur/offers", icon: "💼" },
  { title: "Agreements", url: "/entrepreneur/agreements", icon: "📄" },
  { title: "Progress Reports", url: "/entrepreneur/reports", icon: "📈" },
  { title: "Payouts", url: "/entrepreneur/payouts", icon: "💰" },
  { title: "Profile", url: "/entrepreneur/profile", icon: "👤" },
];

export function EntrepreneurSidebar() {
  const { state } = useSidebar();
  const location = useLocation();
  const currentPath = location.pathname;

  const isCollapsed = state === "collapsed";

  const isActive = (path: string) => {
    if (path === "/entrepreneur") {
      return currentPath === path;
    }
    return currentPath.startsWith(path);
  };

  const getNavClass = (path: string) => {
    return isActive(path) 
      ? "bg-blue-100 text-blue-700 font-medium" 
      : "hover:bg-gray-100";
  };

  return (
    <Sidebar className={isCollapsed ? "w-16" : "w-64"} collapsible="icon">
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel className={isCollapsed ? "hidden" : ""}>
            Entrepreneur Portal
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <NavLink
                      to={item.url}
                      className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${getNavClass(item.url)}`}
                      end={item.url === "/entrepreneur"}
                    >
                      <span className="text-lg">{item.icon}</span>
                      {!isCollapsed && <span>{item.title}</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}
