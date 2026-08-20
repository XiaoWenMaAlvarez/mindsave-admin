import type { User } from "../interfaces/user.interface";

interface Props {
  users: User[];
}


const UserList = ({ users }: Props) => {

  if (users.length === 0) {
    return (
      <div>
        <h1>Cargando usuarios...</h1>
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
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}   

export default UserList