import type { Project, Task } from "@/apis/projects";

export interface DashboardStats {
  totalProjects: number;
  totalTasks: number;
  completedTasks: number;
}

export interface ProjectsState {
  projects: Project[];
  currentProject: Project | null;
  currentProjectTasks: Task[];
  dashboardStats: DashboardStats | null;
  isLoading: boolean;
  error: string | null;
}
