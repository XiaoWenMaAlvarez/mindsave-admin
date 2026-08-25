import { Filter, RotateCcw } from "lucide-react";
import { useSearchParams } from "react-router";

import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";

const filterClassName =
  "h-11 w-full rounded-xl border border-input bg-[#0a1a1a] px-3 text-sm text-foreground outline-none transition-colors focus:border-ring focus:ring-2 focus:ring-ring/15";

const UserFilters = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const emailVerify = searchParams.get("emailVerify") ?? "";
  const rol = searchParams.get("rol") ?? "";
  const state = searchParams.get("state") ?? "";
  const hasFilters = Boolean(emailVerify || rol || state);

  const handleFilterChange = (name: string, value: string) => {
    setSearchParams((previous) => {
      const next = new URLSearchParams(previous);
      if (value) next.set(name, value);
      else next.delete(name);
      next.set("page", "1");
      return next;
    });
  };

  const clearFilters = () => {
    setSearchParams((previous) => {
      const next = new URLSearchParams(previous);
      next.delete("emailVerify");
      next.delete("rol");
      next.delete("state");
      next.set("page", "1");
      return next;
    });
  };

  return (
    <div className="mt-5 border-t border-border pt-5">
      <div className="mb-3 flex items-center justify-between gap-3">
        <p className="ms-section-label inline-flex items-center gap-2">
          <Filter className="size-3.5" />
          Filtros
        </p>
        {hasFilters && (
          <Button type="button" variant="ghost" size="xs" onClick={clearFilters}>
            <RotateCcw />
            Limpiar filtros
          </Button>
        )}
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        <div className="space-y-2">
          <Label htmlFor="emailVerify">Estado del correo</Label>
          <select
            id="emailVerify"
            value={emailVerify}
            className={filterClassName}
            onChange={(event) => handleFilterChange("emailVerify", event.target.value)}
          >
            <option value="">Todos</option>
            <option value="verify">Verificado</option>
            <option value="unverify">No verificado</option>
          </select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="rol">Rol</Label>
          <select
            id="rol"
            value={rol}
            className={filterClassName}
            onChange={(event) => handleFilterChange("rol", event.target.value)}
          >
            <option value="">Todos</option>
            <option value="PROFESIONAL_ROL">Administrador</option>
            <option value="USER_ROL">Usuario</option>
          </select>
        </div>

        <div className="space-y-2 sm:col-span-2 lg:col-span-1">
          <Label htmlFor="state">Estado de la cuenta</Label>
          <select
            id="state"
            value={state}
            className={filterClassName}
            onChange={(event) => handleFilterChange("state", event.target.value)}
          >
            <option value="">Todos</option>
            <option value="active">Activos</option>
            <option value="inactive">Inactivos</option>
          </select>
        </div>
      </div>
    </div>
  );
};

export default UserFilters;
