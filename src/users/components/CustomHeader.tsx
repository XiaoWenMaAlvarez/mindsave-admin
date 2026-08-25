import { LogOut, Users } from "lucide-react";
import { NavLink, useLocation } from "react-router";
import { toast } from "sonner";

import { useAuthStore } from "@/auth/store/auth.store";
import BrandLogo from "@/components/shared/BrandLogo";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const CustomHeader = () => {
  const { logout, user } = useAuthStore();
  const { pathname } = useLocation();
  const usersActive = pathname.startsWith("/users") || pathname === "/new-user";

  const handleLogout = () => {
    logout();
    toast.success("Sesión cerrada", { description: "Tu sesión se cerró correctamente." });
  };

  return (
    <header className="sticky top-0 z-50 h-16 w-full border-b border-border bg-[#0a1818]/95 backdrop-blur-xl">
      <div className="mx-auto flex h-full max-w-[90rem] items-center gap-3 px-4 sm:px-6 lg:px-10">
        <div className="min-w-0 flex-1">
          <BrandLogo className="hidden sm:inline-flex" />
          <BrandLogo compact className="sm:hidden" />
        </div>

        <nav aria-label="Navegación principal" className="flex items-center">
          <NavLink
            to="/users"
            className={cn(
              "inline-flex h-9 items-center gap-2 rounded-lg border px-3 text-[0.8125rem] font-medium outline-none transition-colors focus-visible:ring-2 focus-visible:ring-ring/70 sm:px-4 sm:text-sm",
              usersActive
                ? "border-primary/25 bg-primary/10 text-[#00cacb]"
                : "border-transparent text-muted-foreground hover:bg-primary/5 hover:text-[#00cacb]",
            )}
          >
            <Users className="size-4" />
            Usuarios
          </NavLink>
        </nav>

        <div className="flex min-w-0 flex-1 justify-end">
          <div className="mr-3 hidden min-w-0 text-right lg:block">
            <p className="truncate text-xs font-medium text-foreground">{user?.name}</p>
            <p className="truncate text-[0.6875rem] text-[#4a7070]">Administrador</p>
          </div>
          <Button type="button" variant="outline" size="sm" onClick={handleLogout} aria-label="Cerrar sesión">
            <LogOut />
            <span className="hidden md:inline">Cerrar sesión</span>
          </Button>
        </div>
      </div>
    </header>
  );
};

export default CustomHeader;
