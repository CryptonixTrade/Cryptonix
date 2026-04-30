import { withAuth } from "next-auth/middleware";

export default withAuth(
  function middleware(req) {},
  {
    callbacks: {
      authorized: ({ token, req }) => {
        const { pathname } = req.nextUrl;

        // ❌ не авторизован — вообще никуда
        if (!token) return false;

        // 👑 доступ к админке только admin
        if (pathname.startsWith("/admin")) {
          return token.role === "admin";
        }

        // 🔒 dashboard — любой авторизованный
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