import { z } from "zod";

export const postMoods = [
  "HAPPY",
  "TIRED",
  "PRODUCTIVE",
  "STRESSED",
  "CALM",
  "MOTIVATED",
  "BAD_DAY",
  "NORMAL_DAY",
] as const;

export const postVisibilities = ["PRIVATE", "FRIENDS", "PUBLIC"] as const;

export const moodLabels: Record<(typeof postMoods)[number], string> = {
  HAPPY: "Feliz",
  TIRED: "Cansado",
  PRODUCTIVE: "Productivo",
  STRESSED: "Estresado",
  CALM: "Tranquilo",
  MOTIVATED: "Motivado",
  BAD_DAY: "Mal día",
  NORMAL_DAY: "Día normal",
};

export const visibilityLabels: Record<(typeof postVisibilities)[number], string> = {
  PRIVATE: "Solo yo",
  FRIENDS: "Amigos",
  PUBLIC: "Público",
};

const optionalMoodSchema = z
  .union([z.enum(postMoods), z.literal("")])
  .optional()
  .transform((value) => (value ? value : null));

const optionalDescriptionSchema = z
  .string()
  .trim()
  .max(1200, "La descripción no puede superar 1200 caracteres.")
  .optional()
  .transform((value) => (value ? value : null));

const optionalPhotoUrlSchema = z
  .string()
  .trim()
  .max(2048, "La URL de la foto no puede superar 2048 caracteres.")
  .optional()
  .transform((value) => (value ? value : null));

export const postSchema = z.object({
  rating: z.coerce
    .number({ message: "La nota del día es obligatoria." })
    .int("La nota debe ser un número entero.")
    .min(1, "La nota mínima es 1.")
    .max(10, "La nota máxima es 10."),
  title: z
    .string()
    .trim()
    .min(1, "El título es obligatorio.")
    .max(120, "El título no puede superar 120 caracteres."),
  description: optionalDescriptionSchema,
  mood: optionalMoodSchema,
  visibility: z.enum(postVisibilities, { message: "Selecciona una visibilidad válida." }),
  photoUrl: optionalPhotoUrlSchema,
});

export type PostInput = z.infer<typeof postSchema>;
