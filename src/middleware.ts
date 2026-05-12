export { default } from "next-auth/middleware";

export const config = {
  matcher: ["/dashboard/:path*", "/feed/:path*", "/profile/:path*", "/settings/:path*", "/day/:path*", "/posts/:path*"],
};
