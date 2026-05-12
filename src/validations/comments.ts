import { z } from "zod";

export const commentIdSchema = z.string().trim().min(1, "El comentario no es válido.").cuid("El comentario no es válido.");

export const commentContentSchema = z.object({
  content: z.string().trim().min(1, "El comentario no puede estar vacío.").max(500, "El comentario no puede superar los 500 caracteres."),
});
