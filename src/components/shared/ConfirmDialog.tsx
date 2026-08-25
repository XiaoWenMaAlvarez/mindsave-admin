import { useEffect, useId, useRef } from "react";
import { AlertTriangle, RotateCcw } from "lucide-react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface ConfirmDialogProps {
  confirmLabel?: string;
  description: string;
  isPending?: boolean;
  onCancel: () => void;
  onConfirm: () => void;
  title?: string;
  variant?: "danger" | "success";
}

const ConfirmDialog = ({
  confirmLabel = "Aceptar",
  description,
  isPending = false,
  onCancel,
  onConfirm,
  title = "Confirmar acción",
  variant = "danger",
}: ConfirmDialogProps) => {
  const titleId = useId();
  const descriptionId = useId();
  const cancelButtonRef = useRef<HTMLButtonElement>(null);
  const isDanger = variant === "danger";

  useEffect(() => {
    cancelButtonRef.current?.focus();

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape" && !isPending) onCancel();
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isPending, onCancel]);

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/75 p-4 backdrop-blur-md"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget && !isPending) onCancel();
      }}
    >
      <div
        role="alertdialog"
        aria-modal="true"
        aria-labelledby={titleId}
        aria-describedby={descriptionId}
        className="ms-enter ms-surface relative w-full max-w-md overflow-hidden rounded-3xl p-6 sm:p-8"
      >
        <div
          className={cn(
            "absolute inset-x-8 top-0 h-0.5",
            isDanger
              ? "bg-gradient-to-r from-transparent via-destructive to-transparent"
              : "bg-gradient-to-r from-transparent via-success to-transparent",
          )}
        />

        <div
          className={cn(
            "mb-5 flex size-13 items-center justify-center rounded-full border",
            isDanger
              ? "border-destructive/30 bg-destructive/10 text-destructive"
              : "border-success/30 bg-success/10 text-success",
          )}
        >
          {isDanger ? <AlertTriangle className="size-6" /> : <RotateCcw className="size-6" />}
        </div>

        <h2 id={titleId} className="font-heading text-xl font-semibold text-foreground">{title}</h2>
        <p id={descriptionId} className="mt-2 text-[0.9375rem] leading-6 text-muted-foreground">{description}</p>

        <div className="mt-7 flex flex-col-reverse gap-2.5 sm:flex-row sm:justify-end">
          <Button
            ref={cancelButtonRef}
            type="button"
            variant="outline"
            onClick={onCancel}
            disabled={isPending}
          >
            Cancelar
          </Button>
          <Button
            type="button"
            variant={isDanger ? "destructive" : "default"}
            onClick={onConfirm}
            disabled={isPending}
          >
            {isPending ? "Procesando…" : confirmLabel}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmDialog;
