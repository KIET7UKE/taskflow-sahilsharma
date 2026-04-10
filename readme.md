# TaskFlow

A minimal but real task management system built with React. Users can register, log in, create projects, add tasks to those projects, and manage their status.

**Frontend-only submission** - This frontend is built to work with a mock API (MSW) for development. See [Mock API Spec](#mock-api-spec) for the API contract.

## Tech Stack

- **React 19** with TypeScript
- **Vite** for build tooling
- **Tailwind CSS 4** for styling
- **shadcn/ui** (base-ui) for components
- **Redux Toolkit** for state management
- **React Router v7** for routing
- **MSW (Mock Service Worker)** for API mocking
- **Docker** for containerization

## Architecture Decisions

### Why these choices?

- **React 19 + TypeScript**: Provides excellent DX with type safety
- **Tailwind CSS 4**: Utility-first CSS with excellent iteration speed
- **shadcn/ui (base-ui)**: Headless components that integrate well with Tailwind
- **Redux Toolkit**: Standardized state management with async thunk support
- **MSW for mocking**: Intercepts network requests, providing realistic API behavior during development

### What was intentionally left out?

- **Backend**: This is a frontend-only submission. MSW handles API mocking.
- **Real authentication**: JWT handling is mocked; production would need a real backend
- **Drag-and-drop**: Kanban board uses click-to-change-status instead of D&D for simplicity
- **Dark mode**: Theme toggle was not implemented to stay within scope
- **Real-time updates**: WebSocket/SSE not implemented (requires backend support)

## Running Locally

### Prerequisites
- Docker and Docker Compose installed
- Node.js 20+ (for local development without Docker)

### Option 1: Docker (Recommended)

```bash
# Clone the repository
git clone https://github.com/your-name/taskflow.git
cd taskflow

# Copy environment variables
cp .env.example .env

# Start the application
docker compose up
```

The app will be available at http://localhost:3000

### Option 2: Local Development

```bash
# Clone the repository
git clone https://github.com/your-name/taskflow.git
cd taskflow

# Install dependencies
npm install

# Copy environment variables
cp .env.example .env

# Start development server
npm run dev
```

The app will be available at http://localhost:5173

## Mock API Spec

Since this is a frontend-only submission, the app uses MSW to mock all API endpoints.

### Base URL
```
http://localhost:5173 (dev) or http://localhost:3000 (production mock)
```

### Auth Endpoints

**POST `/api/auth/register`**
```json
// Request
{ "name": "Jane Doe", "email": "jane@example.com", "password": "secret123" }

// Response 201
{ "token": "<jwt>", "user": { "id": "uuid", "name": "Jane Doe", "email": "jane@example.com" } }
```

**POST `/api/auth/login`**
```json
// Request
{ "email": "jane@example.com", "password": "secret123" }

// Response 200
{ "token": "<jwt>", "user": { "id": "uuid", "name": "Jane Doe", "email": "jane@example.com" } }
```

### Projects Endpoints

**GET `/api/projects`** - List user's projects
```json
// Response 200
{ "projects": [{ "id": "uuid", "name": "Project", "description": "...", "owner_id": "uuid", "created_at": "..." }] }
```

**POST `/api/projects`** - Create project
```json
// Request
{ "name": "New Project", "description": "Optional" }

// Response 201
{ "id": "uuid", "name": "New Project", "description": "...", "owner_id": "uuid", "created_at": "..." }
```

**GET `/api/projects/:id`** - Get project with tasks
```json
// Response 200
{ "id": "uuid", "name": "Project", ..., "tasks": [...] }
```

**PATCH `/api/projects/:id`** - Update project
**DELETE `/api/projects/:id`** - Delete project (204)

### Tasks Endpoints

**GET `/api/projects/:id/tasks?status=&assignee=`** - List tasks with optional filters
```json
// Response 200
{ "tasks": [...] }
```

**POST `/api/projects/:id/tasks`** - Create task
```json
// Request
{ "title": "Task", "description": "...", "priority": "high", "assignee_id": "uuid", "due_date": "2026-04-15" }

// Response 201
{ "id": "uuid", "title": "Task", "status": "todo", "priority": "high", ... }
```

**PATCH `/api/tasks/:id`** - Update task
```json
// Request
{ "title": "...", "status": "done", "priority": "low", ... }

// Response 200
{ "id": "uuid", "title": "...", "status": "done", ... }
```

**DELETE `/api/tasks/:id`** - Delete task (204)

### Error Responses

```json
// 400 Validation error
{ "error": "validation failed", "fields": { "email": "is required" } }

// 401 Unauthenticated
{ "error": "unauthorized" }

// 403 Forbidden
{ "error": "forbidden" }

// 404 Not found
{ "error": "not found" }
```

## Test Credentials

The mock API includes a pre-configured test user:

```
Email:    test@example.com
Password: password123
```

## Project Structure

```
src/
├── apis/              # API call functions
│   ├── api.ts         # Base axios instance
│   ├── auth.ts        # Auth API calls
│   └── projects.ts   # Projects & tasks API calls
├── components/        # React components
│   ├── ui/            # shadcn/ui components
│   └── ...            # Feature components
├── hooks/             # Custom React hooks
├── mocks/             # MSW mock handlers
│   ├── browser.ts     # MSW worker setup
│   └── handlers.ts     # API mock definitions
├── pages/             # Route pages
│   ├── private/       # Protected pages
│   └── public/        # Public pages
├── redux/             # Redux state management
│   └── slices/        # Redux Toolkit slices
├── routes/            # React Router configuration
└── App.tsx            # Root component
```

## Running Migrations

N/A - This is a frontend-only submission using MSW for mocking. No database migrations are needed.

## What You'd Do With More Time

1. **Connect to a real backend**: Replace MSW with actual API calls, add proper error handling for network failures

2. **Add integration tests**: Write tests using React Testing Library and Vitest

3. **Implement drag-and-drop**: Use @dnd-kit to allow dragging tasks between Kanban columns

4. **Dark mode**: Add theme toggle with next-themes (already in dependencies)

5. **Real-time updates**: Add WebSocket support for live task updates across users

6. **Pagination**: Add pagination to projects and tasks list endpoints

7. **Stats endpoint UI**: Display task counts by status/assignee on the dashboard

8. **Responsive mobile view**: The Kanban board needs optimization for mobile screens

9. **Better empty states**: Add illustrations and more helpful empty state messaging

10. **Form validation**: Use Zod (already in dependencies) for schema validation

## License

MIT
