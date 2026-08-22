import SearchBar from "../components/SearchBar";
import UserList from "../components/UserList"
import UserFilters from "../components/UserFilters"
import { useGetUsers } from "../hooks/useGetUsers";
import { CustomPagination } from "../components/CustomPagination";
import LoadingPage from '@/components/shared/LoadingPage';
import ErrorPage from "@/components/shared/ErrorPage";

const UsersPage = () => {

  const { data, isError, isLoading, error } = useGetUsers();

  if (isLoading) return <LoadingPage />

  if (isError || !data?.results) return <ErrorPage error={error?.message || "Error al cargar usuarios"} />

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