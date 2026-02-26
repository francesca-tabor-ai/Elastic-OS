export { default } from "next-auth/middleware";

export const config = {
  matcher: ["/dashboard/:path*", "/worker/:path*", "/employer/:path*"],
};
