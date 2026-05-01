import NextAuth, { type NextAuthOptions } from "next-auth";
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

          // 🔥 создаём уникальную сессию
          const sessionId = randomUUID();

          // 🔴 сохраняем её в базе (перезапишет старую)
          await prisma.user.update({
            where: { id: user.id },
            data: {
              currentSessionId: sessionId,
            },
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
    maxAge: 60 * 60 * 6, // ⏱ 6 часов
  },

  jwt: {
    maxAge: 60 * 60 * 6, // ⏱ 6 часов
  },

  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = user.role;
        token.sessionId = (user as any).sessionId;
      }
      return token;
    },

    async session({ session, token }) {
      if (!session.user) return session;

      // 🔴 проверка сессии против базы
      const dbUser = await prisma.user.findUnique({
        where: { id: token.id as string },
      });

      // ❌ если сессия не совпадает — выкидываем
      if (!dbUser || dbUser.currentSessionId !== token.sessionId) {
        return {} as any;
      }

      session.user.id = token.id as string;
      session.user.role = token.role as string;

      return session;
    },
  },

  secret: process.env.NEXTAUTH_SECRET,
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };