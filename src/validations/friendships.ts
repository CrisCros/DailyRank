import { z } from "zod";

export const userIdSchema = z.string().cuid("El usuario no es válido.");
export const friendshipIdSchema = z.string().cuid("La solicitud no es válida.");
