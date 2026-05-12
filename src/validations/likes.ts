import { z } from "zod";

export const postIdSchema = z.string().trim().min(1, "La publicación no es válida.").cuid("La publicación no es válida.");
