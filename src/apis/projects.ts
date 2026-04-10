import { getAPI, postAPI, patchAPI, deleteAPI } from "./api";

export interface Project {
  id: string;
  name: string;
  description: string;
  owner_id: string;
  created_at: string;
}

export interface ProjectWithTasks extends Project {
  tasks: Task[];
}

export interface Task {
  id: string;
  title: string;
  description: string;
  status: "todo" | "in_progress" | "done";
  priority: "low" | "medium" | "high";
  project_id: string;
  assignee_id: string | null;
  due_date: string | null;
  created_at: string;
  updated_at: string;
}

export interface CreateProjectRequest {
  name: string;
  description?: string;
}

export interface CreateTaskRequest {
  title: string;
  description?: string;
  priority?: "low" | "medium" | "high";
  assignee_id?: string;
  due_date?: string;
}

export interface UpdateTaskRequest {
  title?: string;
  description?: string;
  status?: "todo" | "in_progress" | "done";
  priority?: "low" | "medium" | "high";
  assignee_id?: string | null;
  due_date?: string | null;
}

interface ProjectsResponse {
  projects: Project[];
}

export const projectsApi = {
  list: () => getAPI<ProjectsResponse>("/projects"),

  getById: (id: string) => getAPI<ProjectWithTasks>(`/projects/${id}`),

  create: (data: CreateProjectRequest) =>
    postAPI<Project>("/projects", data),

  update: (id: string, data: Partial<CreateProjectRequest>) =>
    patchAPI<Project>(`/projects/${id}`, data),

  delete: (id: string) => deleteAPI<void>(`/projects/${id}`),

  fetchStats: () => getAPI<{ totalProjects: number; totalTasks: number; completedTasks: number }>("/stats"),
};

export const tasksApi = {
  list: (projectId: string, params?: { status?: string; assignee?: string }) =>
    getAPI<{ tasks: Task[] }>(`/projects/${projectId}/tasks`, params),

  create: (projectId: string, data: CreateTaskRequest) =>
    postAPI<Task>(`/projects/${projectId}/tasks`, data),

  update: (taskId: string, data: UpdateTaskRequest) =>
    patchAPI<Task>(`/tasks/${taskId}`, data),

  delete: (taskId: string) => deleteAPI<void>(`/tasks/${taskId}`),
};
