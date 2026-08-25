import type { UserResponse } from "../interfaces/UserResponse.interface";
import UserForm, { type UserFormValues } from "./UserForm";

interface UserEditFormProps {
  email: string;
  emailVerified: boolean;
  isPending: boolean;
  name: string;
  onSubmit: (userEdit: Partial<UserResponse>) => Promise<void>;
  role: "PROFESIONAL_ROL" | "USER_ROL";
}

const UserEditForm = ({ email, emailVerified, isPending, name, onSubmit, role }: UserEditFormProps) => {
  const handleSubmit = async (values: UserFormValues) => {
    const payload: Partial<UserResponse> = { ...values };
    if (!values.password.trim()) delete payload.password;
    await onSubmit(payload);
  };

  return (
    <UserForm
      mode="edit"
      isPending={isPending}
      onSubmit={handleSubmit}
      defaultValues={{ email, emailVerified, name, password: "", role }}
    />
  );
};

export default UserEditForm;
