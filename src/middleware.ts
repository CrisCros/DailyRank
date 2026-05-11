import { auth } from "@/auth";

const privateRoutes = ["/dashboard", "/profile", "/settings"];

export default auth((req) => {
  const isPrivateRoute = privateRoutes.some((route) => req.nextUrl.pathname.startsWith(route));

  if (!req.auth && isPrivateRoute) {
    const loginUrl = new URL("/login", req.nextUrl.origin);
    loginUrl.searchParams.set("callbackUrl", req.nextUrl.pathname);
    return Response.redirect(loginUrl);
  }
});

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"]
};
