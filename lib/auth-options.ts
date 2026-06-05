import { type NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { randomUUID } from "crypto";

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",

      credentials: {
        username: { label: "Username", type: "text" },
        password: { label: "Password", type: "password" },
      },

      async authorize(credentials) {
        try {
          if (!credentials?.username || !credentials?.password) {
            return null;
          }

          const user = await prisma.user.findUnique({
            where: { username: credentials.username },
          });

          if (!user) return null;

          const isValid = await bcrypt.compare(
            credentials.password,
            user.password
          );

          if (!isValid) return null;

          const sessionId = randomUUID();

          await prisma.user.update({
            where: { id: user.id },
            data: { currentSessionId: sessionId },
          });

          return {
            id: user.id,
            name: user.username,
            role: user.role,
            sessionId,
          };
        } catch (e) {
          console.error("AUTH ERROR:", e);
          return null;
        }
      },
    }),
  ],

  session: {
    strategy: "jwt",
    maxAge: 60 * 60 * 6,
  },

  jwt: {
    maxAge: 60 * 60 * 6,
  },

  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = user.role;
        token.sessionId = user.sessionId;
        token.invalid = false;
        return token;
      }

      if (!token?.id) return token;

      const dbUser = await prisma.user.findUnique({
        where: { id: token.id },
      });

      if (!dbUser) return token;

      if (dbUser.currentSessionId !== token.sessionId) {
        token.invalid = true;
      }

      return token;
    },

    async session({ session, token }) {
      if (token.invalid) {
        session.user.id = "";
        session.user.role = "";
        return session;
      }

      if (session.user) {
        session.user.id = token.id;
        session.user.role = token.role;
      }

      return session;
    },
  },

  secret: process.env.NEXTAUTH_SECRET,
};
