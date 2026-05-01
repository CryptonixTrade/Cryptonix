import { withAuth } from "next-auth/middleware";
import { prisma } from "@/lib/prisma";

export default withAuth(
  async function middleware(req) {},
  {
    callbacks: {
      async authorized({ token, req }) {
        const { pathname } = req.nextUrl;

        // ✅ API не трогаем
        if (pathname.startsWith("/api")) return true;

        // ❌ нет токена — нет доступа
        if (!token) return false;

        // 🔒 проверка sessionId (1 устройство)
        const user = await prisma.user.findUnique({
          where: { id: token.id as string },
        });

        if (!user || user.currentSessionId !== token.sessionId) {
          return false;
        }

        // 🔐 admin доступ
        if (pathname.startsWith("/admin")) {
          return token.role === "admin";
        }

        // dashboard доступ
        if (pathname.startsWith("/dashboard")) {
          return true;
        }

        return true;
      },
    },

    pages: {
      signIn: "/login",
    },
  }
);

export const config = {
  matcher: ["/dashboard/:path*", "/admin/:path*"],
};