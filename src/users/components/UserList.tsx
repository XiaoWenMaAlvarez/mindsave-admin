import { useNavigate } from "react-router";
import type { UserResponse } from "../interfaces/UserResponse.interface";
import { DeleteUserButton } from "./DeleteUserButton";
import { RestoreUserButton } from "./RestoreUserButton";
import { useAuthStore } from "@/auth/store/auth.store";

interface Props {
  users: UserResponse[];
}

const UserList = ({ users }: Props) => {

  const navigate = useNavigate()
  const { user } = useAuthStore();

  const idUserAuth = user!.id

  if (users.length === 0) {
    return (
      <div>
        <h1>No hay usuarios</h1>
      </div>
    )
  }

  return (
    <div>
      <table className="">
        <thead>
          <tr>
            <th>Nombre</th>
            <th>Email</th>
            <th>Rol</th>
            <th>Estado</th>
            <th>Estado del correo</th>
            <th>Editar</th>
            <th>Eliminar</th>
            <th>Restaurar</th>
          </tr>
        </thead>
        <tbody>
          {users.map((user) => (
            <tr key={user.id}>
              <td>{user.name}</td>
              <td>{user.email}</td>
              <td>{user.role}</td>
              <td>{user.isActive ? "Activo" : "Inactivo"}</td>
              <td>{user.emailVerified ? "Verificado" : "No verificado"}</td>
              <td><button onClick={() => navigate(`/users/${user.id}`)} className="bg-blue-500 text-white p-2 rounded disabled:bg-gray-400">Editar</button></td>
              {idUserAuth !== user.id && (
                <>
                  <td><DeleteUserButton userId= {user.id} userName={user.name}  isActive={user.isActive}/></td>
                  <td><RestoreUserButton userId= {user.id} userName={user.name} isActive={user.isActive} /></td>
                </>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}   

export default UserList