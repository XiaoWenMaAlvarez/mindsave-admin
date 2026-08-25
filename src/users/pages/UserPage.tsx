import { useNavigate, useParams } from "react-router";
import { toast } from "sonner";

import ErrorPage from "@/components/shared/ErrorPage";
import LoadingPage from "@/components/shared/LoadingPage";
import UserEditForm from "../components/UserEditForm";
import { useGetUserById } from "../hooks/useGetUserById";
import type { UserResponse } from "../interfaces/UserResponse.interface";

const UserPage = () => {
  const { id = "" } = useParams();
  const navigate = useNavigate();
  const { data: user, isLoading, isError, error, mutation } = useGetUserById(id);

  if (isLoading) return <LoadingPage message="Cargando los datos del usuario" />;
  if (isError || !user) return <ErrorPage error={error?.message ?? "Error al cargar al usuario"} />;

  const onSubmit = async (userEdit: Partial<UserResponse>) => {
    await mutation.mutateAsync(
      { ...userEdit, id },
      {
        onSuccess: () => {
          toast.success("Cambios guardados", { description: `${userEdit.name ?? user.name} fue actualizado correctamente.` });
          navigate("/users");
        },
        onError: (mutationError) => {
          toast.error("No pudimos editar el usuario", { description: mutationError.message });
        },
      },
    );
  };

  return (
    <UserEditForm
      email={user.email}
      name={user.name}
      emailVerified={user.emailVerified}
      role={user.role}
      isPending={mutation.isPending}
      onSubmit={onSubmit}
    />
  );
};

export default UserPage;
