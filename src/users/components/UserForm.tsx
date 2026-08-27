import { ArrowLeft, Check, Mail, Plus, Save, X } from "lucide-react";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Link } from "react-router";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { createUserSchema, editUserSchema } from "../validators/userValidator";

export interface UserFormValues {
  email: string;
  emailVerified: boolean;
  name: string;
  password: string;
  role: "PROFESIONAL_ROL" | "USER_ROL";
}

interface UserFormProps {
  defaultValues: UserFormValues;
  isPending: boolean;
  mode: "create" | "edit";
  onSubmit: (values: UserFormValues) => Promise<void>;
}

const UserForm = ({ defaultValues, isPending, mode, onSubmit }: UserFormProps) => {
  const isEdit = mode === "edit";
  const schema = isEdit ? editUserSchema : createUserSchema;

  const {
    control,
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<UserFormValues>({
    resolver: zodResolver(schema),
    defaultValues,
  });

  const emailVerified = useWatch({
    control,
    name: "emailVerified",
    defaultValue: defaultValues.emailVerified,
  });

  return (
    <main className="mx-auto w-full max-w-4xl px-4 py-8 sm:px-6 sm:py-10 lg:px-8">
      <div className="ms-enter">
        <div className="mb-5 flex justify-end">
          <Link
            to="/users"
            className="inline-flex items-center gap-1.5 rounded-lg text-[0.8125rem] font-medium text-[#4a7070] outline-none transition-colors hover:text-primary focus-visible:ring-2 focus-visible:ring-ring/70"
          >
            <ArrowLeft className="size-3.5" />
            Volver a usuarios
          </Link>
        </div>

        <p className="ms-section-label">Gestión de usuarios</p>
        <h1 className="mt-2 font-heading text-3xl font-semibold text-foreground">
          {isEdit ? "Edición de usuario" : "Creación de usuario"}
        </h1>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">
          {isEdit
            ? "Actualiza los datos de la cuenta. Deja la contraseña vacía para mantener la actual."
            : "Completa la información necesaria para registrar una nueva cuenta en MindSave."}
        </p>

        <section className="ms-surface relative mt-7 overflow-hidden rounded-3xl">
          <div className="ms-accent-line absolute inset-x-10 top-0 h-0.5" />

          <form onSubmit={handleSubmit(onSubmit)} className="p-5 sm:p-8 lg:p-10" noValidate>
            <h2 className="font-heading text-xl font-semibold text-foreground">Datos del usuario</h2>
            <div className="mt-7 space-y-6">
              <FormField
                id="name"
                label="Nombre del usuario"
                error={errors.name?.message}
              >
                <Input
                  id="name"
                  type="text"
                  autoComplete="name"
                  placeholder="Nombre del usuario"
                  aria-invalid={Boolean(errors.name)}
                  disabled={isPending}
                  {...register("name")}
                />
              </FormField>

              <FormField id="role" label="Rol del usuario" error={errors.role?.message}>
                <select
                  id="role"
                  className="h-12 w-full rounded-xl border border-input bg-[#0a1a1a] px-4 text-[0.9375rem] text-foreground outline-none transition-colors focus:border-ring focus:ring-2 focus:ring-ring/15 disabled:cursor-not-allowed disabled:opacity-50"
                  disabled={isPending}
                  {...register("role")}
                >
                  <option value="USER_ROL">Usuario</option>
                  <option value="PROFESIONAL_ROL">Administrador</option>
                </select>
              </FormField>

              <FormField id="email" label="Correo electrónico" error={errors.email?.message}>
                <Input
                  id="email"
                  type="email"
                  autoComplete="email"
                  placeholder="correo@ejemplo.com"
                  aria-invalid={Boolean(errors.email)}
                  disabled={isPending}
                  {...register("email")}
                />
              </FormField>

              <FormField id="password" label="Contraseña" error={errors.password?.message}>
                <Input
                  id="password"
                  type="password"
                  autoComplete="new-password"
                  placeholder={isEdit ? "Dejar en blanco para no cambiar" : "Contraseña (mínimo 6 caracteres)"}
                  aria-invalid={Boolean(errors.password)}
                  disabled={isPending}
                  {...register("password")}
                />
              </FormField>

              <div>
                <Label htmlFor="emailVerified">Verificación del correo electrónico</Label>
                <input
                  id="emailVerified"
                  type="checkbox"
                  className="peer sr-only"
                  disabled={isPending}
                  {...register("emailVerified")}
                />
                <label
                  htmlFor="emailVerified"
                  className={cn(
                    "mt-2 flex cursor-pointer items-center gap-3 rounded-xl border bg-[#0a1a1a] p-4 outline-none transition-all peer-focus-visible:ring-2 peer-focus-visible:ring-ring/70 peer-disabled:cursor-not-allowed peer-disabled:opacity-50",
                    emailVerified ? "border-primary/30 bg-primary/6" : "border-border",
                  )}
                >
                  <span
                    className={cn(
                      "flex size-10 shrink-0 items-center justify-center rounded-xl border transition-colors",
                      emailVerified
                        ? "border-primary/30 bg-primary/10 text-primary"
                        : "border-border bg-secondary/40 text-[#4a7070]",
                    )}
                  >
                    {emailVerified ? <Check className="size-4" /> : <Mail className="size-4" />}
                  </span>

                  <span className="min-w-0 flex-1">
                    <span className="block text-sm font-medium text-foreground">Correo electrónico</span>
                    <span className={cn("mt-0.5 block text-xs", emailVerified ? "text-primary" : "text-muted-foreground")}>
                      {emailVerified ? "La dirección de correo ha sido verificada" : "Pendiente de verificación"}
                    </span>
                  </span>

                  <span
                    className={cn(
                      "hidden shrink-0 rounded-full border px-2.5 py-1 text-[0.6875rem] font-semibold sm:inline-flex",
                      emailVerified
                        ? "border-success/25 bg-success/10 text-success"
                        : "border-warning/25 bg-warning/10 text-warning",
                    )}
                  >
                    {emailVerified ? "Verificado" : "No verificado"}
                  </span>

                  <span
                    aria-hidden="true"
                    className={cn(
                      "relative h-6 w-11 shrink-0 rounded-full border transition-colors",
                      emailVerified ? "border-primary bg-primary" : "border-border bg-[#1c3838]",
                    )}
                  >
                    <span
                      className={cn(
                        "absolute top-0.75 size-4 rounded-full shadow transition-all",
                        emailVerified ? "left-5.5 bg-[#061010]" : "left-0.75 bg-muted-foreground",
                      )}
                    />
                  </span>
                </label>
              </div>
            </div>

            <div className="mt-8 flex flex-col-reverse gap-2.5 border-t border-border pt-6 sm:flex-row sm:justify-end">
              <Link
                to="/users"
                className="inline-flex h-10 items-center justify-center gap-2 rounded-xl border border-border px-4 text-sm font-semibold text-muted-foreground transition-colors hover:border-[#315858] hover:bg-secondary/70 hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/70"
              >
                <X className="size-4" />
                Cancelar
              </Link>
              <Button type="submit" disabled={isPending}>
                {isEdit ? <Save /> : <Plus />}
                {isPending
                  ? isEdit ? "Guardando…" : "Creando…"
                  : isEdit ? "Guardar cambios" : "Crear usuario"}
              </Button>
            </div>
          </form>
        </section>
      </div>
    </main>
  );
};

interface FormFieldProps {
  children: React.ReactNode;
  error?: string;
  id: string;
  label: string;
}

const FormField = ({ children, error, id, label }: FormFieldProps) => (
  <div className="space-y-2">
    <Label htmlFor={id}>{label}</Label>
    {children}
    {error && <p className="text-xs text-destructive" role="alert">{error}</p>}
  </div>
);

export default UserForm;
