import { http, HttpResponse } from "msw";

const TEST_USER = {
  id: "550e8400-e29b-41d4-a716-446655440000",
  name: "Test User",
  email: "test@example.com",
};

export const handlers = [
  http.post("/api/auth/register", async ({ request }) => {
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

  http.post("/api/auth/login", async ({ request }) => {
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
];
