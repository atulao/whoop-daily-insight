
import React from "react";
import { Link } from "react-router-dom";
import { cn } from "@/lib/utils";
import { WhoopStatusButton } from "@/components/whoop/WhoopStatusButton";
import {
  ChartBar,
  Bed,
  Settings,
  User,
  ArrowUp,
  ArrowDown,
  Calendar,
  Link as LinkIcon,
  Menu,
} from "lucide-react";

interface SidebarProps {
  className?: string;
}

export const Sidebar: React.FC<SidebarProps> = ({ className }) => {
  const [collapsed, setCollapsed] = React.useState(false);

  const toggleSidebar = () => {
    setCollapsed(!collapsed);
  };

  const menuItems = [
    {
      icon: <ChartBar className="h-5 w-5" />,
      label: "DASHBOARD",
      path: "/",
    },
    {
      icon: <ArrowUp className="h-5 w-5" />,
      label: "STRAIN",
      path: "/strain",
    },
    {
      icon: <Bed className="h-5 w-5" />,
      label: "SLEEP",
      path: "/sleep",
    },
    {
      icon: <Calendar className="h-5 w-5" />,
      label: "HISTORY",
      path: "/history",
    },
    {
      icon: <User className="h-5 w-5" />,
      label: "PROFILE",
      path: "/profile",
    },
    {
      icon: <Settings className="h-5 w-5" />,
      label: "SETTINGS",
      path: "/settings",
    },
    {
      icon: <LinkIcon className="h-5 w-5" />,
      label: "CONNECT",
      path: "/connect",
    },
  ];

  return (
    <aside
      className={cn(
        "bg-whoop-black text-whoop-white transition-all duration-200 ease-out flex flex-col h-screen",
        collapsed ? "w-16" : "w-64",
        className
      )}
    >
      <div className="flex items-center justify-between p-4 border-b border-white/10">
        {!collapsed && (
          <div className="text-xl font-bold tracking-whoop">WHOOP</div>
        )}
        <button
          onClick={toggleSidebar}
          className={cn(
            "p-2 rounded-full hover:bg-white/10 transition-colors duration-200",
            collapsed && "mx-auto"
          )}
        >
          {collapsed ? (
            <ArrowDown className="h-5 w-5" />
          ) : (
            <Menu className="h-5 w-5" />
          )}
        </button>
      </div>
      <nav className="flex-1 overflow-y-auto py-4">
        <ul className="space-y-1">
          {menuItems.map((item) => (
            <li key={item.path}>
              <Link
                to={item.path}
                className="flex items-center px-4 py-3 hover:bg-white/10 transition-colors duration-200"
              >
                <div className={cn("flex items-center justify-center", item.path === '/connect' && "text-whoop-teal")}>
                  {item.icon}
                </div>
                {!collapsed && (
                  <span className="ml-3 font-sans uppercase tracking-whoop text-sm">
                    {item.label}
                  </span>
                )}
              </Link>
            </li>
          ))}
        </ul>
      </nav>
      {!collapsed && (
        <div className="p-4 border-t border-white/10">
          <WhoopStatusButton />
        </div>
      )}
      <div className="p-4 border-t border-white/10 flex items-center">
        {!collapsed ? (
          <div className="text-sm text-white/60">© 2025 WHOOP</div>
        ) : (
          <div className="w-full text-center text-white/60">©</div>
        )}
      </div>
    </aside>
  );
};
