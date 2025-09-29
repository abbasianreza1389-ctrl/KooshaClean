import createMiddleware from "next-intl/middleware";
export default createMiddleware({
  locales: ["fa","en","ar"],
  defaultLocale: "fa"
});
export const config = { matcher: ["/((?!_next|.*\\..*).*)"] };
