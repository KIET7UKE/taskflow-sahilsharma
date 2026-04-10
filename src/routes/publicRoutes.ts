import AuthPage from "@/pages/public/auth/auth";
import type { RouteOptions } from "./types";
import NotFound from "@/pages/public/notFound/notFound";

export const PublicRoutes: RouteOptions<any>[] = [
  {
    path: "/",
    component: AuthPage,
  },
  {
    path: "/*",
    component: NotFound,
  },
];
