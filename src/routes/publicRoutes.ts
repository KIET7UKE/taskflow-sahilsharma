import Login from "@/pages/public/login/login";
import type { RouteOptions } from "./types";
import NotFound from "@/pages/public/notFound/notFound";

export const PublicRoutes: RouteOptions<any>[] = [
  {
    path: "/",
    component: Login,
  },
  {
    path: "/*",
    component: NotFound,
  },
];
