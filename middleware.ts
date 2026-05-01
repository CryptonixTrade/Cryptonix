import { withAuth } from "next-auth/middleware";

export default withAuth(
  function middleware(req) {},
  {
    callbacks: {
      authorized: ({ token, req }) => {
        const { pathname } = req.nextUrl;

        // API не трогаем
        if (pathname.startsWith("/api")) return true;

        // ❌ если нет нормального токена — сразу редирект
        if (!token || !token.id || (token as any).invalid) {
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