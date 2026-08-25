import { UserPlus } from "lucide-react";
import { Link } from "react-router";

import ErrorPage from "@/components/shared/ErrorPage";
import LoadingPage from "@/components/shared/LoadingPage";
import { CustomPagination } from "../components/CustomPagination";
import SearchBar from "../components/SearchBar";
import UserFilters from "../components/UserFilters";
import UserList from "../components/UserList";
import { useGetUsers } from "../hooks/useGetUsers";

const UsersPage = () => {
  const { data, isError, isLoading, error } = useGetUsers();

  if (isLoading) return <LoadingPage message="Cargando usuarios" />;
  if (isError || !data?.results) return <ErrorPage error={error?.message ?? "Error al cargar usuarios"} />;

  return (
    <main className="mx-auto w-full max-w-[90rem] px-4 py-8 sm:px-6 sm:py-10 lg:px-10">
      <div className="ms-enter">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="ms-section-label">Gestión de usuarios</p>
            <h1 className="mt-2 font-heading text-3xl font-semibold text-foreground">Usuarios</h1>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">
              Busca, filtra y administra las cuentas registradas en la plataforma.
            </p>
          </div>
          <Link
            to="/new-user"
            className="inline-flex h-10 shrink-0 items-center justify-center gap-2 rounded-xl bg-primary px-4 text-sm font-semibold text-primary-foreground shadow-[0_4px_16px_rgb(0_178_179_/_0.28)] transition-all hover:bg-[#00cacb] hover:shadow-[0_7px_22px_rgb(0_178_179_/_0.36)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/70"
          >
            <UserPlus className="size-4" />
            Crear usuario
          </Link>
        </div>

        <section className="ms-surface mt-7 rounded-3xl p-4 sm:p-5">
          <SearchBar />
          <UserFilters />
        </section>

        <div className="mt-5">
          <UserList users={data.results} />
          <CustomPagination totalPages={data.totalPages} />
        </div>
      </div>
    </main>
  );
};

export default UsersPage;
