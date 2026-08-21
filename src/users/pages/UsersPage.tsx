import SearchBar from "../components/SearchBar";
import UserList from "../components/UserList"
import UserFilters from "../components/UserFilters"
import { useGetUsers } from "../hooks/useGetUsers";
import { CustomPagination } from "../components/CustomPagination";

//TODO: Implementar pantalla de carga y de error
const UsersPage = () => {

  const { data, isError, isLoading, error } = useGetUsers();

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (isError || !data?.results) {
    return <div>Error al cargar usuarios: {error?.message}</div>;
  }

  const { results, totalPages } = data;

  return (
    <div>
      <SearchBar/>
      <UserFilters/>
      <UserList users={results} />
      <CustomPagination totalPages={totalPages} />
    </div>
  );
};

export default UsersPage;