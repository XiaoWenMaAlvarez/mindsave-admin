import { useNavigate, useParams } from "react-router";
import { toast } from "sonner";

import ErrorPage from "@/components/shared/ErrorPage";
import LoadingPage from "@/components/shared/LoadingPage";
import UserEditForm from "../components/UserEditForm";
import { useGetUserById } from "../hooks/useGetUserById";
import type { UserResponse } from "../interfaces/UserResponse.interface";
import { useAuthStore } from "@/auth/store/auth.store";

const UserPage = () => {
  const { id = "" } = useParams();
  const navigate = useNavigate();
  const { data: user, isLoading, isError, error, mutation } = useGetUserById(id);
  const { user: authenticatedUser } = useAuthStore();

  

  if (isLoading) return <LoadingPage message="Cargando los datos del usuario" />;
  if (isError || !user) return <ErrorPage error={error?.message ?? "Error al cargar al usuario"} />;

  const onSubmit = async (userEdit: Partial<UserResponse>) => {
    if (authenticatedUser?.email === user?.email && userEdit.role === "USER_ROL") {
      toast.error("No puedes cambiar tu rol", { description: "Solo otro usuario administrador puede cambiar tu rol" });
      return;
    }
    if (authenticatedUser?.email === user?.email && userEdit.emailVerified === false) {
      toast.error("No puedes desverificar tu correo", { description: "Solo otro usuario administrador puede desverificar tu correo" });
      return;
    }
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
