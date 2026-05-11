import type { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { PrismaAdapter } from "@next-auth/prisma-adapter";
import { compare } from "bcryptjs";

import { prisma } from "@/lib/prisma";
import { loginSchema } from "@/validations/auth";

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  session: {
    strategy: "jwt",
  },
  pages: {
    signIn: "/login",
  },
  providers: [
    CredentialsProvider({
      name: "Credenciales",
      credentials: {
        identifier: { label: "Email o username", type: "text" },
        password: { label: "Contraseña", type: "password" },
      },
      async authorize(credentials) {
        const parsed = loginSchema.safeParse(credentials);

        if (!parsed.success) {
          return null;
        }

        const identifier = parsed.data.identifier.toLowerCase();

        const user = await prisma.user.findFirst({
          where: {
            OR: [{ email: identifier }, { username: identifier }],
          },
        });

        if (!user) {
          return null;
        }

        const isValidPassword = await compare(parsed.data.password, user.passwordHash);

        if (!isValidPassword) {
          return null;
        }

        return {
          id: user.id,
          name: user.name,
          email: user.email,
          image: user.image,
          username: user.username,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;

        if ("username" in user) {
          token.username = user.username;
        }
      }

      return token;
    },
    async session({ session, token }) {
      if (session.user && token.id) {
        const user = await prisma.user.findUnique({
          where: { id: token.id },
          select: { id: true, name: true, email: true, image: true, username: true },
        });

        if (user) {
          session.user.id = user.id;
          session.user.name = user.name;
          session.user.email = user.email;
          session.user.image = user.image;
          session.user.username = user.username;
        }
      }

      return session;
    },
  },
};