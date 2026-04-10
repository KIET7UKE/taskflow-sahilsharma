# 🚀 TaskFlow

[![React](https://img.shields.io/badge/React-19-blue?logo=react)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-6.0-blue?logo=typescript)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite-8.0-646CFF?logo=vite)](https://vitejs.dev/)
[![TailwindCSS](https://img.shields.io/badge/Tailwind-4.0-38B2AC?logo=tailwind-css)](https://tailwindcss.com/)
[![Redux](https://img.shields.io/badge/Redux-Toolkit-764ABC?logo=redux)](https://redux-toolkit.js.org/)
[![Status](https://img.shields.io/badge/Status-Beta-orange)](#)

TaskFlow is a high-performance, premium task management system built with the latest React 19 ecosystem. It features a sophisticated Kanban-style workflow, real-time-like interactions via optimistic updates, and a glassmorphic dark-mode interface designed for professional productivity.

---

## ✨ Features

- **🔐 Robust Auth System**: Secure login and registration with JWT-based session persistence and Google OAuth integration.
- **📊 Interactive Dashboard**: High-level overview of project health, task completion rates, and active workloads.
- **📋 Kanban Workflow**: Seamless drag-and-drop task management powered by `@dnd-kit`, sorted by `To Do`, `In Progress`, and `Done`.
- **🏗️ Project Management**: Full CRUD capabilities for projects with rich descriptions and metadata.
- **🌓 Dynamic Theming**: Persistent Light/Dark mode with system synchronization and a smooth glassmorphic aesthetic.
- **⚡ Optimistic UI**: Instant UI updates on task changes with background synchronization and automatic rollback on failure.
- **🔍 Advanced Filtering**: Filter tasks by status, priority, or assignee to stay focused on what matters.

---

## 🏗️ Architecture Reasoning

TaskFlow was built with a "Production-First" mindset, choosing technologies that scale:

### ⚙️ Core React 19 + TypeScript
Leveraging the latest features of React 19 for better performance and future-proofing, combined with strict TypeScript 6.0 for enterprise-grade reliability and developer experience.

### 🧠 Redux Toolkit (Slices & Thunks)
State is managed centrally using Redux Toolkit. We use **Async Thunks** for all side effects (API calls) and **Slices** for clean, modular state logic, ensuring a single source of truth that is easy to debug.

### 🎨 Tailwind CSS v4 & shadcn/ui
We utilize the cutting-edge Tailwind CSS v4 for ultra-fast styling and **shadcn/ui** (Base UI) for accessible, standard-compliant components. The design follows a custom design system with vibrant gradients and subtle micro-animations.

### 🔄 DND-Kit Integration
The Kanban board isn't just a list; it's a fully droppable interface. `@dnd-kit` was chosen over simpler alternatives for its accessibility features and performance with large datasets.

### 🛠️ MSW (Mock Service Worker)
By intercepting network requests at the service worker level, we enable a **Frontend-First** development workflow. This ensures the app behaves identically to one with a real backend, facilitating seamless integration later.

---

## 📂 Project Structure

```text
src/
├── apis/              # Typed API client (Axios) & Endpoint definitions
├── components/        # Reusable UI & Layout components (shadcn/ui)
├── hooks/             # Shared React hooks (useAppDispatch, useTheme)
├── lib/               # Utility libraries (cn, validators)
├── mocks/             # MSW Handlers & Browser worker setup
├── pages/             # Route-level components (Public & Private)
├── redux/             # Redux Store, Slices, and Async Thunks
├── routes/            # React Router v7 configuration
└── utils/             # Pure helper functions
```

---

## 🚀 Setup & Installation

### Option 1: Docker (Recommended)
Standardized environment with Postgres database included.

```bash
# 1. Clone & Enter
git clone https://github.com/your-repo/taskflow.git && cd taskflow

# 2. Setup Environment
cp .env.example .env

# 3. Spin up
docker compose up --build
```
*App will be live at `http://localhost:3000`*

### Option 2: Local Development
Requires Node.js 20+.

```bash
# 1. Install dependencies
npm install

# 2. Start Dev Server
npm run dev
```
*App will be live at `http://localhost:5173`*

---

## 🧪 Credentials (Demo Mode)
TaskFlow comes pre-loaded with mock data for exploration:

- **Email**: `test@example.com`
- **Password**: `password123`
- *Or use the "Quick Demo Login" on the Auth page.*

---

## 🚧 Honestly, What's Missing?

While TaskFlow is highly functional, it is currently in a "Frontend-Integrated" state:

1.  **Backend Implementation**: All data currently persists only in-memory (mocked) or localStorage. The Postgres container in Docker is ready but not yet linked to a live API service.
2.  **Full OAuth Flow**: Google Login is UI-ready but requires a real backend to verify ID tokens.
3.  **Real-time Collaboration**: The architecture is ready for WebSockets/Supabase Realtime, but it's currently polling or manual-refresh based.
4.  **Test Coverage**: Unit and E2E tests are planned but minimal in the current version.
5.  **Multi-Language Support**: Currently English only.

---

## 📜 License
Built with ❤️ under the MIT License.
