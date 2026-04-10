import { createAsyncThunk } from "@reduxjs/toolkit";
import { projectsApi, tasksApi, type CreateProjectRequest, type CreateTaskRequest, type UpdateTaskRequest } from "@/apis/projects";

export const fetchProjects = createAsyncThunk(
  "projects/fetchProjects",
  async () => {
    const response = await projectsApi.list();
    return response.projects;
  }
);

export const fetchProjectById = createAsyncThunk(
  "projects/fetchProjectById",
  async (id: string) => {
    const response = await projectsApi.getById(id);
    return response;
  }
);

export const createProject = createAsyncThunk(
  "projects/createProject",
  async (data: CreateProjectRequest) => {
    const response = await projectsApi.create(data);
    return response;
  }
);

export const updateProject = createAsyncThunk(
  "projects/updateProject",
  async ({ id, data }: { id: string; data: Partial<CreateProjectRequest> }) => {
    const response = await projectsApi.update(id, data);
    return response;
  }
);

export const deleteProject = createAsyncThunk(
  "projects/deleteProject",
  async (id: string) => {
    await projectsApi.delete(id);
    return id;
  }
);

export const fetchTasks = createAsyncThunk(
  "projects/fetchTasks",
  async ({ projectId, status, assignee }: { projectId: string; status?: string; assignee?: string }) => {
    const response = await tasksApi.list(projectId, { status, assignee });
    return response.tasks;
  }
);

export const createTask = createAsyncThunk(
  "projects/createTask",
  async ({ projectId, data }: { projectId: string; data: CreateTaskRequest }) => {
    const response = await tasksApi.create(projectId, data);
    return response;
  }
);

export const updateTask = createAsyncThunk(
  "projects/updateTask",
  async ({ taskId, data }: { taskId: string; data: UpdateTaskRequest }) => {
    const response = await tasksApi.update(taskId, data);
    return response;
  }
);

export const deleteTask = createAsyncThunk(
  "projects/deleteTask",
  async (taskId: string) => {
    await tasksApi.delete(taskId);
    return taskId;
  }
);

export const fetchDashboardStats = createAsyncThunk(
  "projects/fetchDashboardStats",
  async () => {
    const response = await projectsApi.fetchStats();
    return response;
  }
);
