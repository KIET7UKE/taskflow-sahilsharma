import Dashboard from "@/pages/private/dashboard/dashboard";
import ProjectsPage from "@/pages/private/projects/projects";
import ProjectDetailPage from "@/pages/private/projects/[id]/projectDetail";
import type { RouteOptions } from "./types";

export const PrivateRoutes: RouteOptions<any>[] = [
  {
    path: "/dashboard",
    component: Dashboard,
  },
  {
    path: "/projects",
    component: ProjectsPage,
  },
  {
    path: "/projects/:id",
    component: ProjectDetailPage,
  },
];
