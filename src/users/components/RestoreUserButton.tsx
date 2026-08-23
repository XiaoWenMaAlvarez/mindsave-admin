import { useMutation, useQueryClient } from "@tanstack/react-query"
import { restoreUserAction } from "../actions/restoreUser.action";

interface Props {
  userId: string, 
  userName: string,
  isActive: boolean
}

export const RestoreUserButton = ({userId, userName, isActive }: Props) => {
  const queryClient = useQueryClient();

  const { mutate, isPending, isError, error } = useMutation({
    mutationFn: (id: string) => restoreUserAction(id),

    onSuccess: () => {
      queryClient.invalidateQueries({queryKey: ["users"]})
    },

    onError: (err) => {
      alert(`Error al restaurar al usuario : ${err.message}`)
    }
  });

  const handleRestoreUser = () => {
    if(confirm(`¿Seguro que desea restaurar al usuario: ${userName}?`)) {
      mutate(userId);
    }
  }
  
  return (
    <div>
      <button
      onClick={handleRestoreUser}
      disabled={isPending || isActive}
      className="bg-green-500 text-white p-2 rounded disabled:bg-gray-400"
      >
        {isPending ? "Restaurando..." : "Restaurar"}
      </button>
      { isError && <p className="text-red-500">{(error as Error).message ?? "Error al intentar restaurar usuario"}</p>}
    </div>
  )
}