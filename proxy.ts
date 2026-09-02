//proxy.ts

import { auth } from "@/lib/auth/server";
import { NextRequest } from "next/server";

export default auth.middleware({
  // Redirects unauthenticated users to sign-in page
  loginUrl: "/auth/sign-in",
});

export const config = {
  matcher: [
    {
      source: "/dashboard/:path*",
      missing: [{ type: "header", key: "next-action" }],
    },
    {
      source: "/events/:path*",
      missing: [{ type: "header", key: "next-action" }],
    },
  ],
};
