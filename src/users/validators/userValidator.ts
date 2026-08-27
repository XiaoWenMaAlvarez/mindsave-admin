import { z } from "zod";

export const createUserSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, "El nombre es requerido.")
    .min(2, "El nombre no puede tener menos de 2 caracteres.")
    .max(30, "El nombre no puede superar 30 caracteres."),
  role: z.enum(["USER_ROL", "PROFESIONAL_ROL"], {
    message: "Selecciona un rol válido.",
  }),
  email: z.email("Ingresa un correo electrónico válido."),
  password: z
    .string()
    .min(1, "La contraseña es requerida.")
    .min(6, "La contraseña debe tener al menos 6 caracteres.")
    .max(20, "La contraseña no puede superar 20 caracteres."),
  emailVerified: z.boolean(),
});

export type CreateUserFormValues = z.infer<typeof createUserSchema>;

export const editUserSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, "El nombre es requerido.")
    .min(2, "El nombre no puede tener menos de 2 caracteres.")
    .max(30, "El nombre no puede superar 30 caracteres."),
  role: z.enum(["USER_ROL", "PROFESIONAL_ROL"], {
    message: "Selecciona un rol válido.",
  }),
  email: z.email("Ingresa un correo electrónico válido."),
  password: z
    .string()
    .refine(
      (val) => val === "" || (val.length >= 6 && val.length <= 20),
      {
        message: "La contraseña debe tener al menos 6 y máximo 20 caracteres.",
      },
    ),
  emailVerified: z.boolean(),
});

export type EditUserFormValues = z.infer<typeof editUserSchema>;

export const userSchema = z.object({
  id: z.string().optional(),
  name: z.string().trim().min(2, "El nombre no puede tener menos de 2 caracteres.").max(30, "El nombre no puede superar 30 caracteres."),
  role: z.enum(["USER_ROL", "PROFESIONAL_ROL"], {
    message: "El valor debe ser obligatoriamente 'USER_ROL' o 'PROFESIONAL_ROL'",
  }),
  email: z.email("El correo no es válido."),
  password: z.string().min(6, "La contraseña debe tener al menos 6 caracteres.").max(20, "La contraseña no puede superar 20 caracteres.").optional(),
  emailVerified: z.boolean({ message: "El valor de emailVerified debe ser un booleano" }),
  isActive: z.boolean({ message: "El valor de isActive debe ser un booleano" }).optional(),
});

export default userSchema;