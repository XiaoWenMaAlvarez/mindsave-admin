import SearchBar from "../components/SearchBar";
import UserList from "../components/UserList"
import UserFilters from "../components/UserFilters"
import { useGetUsers } from "../hooks/useGetUsers";
import { CustomPagination } from "../components/CustomPagination";
import LoadingPage from '@/components/shared/LoadingPage';
import ErrorPage from "@/components/shared/ErrorPage";
import { useNavigate } from "react-router";

const UsersPage = () => {

  const { data, isError, isLoading, error } = useGetUsers();

  const navigate = useNavigate();

  if (isLoading) return <LoadingPage />

  if (isError || !data?.results) return <ErrorPage error={error?.message || "Error al cargar usuarios"} />

  const { results, totalPages } = data;

  return (
    <div>
      <SearchBar/>
      <button onClick={() => navigate(`/new-user`)} className="bg-green-500 text-white p-2 rounded disabled:bg-gray-400">Crear usuario</button>
      <UserFilters/>
      <UserList users={results} />
      <CustomPagination totalPages={totalPages} />
    </div>
  );
};

export default UsersPage;