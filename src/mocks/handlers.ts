import { http, HttpResponse } from "msw";

const TEST_USER = {
  id: "550e8400-e29b-41d4-a716-446655440000",
  name: "Test User",
  email: "test@example.com",
};

const projects = [
  {
    id: "proj-001",
    name: "Website Redesign",
    description: "Q2 website redesign project",
    owner_id: TEST_USER.id,
    created_at: "2026-04-01T10:00:00Z",
  },
  {
    id: "proj-002",
    name: "Mobile App",
    description: "React Native mobile application",
    owner_id: TEST_USER.id,
    created_at: "2026-04-05T14:30:00Z",
  },
];

const tasks: any[] = [
  {
    id: "task-001",
    title: "Design homepage mockup",
    description: "Create wireframes and high-fidelity mockups",
    status: "done",
    priority: "high",
    project_id: "proj-001",
    assignee_id: TEST_USER.id,
    due_date: "2026-04-10",
    created_at: "2026-04-01T11:00:00Z",
    updated_at: "2026-04-08T16:00:00Z",
  },
  {
    id: "task-002",
    title: "Implement authentication",
    description: "Add login and registration functionality",
    status: "in_progress",
    priority: "high",
    project_id: "proj-001",
    assignee_id: TEST_USER.id,
    due_date: "2026-04-15",
    created_at: "2026-04-02T09:00:00Z",
    updated_at: "2026-04-09T10:00:00Z",
  },
  {
    id: "task-003",
    title: "Setup CI/CD pipeline",
    description: "Configure GitHub Actions for deployment",
    status: "todo",
    priority: "medium",
    project_id: "proj-001",
    assignee_id: null,
    due_date: "2026-04-20",
    created_at: "2026-04-03T14:00:00Z",
    updated_at: "2026-04-03T14:00:00Z",
  },
];

let projectTasks = [...tasks];
let projectList = [...projects];

const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:4000";

