import { Link } from "react-router"
import { Button } from "@/components/ui/button"
import CustomLogo from "./CustomLogo"
import { useAuthStore } from "@/auth/store/auth.store";

const CustomHeader = () => {

  const { logout } = useAuthStore();
  
  return (
    <header className="sticky top-0 z-50 w-full border-b backdrop-blur bg-slate-50">
      <div className="container mx-auto px-4 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <CustomLogo />

          {/* Navigation - Desktop */}
          <nav className="hidden md:flex items-center space-x-8">
            <Link
              to="/users"
              className={"text-sm font-medium transition-colors hover:text-primary"}
            >
              Usuarios
            </Link>
          </nav>

          <div className="flex items-center space-x-4">

            <Button variant="default" size="sm" className="ml-2" onClick={logout}>
              Cerrar sesión
            </Button>
          </div>
        </div>
      </div>
    </header>
  )
}

export default CustomHeader