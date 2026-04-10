"use client";

import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { toast } from "sonner";
import { useAppDispatch } from "../../../../hooks/useAppDispatch";
import { useSelector } from "react-redux";
import type { RootState } from "@/redux/reducers/rootReducer";
import {
  fetchProjectById,
  fetchTasks,
  createTask,
  updateTask,
  deleteTask,
  updateProject,
} from "@/redux/thunks/projectThunks";
import {
  optimisticUpdateTask,
  revertTaskUpdate,
} from "@/redux/slices/projects/projectsSlice";
import type { Task, CreateTaskRequest, UpdateTaskRequest } from "@/apis/projects";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { PlusIcon, Edit2Icon } from "lucide-react";
import {
  KanbanBoard,
  TaskDialog,
  ProjectDialog,
} from "@/components/organisms/kanban";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function ProjectDetailPage() {
  const { id } = useParams<{ id: string }>();
  const dispatch = useAppDispatch();
  const { currentProject, currentProjectTasks, isLoading, error } = useSelector(
    (state: RootState) => state.projects
  );
  const { userDetails } = useSelector((state: RootState) => state.auth);

  const [isTaskDialogOpen, setIsTaskDialogOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [taskFormData, setTaskFormData] = useState<CreateTaskRequest>({
    title: "",
    description: "",
    priority: "medium",
    due_date: "",
  });
  const [taskFormErrors, setTaskFormErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [assigneeFilter, setAssigneeFilter] = useState<string>("all");
  const [isProjectDialogOpen, setIsProjectDialogOpen] = useState(false);
  const [projectFormData, setProjectFormData] = useState({ name: "", description: "" });
  const [projectFormErrors, setProjectFormErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (id) {
      dispatch(fetchProjectById(id));
      dispatch(fetchTasks({ projectId: id }));
    }
  }, [id, dispatch]);

  useEffect(() => {
    if (id && (statusFilter !== "all" || assigneeFilter !== "all")) {
      dispatch(fetchTasks({
        projectId: id,
        status: statusFilter === "all" ? undefined : statusFilter,
        assignee: assigneeFilter === "all" ? undefined : assigneeFilter,
      }));
    } else if (id && statusFilter === "all" && assigneeFilter === "all") {
      dispatch(fetchTasks({ projectId: id }));
    }
  }, [id, statusFilter, assigneeFilter, dispatch]);

  useEffect(() => {
    if (currentProject) {
      setProjectFormData({
        name: currentProject.name,
        description: currentProject.description || "",
      });
    }
  }, [currentProject]);

  const validateTaskForm = () => {
    const errors: Record<string, string> = {};
    if (!taskFormData.title?.trim()) {
      errors.title = "Task title is required";
    }
    setTaskFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleUpdateProject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id) return;

    if (!projectFormData.name.trim()) {
      setProjectFormErrors({ name: "Project name is required" });
      return;
    }

    setIsSubmitting(true);
    try {
      await dispatch(updateProject({ id, data: projectFormData })).unwrap();
      toast.success("Project updated successfully!");
      setIsProjectDialogOpen(false);
      setProjectFormErrors({});
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : "Failed to update project";
      toast.error(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCreateTask = async () => {
    if (!validateTaskForm() || !id) return;

    setIsSubmitting(true);
    try {
      await dispatch(createTask({ projectId: id, data: taskFormData })).unwrap();
      toast.success("Task created successfully!");
      setIsTaskDialogOpen(false);
      resetTaskForm();
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : "Failed to create task";
      toast.error(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdateTaskStatus = async (taskId: string, updates: UpdateTaskRequest) => {
    const task = currentProjectTasks.find((t) => t.id === taskId);
    if (!task) return;

    dispatch(optimisticUpdateTask({ ...task, ...updates }));
    toast.success("Task updated!");

    try {
      await dispatch(updateTask({ taskId, data: updates })).unwrap();
    } catch (err: unknown) {
      dispatch(revertTaskUpdate(task));
      const errorMessage = err instanceof Error ? err.message : "Failed to update task";
      toast.error(errorMessage);
    }
  };

  const handleEditTask = (task: Task) => {
    setEditingTask(task);
    setTaskFormData({
      title: task.title,
      description: task.description || "",
      priority: task.priority,
      due_date: task.due_date || "",
    });
    setIsTaskDialogOpen(true);
  };

  const handleUpdateTaskFromDialog = async () => {
    if (!editingTask || !id) return;

    setIsSubmitting(true);
    try {
      await dispatch(
        updateTask({
          taskId: editingTask.id,
          data: taskFormData as UpdateTaskRequest,
        })
      ).unwrap();
      toast.success("Task updated successfully!");
      setIsTaskDialogOpen(false);
      resetTaskForm();
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : "Failed to update task";
      toast.error(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetTaskForm = () => {
    setEditingTask(null);
    setTaskFormData({
      title: "",
      description: "",
      priority: "medium",
      due_date: "",
    });
    setTaskFormErrors({});
  };

  const handleCloseTaskDialog = () => {
    setIsTaskDialogOpen(false);
    resetTaskForm();
  };

  const handleDeleteTask = (taskId: string) => {
    if (!confirm("Are you sure you want to delete this task?")) return;

    dispatch(deleteTask(taskId))
      .unwrap()
      .then(() => toast.success("Task deleted successfully!"))
      .catch((err: unknown) => {
        const errorMessage = err instanceof Error ? err.message : "Failed to delete task";
        toast.error(errorMessage);
      });
  };

  const handleTaskSubmit = () => {
    if (editingTask) {
      handleUpdateTaskFromDialog();
    } else {
      handleCreateTask();
    }
  };

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 p-6">
        <p className="text-destructive">{error}</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4 md:gap-6 p-4 md:p-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
        <div className="flex-1">
          {isLoading ? (
            <>
              <Skeleton className="h-6 w-32 mb-1" />
              <Skeleton className="h-4 w-48 md:w-72" />
            </>
          ) : (
            <>
              <div className="flex items-center gap-2">
                <h1 className="text-xl md:text-2xl font-bold">{currentProject?.name}</h1>
                <Button variant="ghost" size="icon-sm" onClick={() => setIsProjectDialogOpen(true)}>
                  <Edit2Icon className="size-4 text-muted-foreground" />
                </Button>
              </div>
              {currentProject?.description && (
                <p className="text-sm md:text-base text-muted-foreground line-clamp-1">{currentProject.description}</p>
              )}
            </>
          )}
        </div>
        <Button onClick={() => setIsTaskDialogOpen(true)} className="w-full sm:w-auto">
          <PlusIcon className="size-4 mr-2" />
          Add Task
        </Button>
      </div>

      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
        <div className="flex flex-col gap-1">
          <label className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground/70 pl-1">
            Status
          </label>
          <Select value={statusFilter} onValueChange={(value) => value && setStatusFilter(value)}>
            <SelectTrigger className="w-[150px] h-8 text-xs">
              <SelectValue placeholder="All Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="todo">To Do</SelectItem>
              <SelectItem value="in_progress">In Progress</SelectItem>
              <SelectItem value="done">Done</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground/70 pl-1">
            Assignee
          </label>
          <Select value={assigneeFilter} onValueChange={(value) => value && setAssigneeFilter(value)}>
            <SelectTrigger className="w-[160px] h-8 text-xs">
              <SelectValue placeholder="All Assignees" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Assignees</SelectItem>
              <SelectItem value={userDetails?.id ?? ""}>
                {userDetails?.name ?? "Me"}
              </SelectItem>
              <SelectItem value="unassigned">Unassigned</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {(statusFilter !== "all" || assigneeFilter !== "all") && (
          <button
            type="button"
            onClick={() => { setStatusFilter("all"); setAssigneeFilter("all"); }}
            className="self-end mb-0.5 text-xs text-muted-foreground hover:text-foreground underline underline-offset-4 transition-colors"
          >
            Clear filters
          </button>
        )}
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="rounded-lg border bg-card p-4">
              <Skeleton className="h-5 w-20 mb-4" />
              <Skeleton className="h-20 w-full mb-2" />
              <Skeleton className="h-16 w-full" />
            </div>
          ))}
        </div>
      ) : currentProjectTasks.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-4 rounded-lg border border-dashed p-12 text-center">
          <p className="text-muted-foreground">No tasks yet</p>
          <Button onClick={() => setIsTaskDialogOpen(true)}>
            <PlusIcon className="size-4 mr-2" />
            Create Task
          </Button>
        </div>
      ) : (
        <KanbanBoard
          tasks={currentProjectTasks}
          onEditTask={handleEditTask}
          onDeleteTask={handleDeleteTask}
          onStatusChange={(taskId, status) => handleUpdateTaskStatus(taskId, { status: status as Task["status"] })}
          onTaskMove={handleUpdateTaskStatus}
          statusFilter={statusFilter}
          assigneeFilter={assigneeFilter}
          userId={userDetails?.id}
        />
      )}

      <ProjectDialog
        open={isProjectDialogOpen}
        onOpenChange={setIsProjectDialogOpen}
        formData={projectFormData}
        formErrors={projectFormErrors}
        isSubmitting={isSubmitting}
        onFormDataChange={setProjectFormData}
        onSubmit={handleUpdateProject}
      />

      <TaskDialog
        open={isTaskDialogOpen}
        onOpenChange={handleCloseTaskDialog}
        editingTask={editingTask}
        formData={taskFormData}
        formErrors={taskFormErrors}
        isSubmitting={isSubmitting}
        onFormDataChange={setTaskFormData}
        onSubmit={handleTaskSubmit}
        onValidate={validateTaskForm}
      />
    </div>
  );
}
