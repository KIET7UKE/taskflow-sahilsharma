"use client";

import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
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
  optimisticUpdateTask,
  revertTaskUpdate,
} from "@/redux/slices/projects/projectsSlice";
import type { Task, CreateTaskRequest, UpdateTaskRequest } from "@/apis/projects";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Field, FieldLabel, FieldError } from "@/components/ui/field";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  ArrowLeftIcon,
  PlusIcon,
  TrashIcon,
  CalendarIcon,
  FilterIcon,
} from "lucide-react";
import { ConfirmDialog } from "@/components/confirm-dialog";

const STATUS_COLORS = {
  todo: "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300",
  in_progress: "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300",
  done: "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300",
};

const PRIORITY_COLORS = {
  low: "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300",
  medium: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300",
  high: "bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300",
};

const TASKS_COLUMNS = [
  { key: "todo", label: "To Do" },
  { key: "in_progress", label: "In Progress" },
  { key: "done", label: "Done" },
];

export default function ProjectDetailPage() {
  const { id } = useParams<{ id: string }>();
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
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
  const [taskToDelete, setTaskToDelete] = useState<string | null>(null);

  useEffect(() => {
    if (id) {
      dispatch(fetchProjectById(id));
    }
  }, [id, dispatch]);

  const validateTaskForm = () => {
    const errors: Record<string, string> = {};
    if (!taskFormData.title?.trim()) {
      errors.title = "Task title is required";
    }
    setTaskFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleCreateTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateTaskForm() || !id) return;

    setIsSubmitting(true);
    try {
      await dispatch(createTask({ projectId: id, data: taskFormData })).unwrap();
      toast.success("Task created successfully!");
      setIsTaskDialogOpen(false);
      resetTaskForm();
    } catch (err: any) {
      toast.error(err?.message || "Failed to create task");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdateTask = async (taskId: string, updates: UpdateTaskRequest) => {
    if (!id) return;

    const task = currentProjectTasks.find((t) => t.id === taskId);
    if (!task) return;

    dispatch(optimisticUpdateTask({ ...task, ...updates }));
    toast.success("Task updated!");

    try {
      await dispatch(updateTask({ taskId, data: updates })).unwrap();
    } catch (err: any) {
      dispatch(revertTaskUpdate(task));
      toast.error(err?.message || "Failed to update task");
    }
  };

  const handleDeleteTask = async (taskId: string) => {
    try {
      await dispatch(deleteTask(taskId)).unwrap();
      toast.success("Task deleted successfully!");
    } catch (err: any) {
      toast.error(err?.message || "Failed to delete task");
    } finally {
      setTaskToDelete(null);
    }
  };

  const handleStatusChange = (e: React.MouseEvent | React.FocusEvent, taskId: string, value: string | null) => {
    e.stopPropagation();
    if (value && id) {
      handleUpdateTask(taskId, { status: value as Task["status"] });
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

  const handleCloseDialog = () => {
    setIsTaskDialogOpen(false);
    resetTaskForm();
  };

  const filteredTasks = currentProjectTasks.filter((task) => {
    if (statusFilter !== "all" && task.status !== statusFilter) return false;
    if (assigneeFilter !== "all" && task.assignee_id !== assigneeFilter) return false;
    return true;
  });

  const getTasksByStatus = (status: string) => {
    return filteredTasks.filter((task) => task.status === status);
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return null;
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 p-6">
        <p className="text-destructive">{error}</p>
        <Button onClick={() => navigate("/projects")}>Back to Projects</Button>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 p-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => navigate("/projects")}>
          <ArrowLeftIcon className="size-4" />
        </Button>
        <div className="flex-1">
          {isLoading ? (
            <>
              <Skeleton className="h-8 w-48 mb-1" />
              <Skeleton className="h-4 w-96" />
            </>
          ) : (
            <>
              <h1 className="text-2xl font-bold">{currentProject?.name}</h1>
              {currentProject?.description && (
                <p className="text-muted-foreground">{currentProject.description}</p>
              )}
            </>
          )}
        </div>
        <Button onClick={() => setIsTaskDialogOpen(true)}>
          <PlusIcon className="size-4 mr-2" />
          Add Task
        </Button>
      </div>

      <div className="flex items-center gap-4">
        <FilterIcon className="size-4 text-muted-foreground" />
        <Select value={statusFilter} onValueChange={(value) => value && setStatusFilter(value)}>
          <SelectTrigger className="w-[150px]">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="todo">To Do</SelectItem>
            <SelectItem value="in_progress">In Progress</SelectItem>
            <SelectItem value="done">Done</SelectItem>
          </SelectContent>
        </Select>
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
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {TASKS_COLUMNS.map((column) => (
            <div key={column.key} className="flex flex-col gap-2">
              <div className="flex items-center gap-2 px-1">
                <h3 className="font-medium text-sm">{column.label}</h3>
                <Badge variant="secondary" className="h-5 px-1.5 text-xs">
                  {getTasksByStatus(column.key).length}
                </Badge>
              </div>
              <div className="flex flex-col gap-2">
                {getTasksByStatus(column.key).map((task) => (
                  <div
                    key={task.id}
                    className="group relative rounded-lg border bg-card p-3 cursor-pointer hover:border-primary/50 transition-colors"
                    onClick={() => handleEditTask(task)}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <h4 className="font-medium text-sm">{task.title}</h4>
                      <Button
                        variant="ghost"
                        size="icon-sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          setTaskToDelete(task.id);
                        }}
                        className="opacity-0 group-hover:opacity-100 transition-opacity -mr-1 -mt-1"
                      >
                        <TrashIcon className="size-3 text-destructive" />
                      </Button>
                    </div>
                    {task.description && (
                      <p className="mt-1 text-xs text-muted-foreground line-clamp-2">
                        {task.description}
                      </p>
                    )}
                    <div className="mt-2 flex flex-wrap items-center gap-2">
                      <Badge
                        className={`text-xs ${PRIORITY_COLORS[task.priority]}`}
                      >
                        {task.priority}
                      </Badge>
                      {task.due_date && (
                        <span className="flex items-center gap-1 text-xs text-muted-foreground">
                          <CalendarIcon className="size-3" />
                          {formatDate(task.due_date)}
                        </span>
                      )}
                    </div>
                    <div className="mt-2 flex items-center gap-2">
                      <div onClick={(e) => e.stopPropagation()}>
                        <Select
                          value={task.status}
                          onValueChange={(value) =>
                            handleStatusChange({ stopPropagation: () => {} } as any, task.id, value)
                          }
                        >
                          <SelectTrigger className="h-6 text-xs w-[100px]">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="todo">To Do</SelectItem>
                            <SelectItem value="in_progress">In Progress</SelectItem>
                            <SelectItem value="done">Done</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      <Dialog open={isTaskDialogOpen} onOpenChange={handleCloseDialog}>
        <DialogContent>
          <form onSubmit={editingTask ? (e) => { e.preventDefault(); handleUpdateTask(editingTask.id, taskFormData as UpdateTaskRequest); handleCloseDialog(); } : handleCreateTask}>
            <DialogHeader>
              <DialogTitle>{editingTask ? "Edit Task" : "Create New Task"}</DialogTitle>
              <DialogDescription>
                {editingTask ? "Update the task details." : "Add a new task to this project."}
              </DialogDescription>
            </DialogHeader>
            <div className="flex flex-col gap-4 py-4">
              <Field>
                <FieldLabel htmlFor="title">Title</FieldLabel>
                <Input
                  id="title"
                  value={taskFormData.title}
                  onChange={(e) =>
                    setTaskFormData((prev) => ({ ...prev, title: e.target.value }))
                  }
                  placeholder="Enter task title"
                />
                {taskFormErrors.title && (
                  <FieldError errors={[{ message: taskFormErrors.title }]} />
                )}
              </Field>
              <Field>
                <FieldLabel htmlFor="description">Description</FieldLabel>
                <Input
                  id="description"
                  value={taskFormData.description}
                  onChange={(e) =>
                    setTaskFormData((prev) => ({ ...prev, description: e.target.value }))
                  }
                  placeholder="Enter task description"
                />
              </Field>
              <Field>
                <FieldLabel htmlFor="priority">Priority</FieldLabel>
                <Select
                  value={taskFormData.priority}
                  onValueChange={(value) =>
                    setTaskFormData((prev) => ({ ...prev, priority: value as Task["priority"] }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Low</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                  </SelectContent>
                </Select>
              </Field>
              <Field>
                <FieldLabel htmlFor="due_date">Due Date</FieldLabel>
                <Input
                  id="due_date"
                  type="date"
                  value={taskFormData.due_date}
                  onChange={(e) =>
                    setTaskFormData((prev) => ({ ...prev, due_date: e.target.value }))
                  }
                />
              </Field>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={handleCloseDialog}>
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Saving..." : editingTask ? "Save Changes" : "Create Task"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
      <ConfirmDialog
        open={!!taskToDelete}
        onOpenChange={(open) => !open && setTaskToDelete(null)}
        title="Delete Task"
        description="Are you sure you want to delete this task? This action cannot be undone."
        onConfirm={() => taskToDelete && handleDeleteTask(taskToDelete)}
        confirmText="Delete Task"
      />
    </div>
  );
}
