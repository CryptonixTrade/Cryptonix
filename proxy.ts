import { withAuth } from "next-auth/middleware";
import type { NextFetchEvent } from "next/server";
import type { NextRequestWithAuth } from "next-auth/middleware";

const authProxy = withAuth(
  function proxy() {},
  {
    callbacks: {
      authorized: ({ token, req }) => {
        const { pathname } = req.nextUrl;

        if (pathname.startsWith("/admin")) {
          return Boolean(token?.id && token.role === "admin" && !token.invalid);
        }

        if (pathname.startsWith("/dashboard")) {
          return Boolean(token?.id && !token.invalid);
        }

        return true;
      },
    },

    pages: {
      signIn: "/login",
    },
  }
);

export function proxy(req: NextRequestWithAuth, event: NextFetchEvent) {
  return authProxy(req, event);
}

export const config = {
  matcher: ["/dashboard/:path*", "/admin/:path*"],
};
