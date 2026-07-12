import { NavLink, Link } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import { Avatar } from "../common/Avatar";
import { cn } from "../../lib/utils";
import { getAccessibleModules, ROLE_LABELS } from "../../config/permissions";

export const Sidebar = () => {
  const { user } = useAuth();
  const navItems = getAccessibleModules(user?.role);

  return (
    <aside className="fixed inset-y-0 left-0 z-50 w-64 bg-background/80 backdrop-blur-xl border-r border-border/50 py-6 px-4 flex flex-col justify-between">
      <div>
        <div className="flex items-center gap-3 px-3 mb-10">
          <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center text-primary-foreground font-bold shadow-lg shadow-primary/30">
            T
          </div>
          <div>
            <span className="text-xl font-semibold tracking-tight">TransitOps</span>
            {user && <p className="text-xs text-muted-foreground">{ROLE_LABELS[user.role]}</p>}
          </div>
        </div>

        <nav className="space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;

            return (
              <NavLink
                key={item.id}
                to={item.path}
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
                    {item.label}
                  </>
                )}
              </NavLink>
            );
          })}
        </nav>
      </div>

      {user && (
        <Link to="/profile" className="flex items-center gap-3 rounded-xl border border-border/60 bg-muted/30 px-3 py-3 hover:bg-muted/65 transition-colors">
          <Avatar name={user.name} src={user.profileImage} size="sm" />
          <div className="min-w-0 flex-1">
            <p className="text-sm font-medium truncate">{user.name}</p>
            <p className="text-xs text-muted-foreground truncate">{user.email}</p>
          </div>
        </Link>
      )}
    </aside>
  );
};
