import { withAuth } from "next-auth/middleware";
import type { NextRequest } from "next/server";

// next-auth v4 withAuth returns a middleware-compatible handler.
// Next.js 16 requires the exported function to be named `proxy`.
export const proxy = withAuth({
  pages: {
    signIn: "/login",
  },
});

export const config = {
  matcher: ["/dashboard/:path*"],
};
