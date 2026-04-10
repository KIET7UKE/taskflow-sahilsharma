
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
  updateProject,
} from "@/redux/thunks/projectThunks";
import {
  optimisticUpdateTask,
  revertTaskUpdate,
} from "@/redux/slices/projects/projectsSlice";
import type { Task, CreateTaskRequest, UpdateTaskRequest } from "@/apis/projects";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
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
  Edit2Icon,
} from "lucide-react";
import { ConfirmDialog } from "@/components/confirm-dialog";
import { cn } from "@/lib/utils";

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
  const [isProjectDialogOpen, setIsProjectDialogOpen] = useState(false);
  const [projectFormData, setProjectFormData] = useState({ name: "", description: "" });
  const [projectFormErrors, setProjectFormErrors] = useState<Record<string, string>>({});
  
  const [taskToDelete, setTaskToDelete] = useState<string | null>(null);

  useEffect(() => {
    if (id) {
      dispatch(fetchProjectById(id));
      // Initially fetch tasks without filters
      dispatch(fetchTasks({ projectId: id }));
    }
  }, [id, dispatch]);

  useEffect(() => {
    if (id && (statusFilter !== "all" || assigneeFilter !== "all")) {
      dispatch(fetchTasks({ 
        projectId: id, 
        status: statusFilter === "all" ? undefined : statusFilter,
        assignee: assigneeFilter === "all" ? undefined : assigneeFilter
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
    } catch (err: any) {
      toast.error(err?.message || "Failed to update project");
    } finally {
      setIsSubmitting(false);
    }
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

  const filteredTasks = currentProjectTasks;

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
        <div className="flex-1">
          {isLoading ? (
            <>
              <Skeleton className="h-8 w-48 mb-1" />
              <Skeleton className="h-4 w-96" />
            </>
          ) : (
            <>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-bold">{currentProject?.name}</h1>
                <Button variant="ghost" size="icon-sm" onClick={() => setIsProjectDialogOpen(true)}>
                  <Edit2Icon className="size-4 text-muted-foreground" />
                </Button>
              </div>
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

      <div className="flex flex-wrap items-center gap-4">
        

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
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {TASKS_COLUMNS.map((column) => (
            <div key={column.key} className="flex flex-col gap-4">
              <div className="flex items-center justify-between px-2">
                <div className="flex items-center gap-2">
                  <div className={cn(
                    "size-2 rounded-full",
                    column.key === "todo" && "bg-slate-400",
                    column.key === "in_progress" && "bg-primary",
                    column.key === "done" && "bg-emerald-500"
                  )} />
                  <h3 className="font-bold text-sm tracking-tight text-foreground/80 uppercase">{column.label}</h3>
                </div>
                <Badge variant="secondary" className="h-5 px-2 text-[10px] font-bold bg-muted/50 border-none">
                  {getTasksByStatus(column.key).length}
                </Badge>
              </div>
              <div className="flex flex-col gap-3 p-2 rounded-2xl bg-muted/20 min-h-[200px] border border-dashed border-muted">
                {getTasksByStatus(column.key).map((task) => (
                  <div
                    key={task.id}
                    className="group relative overflow-hidden rounded-xl border bg-card p-4 cursor-pointer hover:border-primary/40 transition-all hover:shadow-md hover:shadow-primary/5 active:scale-[0.98]"
                    onClick={() => handleEditTask(task)}
                  >
                    <div className="flex items-start justify-between gap-2 relative z-10">
                      <h4 className="font-semibold text-sm tracking-tight group-hover:text-primary transition-colors">{task.title}</h4>
                      <Button
                        variant="ghost"
                        size="icon-sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          setTaskToDelete(task.id);
                        }}
                        className="opacity-0 group-hover:opacity-100 transition-opacity -mr-2 -mt-2 hover:bg-destructive/10 hover:text-destructive"
                      >
                        <TrashIcon className="size-3" />
                      </Button>
                    </div>
                    {task.description && (
                      <p className="mt-2 text-xs text-muted-foreground line-clamp-2 leading-relaxed">
                        {task.description}
                      </p>
                    )}
                    <div className="mt-4 flex flex-wrap items-center gap-3 relative z-10">
                      <Badge
                        className={`text-[10px] uppercase font-bold px-2 py-0 border-none ${PRIORITY_COLORS[task.priority]}`}
                      >
                        {task.priority}
                      </Badge>
                      {task.due_date && (
                        <span className="flex items-center gap-1.5 text-[10px] font-medium text-muted-foreground">
                          <CalendarIcon className="size-3" />
                          {formatDate(task.due_date)}
                        </span>
                      )}
                    </div>
                    <div className="mt-3 flex items-center gap-2 relative z-10">
                      <div onClick={(e) => e.stopPropagation()}>
                        <Select
                          value={task.status}
                          onValueChange={(value) =>
                            handleStatusChange({ stopPropagation: () => { } } as any, task.id, value)
                          }
                        >
                          <SelectTrigger className="h-7 text-[10px] font-bold uppercase w-[110px] bg-muted/30 border-none shadow-none focus:ring-1 focus:ring-primary/20">
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
                    <div className="absolute -right-6 -bottom-6 size-20 bg-primary/5 rounded-full blur-2xl group-hover:bg-primary/10 transition-colors" />
                  </div>
                ))}
                {getTasksByStatus(column.key).length === 0 && (
                  <div className="flex flex-col items-center justify-center py-8 text-muted-foreground/40 italic text-xs">
                    Drop tasks here
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      <Dialog open={isProjectDialogOpen} onOpenChange={setIsProjectDialogOpen}>
        <DialogContent>
          <form onSubmit={handleUpdateProject}>
            <DialogHeader>
              <DialogTitle>Edit Project</DialogTitle>
              <DialogDescription>
                Update your project's name and description.
              </DialogDescription>
            </DialogHeader>
            <div className="flex flex-col gap-4 py-4">
              <Field>
                <FieldLabel htmlFor="projectName">Name <span className="text-destructive">*</span></FieldLabel>
                <Input
                  id="projectName"
                  value={projectFormData.name}
                  onChange={(e) => {
                    setProjectFormData((prev) => ({ ...prev, name: e.target.value }));
                    if (projectFormErrors.name) setProjectFormErrors({});
                  }}
                />
                {projectFormErrors.name && (
                  <FieldError errors={[{ message: projectFormErrors.name }]} />
                )}
              </Field>
              <Field>
                <FieldLabel htmlFor="projectDescription">Description <span className="text-muted-foreground font-normal ml-1">(optional)</span></FieldLabel>
                <Textarea
                  id="projectDescription"
                  value={projectFormData.description}
                  onChange={(e) =>
                    setProjectFormData((prev) => ({ ...prev, description: e.target.value }))
                  }
                  placeholder="Enter project description"
                />
              </Field>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsProjectDialogOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Saving..." : "Save Changes"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

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
                <FieldLabel htmlFor="title">Title <span className="text-destructive">*</span></FieldLabel>
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
                <FieldLabel htmlFor="description">Description <span className="text-muted-foreground font-normal ml-1">(optional)</span></FieldLabel>
                <Textarea
                  id="description"
                  value={taskFormData.description}
                  onChange={(e) =>
                    setTaskFormData((prev) => ({ ...prev, description: e.target.value }))
                  }
                  placeholder="Enter task description"
                />
              </Field>
              <Field>
                <FieldLabel htmlFor="priority">Priority <span className="text-destructive">*</span></FieldLabel>
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
                <FieldLabel htmlFor="due_date">Due Date <span className="text-muted-foreground font-normal ml-1">(optional)</span></FieldLabel>
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
