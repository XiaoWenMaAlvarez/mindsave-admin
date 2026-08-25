
import { useNavigate } from "react-router";
import type { NewUser } from "../interfaces/NewUser.interface";
import { toast } from "sonner";
import { useCreateUser } from "../hooks/useCreateUser";
import UserCreateForm from "../components/UserCreateForm.";

const NewUserPage = () => {

  const mutation = useCreateUser();

  const navigate = useNavigate();

  const goBack = () => {
    navigate(`/users`)
  }

  const onSubmit = async (newUser: NewUser): Promise<void> => {
    await mutation.mutateAsync(newUser, {
      onSuccess: () => {
        toast.success("Usuario creado con éxito", {position: "top-right"});
        goBack();
      },
      onError: (error) => {
        toast.error(`Error al crear usuario: ${error.message}`)
      }
    })
  }

  return (
    <div>
      <button onClick={goBack} className="bg-gray-500 text-white p-2 rounded">Volver</button>
      <UserCreateForm 
      isPending={mutation.isPending} 
      onSubmit={onSubmit} />
    </div>
  )
}

export default NewUserPage;