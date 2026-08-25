import { useNavigate } from "react-router";
import { toast } from "sonner";

import UserCreateForm from "../components/UserCreateForm";
import { useCreateUser } from "../hooks/useCreateUser";
import type { NewUser } from "../interfaces/NewUser.interface";

const NewUserPage = () => {
  const mutation = useCreateUser();
  const navigate = useNavigate();

  const onSubmit = async (newUser: NewUser) => {
    await mutation.mutateAsync(newUser, {
      onSuccess: () => {
        toast.success("Usuario creado", { description: `${newUser.name} fue registrado correctamente.` });
        navigate("/users");
      },
      onError: (error) => {
        toast.error("No pudimos crear el usuario", { description: error.message });
      },
    });
  };

  return <UserCreateForm isPending={mutation.isPending} onSubmit={onSubmit} />;
};

export default NewUserPage;
