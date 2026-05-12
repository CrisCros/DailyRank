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

const ratingSchema = z
  .string({ message: "La nota del día es obligatoria." })
  .trim()
  .min(1, "La nota del día es obligatoria.")
  .regex(/^\d+(?:\.\d{1,2})?$/, "La nota debe ser numérica y tener como máximo 2 decimales.")
  .transform((value) => Number(value))
  .refine((value) => value >= 1, "La nota mínima es 1.")
  .refine((value) => value <= 10, "La nota máxima es 10.");

export const postSchema = z.object({
  rating: ratingSchema,
  title: z
    .string()
    .trim()
    .min(1, "El título es obligatorio.")
    .max(120, "El título no puede superar 120 caracteres."),
  description: optionalDescriptionSchema,
  mood: optionalMoodSchema,
  visibility: z.enum(postVisibilities, { message: "Selecciona una visibilidad válida." }),
});

export type PostInput = z.infer<typeof postSchema>;
