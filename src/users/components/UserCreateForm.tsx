import type { NewUser } from "../interfaces/NewUser.interface";
import UserForm, { type UserFormValues } from "./UserForm";

interface UserCreateFormProps {
  isPending: boolean;
  onSubmit: (newUser: NewUser) => Promise<void>;
}

const UserCreateForm = ({ isPending, onSubmit }: UserCreateFormProps) => {
  const handleSubmit = async (values: UserFormValues) => onSubmit(values);

  return (
    <UserForm
      mode="create"
      isPending={isPending}
      onSubmit={handleSubmit}
      defaultValues={{
        email: "",
        emailVerified: false,
        name: "",
        password: "",
        role: "USER_ROL",
      }}
    />
  );
};

export default UserCreateForm;
