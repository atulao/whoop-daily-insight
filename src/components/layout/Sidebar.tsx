
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
      label: "Dashboard",
      path: "/",
    },
    {
      icon: <ArrowUp className="h-5 w-5" />,
      label: "Strain",
      path: "/strain",
    },
    {
      icon: <Bed className="h-5 w-5" />,
      label: "Sleep",
      path: "/sleep",
    },
    {
      icon: <Calendar className="h-5 w-5" />,
      label: "History",
      path: "/history",
    },
    {
      icon: <User className="h-5 w-5" />,
      label: "Profile",
      path: "/profile",
    },
    {
      icon: <Settings className="h-5 w-5" />,
      label: "Settings",
      path: "/settings",
    },
    {
      icon: <LinkIcon className="h-5 w-5" />,
      label: "Connect WHOOP",
      path: "/connect",
    },
  ];

  return (
    <aside
      className={cn(
        "bg-whoop-blue text-white transition-all duration-300 ease-in-out flex flex-col h-screen",
        collapsed ? "w-16" : "w-64",
        className
      )}
    >
      <div className="flex items-center justify-between p-4 border-b border-white/10">
        {!collapsed && (
          <div className="text-xl font-bold">WHOOP Insights</div>
        )}
        <button
          onClick={toggleSidebar}
          className={cn(
            "p-2 rounded-full hover:bg-white/10",
            collapsed && "mx-auto"
          )}
        >
          {collapsed ? (
            <ArrowDown className="h-5 w-5" />
          ) : (
            <ArrowUp className="h-5 w-5" />
          )}
        </button>
      </div>
      <nav className="flex-1 overflow-y-auto py-4">
        <ul className="space-y-2">
          {menuItems.map((item) => (
            <li key={item.path}>
              <Link
                to={item.path}
                className="flex items-center px-4 py-2 hover:bg-white/10 rounded-sm mx-2"
              >
                <div className="flex items-center justify-center">
                  {item.icon}
                </div>
                {!collapsed && <span className="ml-3">{item.label}</span>}
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
          <div className="text-sm text-white/60">© 2025 WHOOP Insights</div>
        ) : (
          <div className="w-full text-center text-white/60">©</div>
        )}
      </div>
    </aside>
  );
};
