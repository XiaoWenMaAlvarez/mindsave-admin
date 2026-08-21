import { useSearchParams } from "react-router";

const UserFilters = () => {
  const [searchParams, setSearchParams] = useSearchParams();

  const handleFilterChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const { name, value } = event.target;
    setSearchParams((prev) => {
      if (value) {
        prev.set(name, value);
      } else {
        prev.delete(name);
      }
      prev.set("page", "1");
      return prev;
    });
  };
  
  return (
    <div>
      <h2>Filtros</h2>
      <div>
        <label htmlFor="emailVerify">Estado de email</label>
        <select name="emailVerify" id="emailVerify" defaultValue={searchParams.get("emailVerify") ?? ""} onChange={handleFilterChange}>
          <option value="">Todos</option>
          <option value="verify">Email verificado</option>
          <option value="unverify">Email sin verificar</option>
        </select>
      </div>
      <div>
        <label htmlFor="rol">Rol</label>
        <select name="rol" id="rol" defaultValue={searchParams.get("rol") ?? ""} onChange={handleFilterChange}>
          <option value="">Todos</option>
          <option value="PROFESIONAL_ROL">Admin</option>
          <option value="USER_ROL">User</option>
        </select>
      </div>
      <div>
        <label htmlFor="state">Estado de la cuenta</label>
        <select name="state" id="state" defaultValue={searchParams.get("state") ?? ""} onChange={handleFilterChange}>
          <option value="">Todos</option>
          <option value="active">Activos</option>
          <option value="inactive">Inactivos</option>
        </select>
      </div>
    </div>
  )
}

export default UserFilters;