export const handlers = [
  // Auth handlers
  http.post(`${BASE_URL}/auth/register`, async ({ request }) => {
    const body = await request.json() as { name?: string; email?: string; password?: string };
    
    if (!body.email || !body.password || !body.name) {
      return HttpResponse.json(
        { error: "validation failed", fields: { 
          email: !body.email ? "is required" : undefined,
          password: !body.password ? "is required" : undefined,
          name: !body.name ? "is required" : undefined,
        }},
        { status: 400 }
      );
    }

    if (body.email === "test@example.com") {
      return HttpResponse.json(
        { error: "validation failed", fields: { email: "already exists" } },
        { status: 400 }
      );
    }

    const token = btoa(`${body.email}:${Date.now()}`);
    
    return HttpResponse.json(
      {
        token,
        user: {
          id: "550e8400-e29b-41d4-a716-446655440001",
          name: body.name,
          email: body.email,
        },
      },
      { status: 201 }
    );
  }),

  http.post(`${BASE_URL}/auth/login`, async ({ request }) => {
    const body = await request.json() as { email?: string; password?: string };
    
    if (!body.email || !body.password) {
      return HttpResponse.json(
        { error: "validation failed", fields: { 
          email: !body.email ? "is required" : undefined,
          password: !body.password ? "is required" : undefined,
        }},
        { status: 400 }
      );
    }

    if (body.email === TEST_USER.email && body.password === "password123") {
      const token = btoa(`${body.email}:${Date.now()}`);
      return HttpResponse.json({
        token,
        user: TEST_USER,
      });
    }

    return HttpResponse.json(
      { error: "invalid credentials" },
      { status: 401 }
    );
  }),

  // Stats handler
  http.get(`${BASE_URL}/stats`, () => {
    return HttpResponse.json({
      totalProjects: projectList.length,
      totalTasks: projectTasks.length,
      completedTasks: projectTasks.filter(t => t.status === "done").length
    });
  }),

  // Projects handlers
  http.get(`${BASE_URL}/projects`, () => {
    return HttpResponse.json({
      projects: projectList,
    });
  }),

  http.post(`${BASE_URL}/projects`, async ({ request }) => {
    const body = await request.json() as { name?: string; description?: string };
    
    if (!body.name) {
      return HttpResponse.json(
        { error: "validation failed", fields: { name: "is required" } },
        { status: 400 }
      );
    }

    const newProject = {
      id: `proj-${Date.now()}`,
      name: body.name,
      description: body.description || "",
      owner_id: TEST_USER.id,
      created_at: new Date().toISOString(),
    };
    projectList.push(newProject);

    return HttpResponse.json(newProject, { status: 201 });
  }),

  http.get(`${BASE_URL}/projects/:id`, ({ params }) => {
    const project = projectList.find((p) => p.id === params.id);
    
    if (!project) {
      return HttpResponse.json({ error: "not found" }, { status: 404 });
    }

    const projectTasksList = projectTasks.filter((t) => t.project_id === params.id);

    return HttpResponse.json({
      ...project,
      tasks: projectTasksList,
    });
  }),

  http.patch(`${BASE_URL}/projects/:id`, async ({ request, params }) => {
    const body = await request.json() as { name?: string; description?: string };
    const projectIndex = projectList.findIndex((p) => p.id === params.id);
    
    if (projectIndex === -1) {
      return HttpResponse.json({ error: "not found" }, { status: 404 });
    }

    if (body.name !== undefined) {
      projectList[projectIndex].name = body.name;
    }
    if (body.description !== undefined) {
      projectList[projectIndex].description = body.description;
    }

    return HttpResponse.json(projectList[projectIndex]);
  }),

  http.delete(`${BASE_URL}/projects/:id`, ({ params }) => {
    const projectIndex = projectList.findIndex((p) => p.id === params.id);
    
    if (projectIndex === -1) {
      return HttpResponse.json({ error: "not found" }, { status: 404 });
    }

    projectList.splice(projectIndex, 1);
    projectTasks = projectTasks.filter((t) => t.project_id !== params.id);

    return new HttpResponse(null, { status: 204 });
  }),

  // Tasks handlers
  http.get(`${BASE_URL}/projects/:id/tasks`, ({ params, request }) => {
    const url = new URL(request.url);
    const status = url.searchParams.get("status");
    const assignee = url.searchParams.get("assignee");

    let filteredTasks = projectTasks.filter((t) => t.project_id === params.id as string);

    if (status) {
      filteredTasks = filteredTasks.filter((t) => t.status === status);
    }
    if (assignee) {
      filteredTasks = filteredTasks.filter((t) => t.assignee_id === assignee);
    }

    return HttpResponse.json({ tasks: filteredTasks });
  }),

  http.post(`${BASE_URL}/projects/:id/tasks`, async ({ request, params }) => {
    const body = await request.json() as {
      title?: string;
      description?: string;
      priority?: string;
      assignee_id?: string;
      due_date?: string;
    };
    
    if (!body.title) {
      return HttpResponse.json(
        { error: "validation failed", fields: { title: "is required" } },
        { status: 400 }
      );
    }

    const newTask = {
      id: `task-${Date.now()}`,
      title: body.title,
      description: body.description || "",
      status: "todo",
      priority: body.priority || "medium",
      project_id: params.id as string,
      assignee_id: body.assignee_id || null,
      due_date: body.due_date || null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    projectTasks.push(newTask);

    return HttpResponse.json(newTask, { status: 201 });
  }),

  http.patch(`${BASE_URL}/tasks/:id`, async ({ request, params }) => {
    const body = await request.json() as {
      title?: string;
      description?: string;
      status?: string;
      priority?: string;
      assignee_id?: string;
      due_date?: string;
    };
    
    const taskIndex = projectTasks.findIndex((t) => t.id === params.id);
    
    if (taskIndex === -1) {
      return HttpResponse.json({ error: "not found" }, { status: 404 });
    }

    const updatedTask = {
      ...projectTasks[taskIndex],
      ...body,
      updated_at: new Date().toISOString(),
    };
    projectTasks[taskIndex] = updatedTask;

    return HttpResponse.json(updatedTask);
  }),

  http.delete(`${BASE_URL}/tasks/:id`, ({ params }) => {
    const taskIndex = projectTasks.findIndex((t) => t.id === params.id);
    
    if (taskIndex === -1) {
      return HttpResponse.json({ error: "not found" }, { status: 404 });
    }

    projectTasks.splice(taskIndex, 1);

    return new HttpResponse(null, { status: 204 });
  }),
];
