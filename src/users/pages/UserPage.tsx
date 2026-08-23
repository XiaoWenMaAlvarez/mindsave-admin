import { useNavigate, useParams } from "react-router";
import { useGetUserById } from "@/users/hooks/useGetUserById"
import LoadingPage from '@/components/shared/LoadingPage';
import ErrorPage from "@/components/shared/ErrorPage";
import UserEditForm from "../components/UserEditForm";
import type { UserResponse } from "../interfaces/UserResponse.interface";
import { toast } from "sonner";


const UserPage = () => {
  const { id } = useParams()
  const navigate = useNavigate()

  const { data: user, isLoading, isError, error, mutation } = useGetUserById(id || "");

  if (isLoading) return <LoadingPage />

  if (isError || !user) return <ErrorPage error={error?.message || "Error al cargar al usuario"} />

  const { email, name, password, emailVerified, role } = user;

  const onSubmit = async (userEdit: Partial<UserResponse>): Promise<void> => {
    userEdit.id = id;
    await mutation.mutateAsync(userEdit, {
      onSuccess: (id) => {
        toast.success("Usuario editado con éxito", {position: "top-right"});
        navigate(`/users/${id}`);
      },
      onError: (error) => {
        toast.error(`Error al editar usuario: ${error.message}`)
      }
    })
  }

  return (
    <div>
      <UserEditForm 
      email={email} 
      name={name} 
      password={password} 
      emailVerified={emailVerified} 
      role={role} 
      isPending={mutation.isPending} 
      onSubmit={onSubmit } />
    </div>
  )
}

export default UserPage;