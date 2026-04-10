import type { Project, Task } from "@/apis/projects";

export interface ProjectsState {
  projects: Project[];
  currentProject: Project | null;
  currentProjectTasks: Task[];
  isLoading: boolean;
  error: string | null;
}
