import { withAuth } from "next-auth/middleware";

export default withAuth(
  function middleware(req) {},
  {
    callbacks: {
      authorized: ({ token, req }) => {
        const { pathname } = req.nextUrl;

        // API можно оставить открытым или закрыть отдельно
        if (pathname.startsWith("/api")) return true;

        // ❌ нет токена — нет доступа
        if (!token) return false;

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