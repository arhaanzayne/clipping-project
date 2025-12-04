// middleware.ts
import { clerkMiddleware } from "@clerk/nextjs/server";

export default clerkMiddleware();

export const config = {
  matcher: [
    // Clerk runs on all routes except static assets
    "/((?!_next/static|_next/image|favicon.ico).*)",
  ],
};


