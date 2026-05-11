"use server";

import { AuthError } from "next-auth";
import { hash } from "bcryptjs";
import { Prisma } from "@prisma/client";
import { redirect } from "next/navigation";

import { signIn, signOut } from "@/auth";
import { prisma } from "@/lib/prisma";
import { loginSchema, registerSchema } from "@/validations/auth";

function encodeMessage(message: string) {
  return encodeURIComponent(message);
}

export async function registerAction(formData: FormData) {
  const parsed = registerSchema.safeParse({
    name: formData.get("name"),
    username: formData.get("username"),
    email: formData.get("email"),
    password: formData.get("password")
  });

  if (!parsed.success) {
    const message = parsed.error.issues[0]?.message ?? "Revisa los datos del formulario.";
    redirect(`/register?error=${encodeMessage(message)}`);
  }

  const existingUser = await prisma.user.findFirst({
    where: {
      OR: [{ email: parsed.data.email }, { username: parsed.data.username }]
    },
    select: { email: true, username: true }
  });

  if (existingUser?.email === parsed.data.email) {
    redirect(`/register?error=${encodeMessage("Ya existe una cuenta con ese email.")}`);
  }

  if (existingUser?.username === parsed.data.username) {
    redirect(`/register?error=${encodeMessage("Ese username ya está en uso.")}`);
  }

  const passwordHash = await hash(parsed.data.password, 12);

  try {
    await prisma.user.create({
      data: {
        name: parsed.data.name,
        username: parsed.data.username,
        email: parsed.data.email,
        passwordHash,
        settings: {
          create: {}
        }
      }
    });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
      redirect(`/register?error=${encodeMessage("Ese email o username ya está en uso.")}`);
    }

    throw error;
  }

  redirect(`/login?success=${encodeMessage("Cuenta creada. Ya puedes iniciar sesión.")}`);
}

export async function loginAction(formData: FormData) {
  const parsed = loginSchema.safeParse({
    identifier: formData.get("identifier"),
    password: formData.get("password")
  });

  if (!parsed.success) {
    const message = parsed.error.issues[0]?.message ?? "Revisa los datos del formulario.";
    redirect(`/login?error=${encodeMessage(message)}`);
  }

  try {
    await signIn("credentials", {
      identifier: parsed.data.identifier,
      password: parsed.data.password,
      redirectTo: "/dashboard"
    });
  } catch (error) {
    if (error instanceof AuthError) {
      redirect(`/login?error=${encodeMessage("Email, username o contraseña incorrectos.")}`);
    }

    throw error;
  }
}

export async function logoutAction() {
  await signOut({ redirectTo: "/login" });
}
