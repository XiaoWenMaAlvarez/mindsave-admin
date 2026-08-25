import { useCallback, useState } from "react";
import { LoaderCircle, ShieldCheck, Trash2 } from "lucide-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { useAuthStore } from "@/auth/store/auth.store";
import ConfirmDialog from "@/components/shared/ConfirmDialog";
import { Button } from "@/components/ui/button";
import { deleteUserAction } from "../actions/deleteUser.action";

interface DeleteUserButtonProps {
  isActive: boolean;
  userId: string;
  userName: string;
}

export const DeleteUserButton = ({ userId, userName, isActive }: DeleteUserButtonProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const queryClient = useQueryClient();
  const { user } = useAuthStore();
  const isCurrentUser = user?.id === userId;
  const closeDialog = useCallback(() => setIsOpen(false), []);

  const mutation = useMutation({
    mutationFn: deleteUserAction,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
      toast.success("Usuario desactivado", { description: `${userName} ya no puede acceder a la plataforma.` });
      closeDialog();
    },
    onError: (error) => {
      toast.error("No pudimos desactivar el usuario", { description: error.message });
    },
  });

  const disabled = mutation.isPending || !isActive || isCurrentUser;
  const label = isCurrentUser ? "Protegido" : mutation.isPending ? "Eliminando…" : "Eliminar";

  return (
    <>
      <Button
        type="button"
        variant="destructive"
        size="xs"
        disabled={disabled}
        onClick={() => setIsOpen(true)}
        title={isCurrentUser ? "No puedes eliminar tu propia cuenta" : undefined}
        aria-label={`${label} a ${userName}`}
      >
        {mutation.isPending ? <LoaderCircle className="animate-spin" /> : isCurrentUser ? <ShieldCheck /> : <Trash2 />}
        {label}
      </Button>

      {isOpen && (
        <ConfirmDialog
          title="Desactivar usuario"
          description={`¿Seguro que deseas desactivar a ${userName}? La cuenta podrá restaurarse más adelante.`}
          confirmLabel="Desactivar"
          isPending={mutation.isPending}
          onCancel={closeDialog}
          onConfirm={() => mutation.mutate(userId)}
        />
      )}
    </>
  );
};
