import { useState, useEffect } from "react";
import type { User } from "../interfaces/user.interface";
import SearchBar from "../components/SearchBar";
import UserList from "../components/UserList"
import { getUsersByQuery} from "../actions/get-users-by-query.action"
import { getAllUsers } from "../actions/get-all-users.action";

const UsersPage = () => {

  const [users, setUsers] = useState<User[]>([]);

  useEffect(() => {
    getAllUsers()
      .then(users => setUsers(users))
      .catch(error => console.error(error));
  }, []);

  const handleSearch = async (query: string) => {
    query = query.trim().toLowerCase();

    if (query.length === 0) return;

    const usersFound = await getUsersByQuery(query);
    setUsers(usersFound);
  }

  return (
    <div>
      <SearchBar placeholder="Buscar por nombre o email" onQuery={handleSearch} />
      <UserList users={users} />
    </div>
  );
};

export default UsersPage;