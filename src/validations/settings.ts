import { z } from "zod";

const usernameRegex = /^[a-zA-Z0-9_]{3,20}$/;
const themeModes = ["LIGHT", "DARK", "SYSTEM"] as const;

export const accountSettingsSchema = z
  .object({
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
    bio: z
      .string()
      .trim()
      .max(280, "La biografía no puede superar 280 caracteres.")
      .optional()
      .transform((value) => (value ? value : null)),
    theme: z.enum(themeModes),
    currentPassword: z.string().optional(),
    newPassword: z
      .string()
      .optional()
      .transform((value) => (value ? value : undefined)),
  })
  .superRefine((data, context) => {
    if (!data.newPassword) {
      return;
    }

    if (!data.currentPassword) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Introduce tu contraseña actual para cambiarla.",
        path: ["currentPassword"],
      });
    }

    if (data.newPassword.length < 8) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        message: "La nueva contraseña debe tener al menos 8 caracteres.",
        path: ["newPassword"],
      });
    }

    if (data.newPassword.length > 128) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        message: "La nueva contraseña no puede superar 128 caracteres.",
        path: ["newPassword"],
      });
    }

    if (!/[a-z]/.test(data.newPassword)) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        message: "La nueva contraseña debe incluir una letra minúscula.",
        path: ["newPassword"],
      });
    }

    if (!/[A-Z]/.test(data.newPassword)) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        message: "La nueva contraseña debe incluir una letra mayúscula.",
        path: ["newPassword"],
      });
    }

    if (!/[0-9]/.test(data.newPassword)) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        message: "La nueva contraseña debe incluir un número.",
        path: ["newPassword"],
      });
    }
  });

export type AccountSettingsInput = z.infer<typeof accountSettingsSchema>;
