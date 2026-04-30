import { withAuth } from "next-auth/middleware";

export default withAuth(
  function middleware(req) {},
  {
    callbacks: {
      authorized: ({ token, req }) => {
        const { pathname } = req.nextUrl;

        // если не залогинен → нельзя
        if (!token) return false;

        // админка
        if (pathname.startsWith("/admin")) {
          return token.role === "admin";
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
  matcher: [
    "/",                 // 👈 ВАЖНО
    "/dashboard/:path*",
    "/admin/:path*",
  ],
};