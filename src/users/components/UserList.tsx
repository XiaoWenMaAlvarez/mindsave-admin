import { Edit3, MailX, ShieldCheck, UserRoundX } from "lucide-react";
import { Link } from "react-router";

import { useAuthStore } from "@/auth/store/auth.store";
import { cn } from "@/lib/utils";
import type { UserResponse } from "../interfaces/UserResponse.interface";
import { DeleteUserButton } from "./DeleteUserButton";
import { RestoreUserButton } from "./RestoreUserButton";

interface UserListProps {
  users: UserResponse[];
}

const roleLabel: Record<UserResponse["role"], string> = {
  PROFESIONAL_ROL: "Administrador",
  USER_ROL: "Usuario",
};

const UserList = ({ users }: UserListProps) => {
  const { user: authenticatedUser } = useAuthStore();

  if (users.length === 0) {
    return (
      <div className="ms-surface rounded-3xl px-6 py-16 text-center">
        <div className="mx-auto flex size-14 items-center justify-center rounded-full border border-primary/20 bg-primary/10 text-primary">
          <UserRoundX className="size-6" />
        </div>
        <h2 className="mt-5 font-heading text-xl font-semibold text-foreground">No encontramos usuarios</h2>
        <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-muted-foreground">
          Prueba con otra búsqueda o limpia los filtros para volver a ver las cuentas disponibles.
        </p>
      </div>
    );
  }

  return (
    <>
      <div className="ms-surface hidden overflow-hidden rounded-3xl lg:block">
        <div className="overflow-x-auto">
          <table className="w-full min-w-272 border-collapse text-left">
            <thead>
              <tr className="border-b border-border bg-[#102121]/65">
                {[
                  "Nombre",
                  "Correo",
                  "Rol",
                  "Estado",
                  "Correo",
                  "Editar",
                  "Eliminar",
                  "Restaurar",
                ].map((column, index) => (
                  <th
                    key={`${column}-${index}`}
                    scope="col"
                    className="px-4 py-4 text-[0.6875rem] font-semibold uppercase tracking-[0.14em] text-[#4a8080] first:pl-6 last:pr-6"
                  >
                    {column}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {users.map((currentUser) => (
                <tr key={currentUser.id} className="border-b border-border/80 transition-colors last:border-b-0 hover:bg-[#0a1818]/70">
                  <td className="px-4 py-4 pl-6">
                    <div className="flex min-w-0 items-center gap-3">
                      <UserAvatar name={currentUser.name} />
                      <div className="min-w-0">
                        <p className="max-w-44 truncate text-sm font-semibold text-foreground">{currentUser.name}</p>
                        {authenticatedUser?.id === currentUser.id && (
                          <span className="mt-0.5 inline-flex items-center gap-1 text-[0.6875rem] text-primary">
                            <ShieldCheck className="size-3" /> Tu cuenta
                          </span>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="max-w-60 truncate px-4 py-4 text-sm text-muted-foreground" title={currentUser.email}>{currentUser.email}</td>
                  <td className="px-4 py-4"><RoleBadge role={currentUser.role} /></td>
                  <td className="px-4 py-4"><StatusBadge isActive={currentUser.isActive} /></td>
                  <td className="px-4 py-4"><EmailBadge verified={currentUser.emailVerified} /></td>
                  <td className="px-4 py-4">
                    <Link
                      to={`/users/${currentUser.id}`}
                      className="inline-flex h-7 items-center gap-1.5 rounded-lg border border-primary/25 bg-primary/10 px-2.5 text-xs font-semibold text-primary transition-colors hover:border-primary/40 hover:bg-primary/15 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/70"
                    >
                      <Edit3 className="size-3.5" /> Editar
                    </Link>
                  </td>
                  <td className="px-4 py-4">
                    <DeleteUserButton userId={currentUser.id} userName={currentUser.name} isActive={currentUser.isActive} />
                  </td>
                  <td className="px-4 py-4 pr-6">
                    <RestoreUserButton userId={currentUser.id} userName={currentUser.name} isActive={currentUser.isActive} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="grid gap-3 lg:hidden">
        {users.map((currentUser) => (
          <article key={currentUser.id} className="ms-surface rounded-2xl p-4 sm:p-5">
            <div className="flex min-w-0 items-start gap-3">
              <UserAvatar name={currentUser.name} />
              <div className="min-w-0 flex-1">
                <div className="flex min-w-0 items-center gap-2">
                  <h2 className="truncate text-sm font-semibold text-foreground">{currentUser.name}</h2>
                  {authenticatedUser?.id === currentUser.id && <ShieldCheck className="size-3.5 shrink-0 text-primary" aria-label="Tu cuenta" />}
                </div>
                <p className="mt-0.5 truncate text-xs text-muted-foreground">{currentUser.email}</p>
              </div>
              <StatusBadge isActive={currentUser.isActive} />
            </div>

            <div className="mt-4 flex flex-wrap gap-2">
              <RoleBadge role={currentUser.role} />
              <EmailBadge verified={currentUser.emailVerified} />
            </div>

            <div className="mt-4 grid grid-cols-1 gap-2 border-t border-border pt-4 min-[430px]:grid-cols-3">
              <Link
                to={`/users/${currentUser.id}`}
                className="inline-flex h-8 items-center justify-center gap-1.5 rounded-lg border border-primary/25 bg-primary/10 px-2.5 text-xs font-semibold text-primary transition-colors hover:bg-primary/15 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/70"
              >
                <Edit3 className="size-3.5" /> Editar
              </Link>
              <DeleteUserButton userId={currentUser.id} userName={currentUser.name} isActive={currentUser.isActive} />
              <RestoreUserButton userId={currentUser.id} userName={currentUser.name} isActive={currentUser.isActive} />
            </div>
          </article>
        ))}
      </div>
    </>
  );
};

const UserAvatar = ({ name }: { name: string }) => {
  const initials = name
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase();

  return (
    <span className="flex size-9 shrink-0 items-center justify-center rounded-full border border-primary/20 bg-primary/10 text-xs font-semibold text-primary">
      {initials || "U"}
    </span>
  );
};

const RoleBadge = ({ role }: { role: UserResponse["role"] }) => {
  const isAdmin = role === "PROFESIONAL_ROL";

  return (
    <span
      className={cn(
        "inline-flex rounded-full border px-2.5 py-1 text-[0.6875rem] font-semibold",
        isAdmin
          ? "border-primary/25 bg-primary/10 text-primary"
          : "border-border bg-white/4 text-muted-foreground",
      )}
      title={role}
    >
      {roleLabel[role]}
    </span>
  );
};

const StatusBadge = ({ isActive }: { isActive: boolean }) => (
  <span className={cn(
    "inline-flex rounded-full border px-2.5 py-1 text-[0.6875rem] font-semibold",
    isActive ? "border-success/20 bg-success/10 text-success" : "border-destructive/20 bg-destructive/10 text-destructive",
  )}>
    {isActive ? "Activo" : "Inactivo"}
  </span>
);

const EmailBadge = ({ verified }: { verified: boolean }) => (
  <span className={cn(
    "inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-[0.6875rem] font-semibold",
    verified ? "border-success/20 bg-success/10 text-success" : "border-warning/20 bg-warning/10 text-warning",
  )}>
    {!verified && <MailX className="size-3" />}
    {verified ? "Verificado" : "No verificado"}
  </span>
);

export default UserList;
