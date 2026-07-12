import { useAuth } from "../../hooks/useAuth";
import { useTheme } from "../../hooks/useTheme";
import { Moon, Sun, Bell, Search, LogOut } from "lucide-react";
import { cn } from "../../lib/utils";

export const Navbar = () => {
  const { user, logout } = useAuth();
  const { theme, setTheme } = useTheme();

  return (
    <header className="sticky top-0 z-40 flex h-16 shrink-0 items-center gap-x-4 border-b border-white/5 bg-background/40 backdrop-blur-md px-8 shadow-sm dark:bg-black/20">
      <div className="flex flex-1 gap-x-4 self-stretch lg:gap-x-6">
        <form className="relative flex flex-1" action="#" method="GET">
          <label htmlFor="search-field" className="sr-only">
            Search
          </label>
          <Search
            className="pointer-events-none absolute inset-y-0 left-0 h-full w-5 text-muted-foreground"
            aria-hidden="true"
          />
          <input
            id="search-field"
            className="block h-full w-full border-0 py-0 pl-8 pr-0 text-foreground placeholder:text-muted-foreground bg-transparent focus:ring-0 sm:text-sm"
            placeholder="Search resources..."
            type="search"
            name="search"
          />
        </form>
        <div className="flex items-center gap-x-4 lg:gap-x-6">
          <button type="button" className="-m-2.5 p-2.5 text-muted-foreground hover:text-foreground transition">
            <span className="sr-only">View notifications</span>
            <Bell className="h-5 w-5" aria-hidden="true" />
          </button>

          <div className="hidden lg:block lg:h-6 lg:w-px lg:bg-border" aria-hidden="true" />

          <button
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            className="rounded-full p-2 text-muted-foreground hover:bg-muted"
          >
            {theme === "dark" ? <Sun size={18} /> : <Moon size={18} />}
          </button>

          <div className="relative group">
            <button className="-m-1.5 flex items-center p-1.5 hover:ring-2 ring-primary/20 rounded-full transition">
              <span className="sr-only">Open user menu</span>
              <img
                className="h-8 w-8 rounded-full bg-muted object-cover"
                src={user?.avatar || "https://ui-avatars.com/api/?name=Admin&background=random"}
                alt=""
              />
            </button>
            
            {/* Simple Dropdown for MVP */}
            <div className="absolute right-0 top-full mt-2 hidden w-48 rounded-xl ring-1 ring-white/10 glass shadow-xl group-hover:block transition-all">
              <div className="p-3">
                <p className="text-sm font-medium">{user?.name || "Admin User"}</p>
                <p className="text-xs text-muted-foreground truncate">{user?.email || "admin@transitops.com"}</p>
              </div>
              <div className="border-t border-border p-1">
                <button 
                  onClick={logout}
                  className="flex w-full items-center rounded-md px-3 py-2 text-sm text-destructive hover:bg-destructive/10"
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  Logout
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};
