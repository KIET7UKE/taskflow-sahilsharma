import Dashboard from "@/pages/private/dashboard/dashboard";
import type { RouteOptions } from "./types";

export const PrivateRoutes: RouteOptions<any>[] = [
  {
    path: "/dashboard",
    component: Dashboard,
  },
];
