import { withAuth } from "next-auth/middleware";

export default withAuth(
  function middleware(req) {},
  {
    callbacks: {
      authorized: ({ token, req }) => {
        const { pathname } = req.nextUrl;

        // ✅ разрешаем API без логина
        if (pathname.startsWith("/api")) return true;

        if (!token) return false;

        if (pathname.startsWith("/admin")) {
          return token.role === "admin";
        }

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
  matcher: ["/dashboard/:path*", "/admin/:path*", "/api/:path*"],
};