import { NavLink } from "react-router-dom";
import { 
  LayoutDashboard, 
  Truck, 
  Users, 
  Map, 
  Wrench, 
  Fuel, 
  Receipt, 
  BarChart3,
  Settings
} from "lucide-react";
import { cn } from "../../lib/utils";

const navItems = [
  { name: "Dashboard", href: "/", icon: LayoutDashboard },
  { name: "Vehicles", href: "/vehicles", icon: Truck },
  { name: "Drivers", href: "/drivers", icon: Users },
  { name: "Trips", href: "/trips", icon: Map },
  { name: "Maintenance", href: "/maintenance", icon: Wrench },
  { name: "Fuel", href: "/fuel", icon: Fuel },
  { name: "Expenses", href: "/expenses", icon: Receipt },
  { name: "Reports", href: "/reports", icon: BarChart3 },
];

export const Sidebar = () => {
  return (
    <aside className="fixed inset-y-0 left-0 z-50 w-64 bg-background/80 backdrop-blur-xl border-r border-border/50 py-6 px-4 flex flex-col justify-between">
      <div>
        <div className="flex items-center gap-3 px-3 mb-10">
          <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center text-primary-foreground font-bold shadow-lg shadow-primary/30">
            T
          </div>
          <span className="text-xl font-semibold tracking-tight">TransitOps</span>
        </div>

        <nav className="space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.name}
                to={item.href}
                className={({ isActive }) =>
                  cn(
                    "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200 group",
                    isActive
                      ? "bg-primary/10 text-primary"
                      : "text-muted-foreground hover:bg-muted/80 hover:text-foreground"
                  )
                }
              >
                {({ isActive }) => (
                  <>
                    <Icon className={cn("h-4 w-4", isActive ? "text-primary" : "text-muted-foreground group-hover:text-foreground")} />
                    {item.name}
                  </>
                )}
              </NavLink>
            );
          })}
        </nav>
      </div>
      
      <div className="px-3">
        <button className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-muted-foreground hover:bg-muted/80 hover:text-foreground transition-all duration-200">
          <Settings className="h-4 w-4" />
          Settings
        </button>
      </div>
    </aside>
  );
};
