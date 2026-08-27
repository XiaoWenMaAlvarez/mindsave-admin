import { useCallback, useState } from "react";
import { LoaderCircle, RotateCcw, ShieldCheck } from "lucide-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { useAuthStore } from "@/auth/store/auth.store";
import ConfirmDialog from "@/components/shared/ConfirmDialog";
import { Button } from "@/components/ui/button";
import { restoreUserAction } from "../actions/restoreUser.action";

interface RestoreUserButtonProps {
  isActive: boolean;
  userId: string;
  userName: string;
}

export const RestoreUserButton = ({ userId, userName, isActive }: RestoreUserButtonProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const queryClient = useQueryClient();
  const { user } = useAuthStore();
  const isCurrentUser = user?.id === userId;
  const closeDialog = useCallback(() => setIsOpen(false), []);

  const mutation = useMutation({
    mutationFn: restoreUserAction,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
      queryClient.invalidateQueries({ queryKey: ["user", { id: userId }] });
      toast.success("Usuario restaurado", { description: `${userName} puede volver a acceder a la plataforma.` });
      closeDialog();
    },
    onError: (error) => {
      toast.error("No pudimos restaurar el usuario", { description: error.message });
    },
  });

  const disabled = mutation.isPending || isActive || isCurrentUser;
  const label = isCurrentUser ? "Protegido" : mutation.isPending ? "Restaurando…" : "Restaurar";

  return (
    <>
      <Button
        type="button"
        variant={isActive || isCurrentUser ? "outline" : "secondary"}
        size="xs"
        disabled={disabled}
        onClick={() => setIsOpen(true)}
        title={isCurrentUser ? "No puedes restaurar tu propia cuenta" : undefined}
        aria-label={`${label} a ${userName}`}
        className={!isActive && !isCurrentUser ? "border-success/30 bg-success/10 text-success hover:border-success/45 hover:bg-success/15 hover:text-success" : undefined}
      >
        {mutation.isPending ? <LoaderCircle className="animate-spin" /> : isCurrentUser ? <ShieldCheck /> : <RotateCcw />}
        {label}
      </Button>

      {isOpen && (
        <ConfirmDialog
          variant="success"
          title="Restaurar usuario"
          description={`¿Deseas restaurar a ${userName}? La cuenta recuperará el acceso a la plataforma.`}
          confirmLabel="Restaurar"
          isPending={mutation.isPending}
          onCancel={closeDialog}
          onConfirm={() => mutation.mutate(userId)}
        />
      )}
    </>
  );
};
