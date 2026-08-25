import { ArrowRight, UserPlus, Users } from "lucide-react";
import { Link } from "react-router";

import { useAuthStore } from "@/auth/store/auth.store";

const getGreeting = () => {
  const hour = new Date().getHours();
  if (hour < 12) return "Buenos días";
  if (hour < 19) return "Buenas tardes";
  return "Buenas noches";
};

const actions = [
  {
    to: "/users",
    title: "Gestionar usuarios",
    description: "Consulta, filtra y administra todas las cuentas registradas en la plataforma.",
    icon: Users,
  },
  {
    to: "/new-user",
    title: "Crear usuario",
    description: "Registra una nueva cuenta de usuario directamente desde el panel.",
    icon: UserPlus,
  },
];

const HomePage = () => {
  const { user } = useAuthStore();

  return (
    <main className="relative flex min-h-[calc(100vh-4rem)] items-center justify-center overflow-hidden px-5 py-14 sm:px-8 sm:py-20">
      <div className="pointer-events-none absolute left-1/2 top-[18%] h-72 w-[min(90vw,42rem)] -translate-x-1/2 bg-[radial-gradient(ellipse,rgb(0_178_179_/_0.08),transparent_70%)]" />

      <div className="ms-enter relative w-full max-w-[46rem] text-center">
        <p className="ms-section-label">{getGreeting()}</p>
        <h1 className="mt-3 font-heading text-4xl font-semibold leading-tight text-foreground sm:text-[2.65rem]">
          {user?.name ?? "Administrador"}
        </h1>
        <div className="ms-accent-line mx-auto mt-4 h-0.5 w-12" />
        <p className="mx-auto mt-4 max-w-lg text-[0.9375rem] leading-7 text-muted-foreground sm:text-base">
          Bienvenido al panel de administración de MindSave. Desde aquí puedes gestionar las cuentas de los usuarios de la plataforma.
        </p>

        <div className="mt-10 grid gap-4 text-left sm:grid-cols-2">
          {actions.map(({ to, title, description, icon: Icon }) => (
            <Link
              key={to}
              to={to}
              className="group ms-surface flex min-h-56 flex-col rounded-3xl p-6 outline-none transition-all duration-200 hover:-translate-y-0.5 hover:border-primary/35 hover:bg-primary/[0.04] hover:shadow-[0_16px_46px_rgb(0_178_179_/_0.08)] focus-visible:ring-2 focus-visible:ring-ring/70 sm:p-7"
            >
              <div className="flex size-12 items-center justify-center rounded-xl border border-primary/20 bg-primary/10 text-primary transition-colors group-hover:bg-primary/15 group-hover:text-[#00cacb]">
                <Icon className="size-5" />
              </div>
              <h2 className="mt-5 font-heading text-lg font-semibold text-foreground">{title}</h2>
              <p className="mt-2 text-[0.8125rem] leading-5 text-muted-foreground">{description}</p>
              <span className="mt-auto inline-flex items-center gap-1.5 pt-5 text-xs font-semibold text-primary">
                Ir ahora
                <ArrowRight className="size-3.5 transition-transform group-hover:translate-x-1" />
              </span>
            </Link>
          ))}
        </div>
      </div>
    </main>
  );
};

export default HomePage;
