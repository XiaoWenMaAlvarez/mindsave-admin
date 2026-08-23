import { useMutation, useQueryClient } from "@tanstack/react-query"
import { deleteUserAction } from "../actions/deleteUser.action";
import { useAuthStore } from "@/auth/store/auth.store";

interface Props {
  userId: string, 
  userName: string,
  isActive: boolean
}

export const DeleteUserButton = ({userId, userName, isActive }: Props ) => {
  const queryClient = useQueryClient();
  const { user } = useAuthStore();

  const { mutate, isPending, isError, error } = useMutation({
    mutationFn: (id: string) => deleteUserAction(id),

    onSuccess: () => {
      queryClient.invalidateQueries({queryKey: ["users"]})
    },

    onError: (err) => {
      alert(`Error al eliminar usuario : ${err.message}`)
    }
  });

  const handleDeleteUser = () => {
    if(confirm(`¿Seguro que desea eliminar al usuario: ${userName}?`)) {
      if(user!.id !== userId) mutate(userId);
    }
  }
  
  return (
    <div>
      <button
      onClick={handleDeleteUser}
      disabled={isPending || !isActive}
      className="bg-red-500 text-white p-2 rounded disabled:bg-gray-400"
      >
        {isPending ? "Eliminando..." : "Eliminar"}
      </button>
      { isError && <p className="text-red-500">{(error as Error).message ?? "Error al intentar eliminar usuario"}</p>}
    </div>
  )
}