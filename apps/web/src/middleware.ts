import { NextResponse } from 'next/server';

// Temporary pass-through middleware for v0 dev (Clerk middleware will be enabled later)
export function middleware() {
  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!.*\\.\\w+$|_next).*)",
    "/",
    "/(api|trpc)(.*)",
  ],
};


