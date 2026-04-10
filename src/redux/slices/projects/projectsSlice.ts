import { createSlice, createAsyncThunk, type PayloadAction } from "@reduxjs/toolkit";
import { projectsApi, tasksApi, type Task, type CreateProjectRequest, type CreateTaskRequest, type UpdateTaskRequest } from "@/apis/projects";
import type { ProjectsState } from "./types";

const initialState: ProjectsState = {
  projects: [],
  currentProject: null,
  currentProjectTasks: [],
  isLoading: false,
  error: null,
};

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

const projectsSlice = createSlice({
  name: "projects",
  initialState,
  reducers: {
    clearCurrentProject: (state) => {
      state.currentProject = null;
      state.currentProjectTasks = [];
    },
    clearError: (state) => {
      state.error = null;
    },
    optimisticUpdateTask: (state, action: PayloadAction<Task>) => {
      const index = state.currentProjectTasks.findIndex((t) => t.id === action.payload.id);
      if (index !== -1) {
        state.currentProjectTasks[index] = action.payload;
      }
    },
    revertTaskUpdate: (state, action: PayloadAction<Task>) => {
      const index = state.currentProjectTasks.findIndex((t) => t.id === action.payload.id);
      if (index !== -1) {
        state.currentProjectTasks[index] = action.payload;
      }
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch projects
      .addCase(fetchProjects.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchProjects.fulfilled, (state, action) => {
        state.isLoading = false;
        state.projects = action.payload;
      })
      .addCase(fetchProjects.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message || "Failed to fetch projects";
      })
      // Fetch project by ID
      .addCase(fetchProjectById.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchProjectById.fulfilled, (state, action) => {
        state.isLoading = false;
        state.currentProject = action.payload;
        state.currentProjectTasks = action.payload.tasks || [];
      })
      .addCase(fetchProjectById.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message || "Failed to fetch project";
      })
      // Create project
      .addCase(createProject.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(createProject.fulfilled, (state, action) => {
        state.isLoading = false;
        state.projects.push(action.payload);
      })
      .addCase(createProject.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message || "Failed to create project";
      })
      // Update project
      .addCase(updateProject.fulfilled, (state, action) => {
        const index = state.projects.findIndex((p) => p.id === action.payload.id);
        if (index !== -1) {
          state.projects[index] = action.payload;
        }
        if (state.currentProject?.id === action.payload.id) {
          state.currentProject = action.payload;
        }
      })
      // Delete project
      .addCase(deleteProject.fulfilled, (state, action) => {
        state.projects = state.projects.filter((p) => p.id !== action.payload);
        if (state.currentProject?.id === action.payload) {
          state.currentProject = null;
          state.currentProjectTasks = [];
        }
      })
      // Fetch tasks
      .addCase(fetchTasks.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(fetchTasks.fulfilled, (state, action) => {
        state.isLoading = false;
        state.currentProjectTasks = action.payload;
      })
      .addCase(fetchTasks.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message || "Failed to fetch tasks";
      })
      // Create task
      .addCase(createTask.fulfilled, (state, action) => {
        state.currentProjectTasks.push(action.payload);
      })
      // Update task
      .addCase(updateTask.fulfilled, (state, action) => {
        const index = state.currentProjectTasks.findIndex((t) => t.id === action.payload.id);
        if (index !== -1) {
          state.currentProjectTasks[index] = action.payload;
        }
      })
      // Delete task
      .addCase(deleteTask.fulfilled, (state, action) => {
        state.currentProjectTasks = state.currentProjectTasks.filter((t) => t.id !== action.payload);
      });
  },
});

export const { clearCurrentProject, clearError, optimisticUpdateTask, revertTaskUpdate } = projectsSlice.actions;

export default projectsSlice.reducer;
