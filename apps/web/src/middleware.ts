import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';

const isPublicRoute = createRouteMatcher([
  '/',
  '/how-it-works',
  '/return',
  '/legal(.*)',
  '/security',
  '/status',
  '/sign-in(.*)',
  '/sign-up(.*)'
]);

export default clerkMiddleware(async (auth, req) => {
  if (isPublicRoute(req)) return;
  await auth.protect();
});

export const config = {
  matcher: [
    // Run on all routes except _next and static assets
    '/((?!_next|.*\\.(?:png|jpg|jpeg|svg|ico|css|js|map)).*)'
  ],
};


