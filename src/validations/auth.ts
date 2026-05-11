import { z } from "zod";

const usernameRegex = /^[a-zA-Z0-9_]{3,20}$/;

export const registerSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "El nombre debe tener al menos 2 caracteres.")
    .max(80, "El nombre no puede superar 80 caracteres."),
  username: z
    .string()
    .trim()
    .toLowerCase()
    .regex(usernameRegex, "El username debe tener 3-20 caracteres y solo letras, números o guiones bajos."),
  email: z.string().trim().toLowerCase().email("Introduce un email válido."),
  password: z
    .string()
    .min(8, "La contraseña debe tener al menos 8 caracteres.")
    .max(128, "La contraseña no puede superar 128 caracteres.")
    .regex(/[a-z]/, "La contraseña debe incluir una letra minúscula.")
    .regex(/[A-Z]/, "La contraseña debe incluir una letra mayúscula.")
    .regex(/[0-9]/, "La contraseña debe incluir un número.")
});

export const loginSchema = z.object({
  identifier: z.string().trim().min(1, "Introduce tu email o username."),
  password: z.string().min(1, "Introduce tu contraseña.")
});

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
