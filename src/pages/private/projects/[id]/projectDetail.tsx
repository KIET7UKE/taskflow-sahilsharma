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
  PlusIcon,
  TrashIcon,
  CalendarIcon,
  Edit2Icon,
  GripVertical,
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  DndContext,
  DragOverlay,
  closestCorners,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  useDroppable,
  DragStartEvent,
  DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

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

interface TaskCardProps {
  task: Task;
  onEdit: (task: Task) => void;
  onDelete: (taskId: string) => void;
  onStatusChange: (taskId: string, status: string) => void;
  isDragging?: boolean;
}

/**
 * TaskCard Component.
 * Represents an individual task within the Kanban board.
 * Supports drag-and-drop sorting and status updates.
 *
 * @param {TaskCardProps} props - Component props.
 * @returns {JSX.Element} The rendered task card.
 */
function TaskCard({ task, onEdit, onDelete, onStatusChange, isDragging }: TaskCardProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging: isSortableDragging,
  } = useSortable({ id: task.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return null;
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    });
  };

  const handleClick = (e: React.MouseEvent) => {
    // Only trigger edit if not dragging
    if (!isSortableDragging) {
      onEdit(task);
    }
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        "group relative overflow-hidden rounded-xl border bg-card p-4 cursor-pointer hover:border-primary/40 transition-all hover:shadow-md hover:shadow-primary/5",
        isSortableDragging && "opacity-50 scale-105 z-50 cursor-grabbing",
        isDragging && "opacity-90 scale-105 shadow-xl cursor-grabbing"
      )}
      onClick={handleClick}
      {...attributes}
      {...listeners}
    >
      <div className="flex items-start justify-between gap-2 relative z-10">
        <h4 className="font-semibold text-sm tracking-tight group-hover:text-primary transition-colors">
          {task.title}
        </h4>
        <Button
          variant="ghost"
          size="icon-sm"
          onClick={(e) => {
            e.stopPropagation();
            onDelete(task.id);
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
            onValueChange={(value) => value && onStatusChange(task.id, value)}
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
  );
}

/**
 * DroppableColumn Component.
 * A container for tasks in a specific status (e.g., "To Do").
 * Acts as a drop target for drag-and-drop operations.
 *
 * @param {Object} props - Component props.
 * @param {string} props.id - Column identifier representing task status.
 * @param {string} props.title - Display title for the column.
 * @param {number} props.count - Number of tasks in the column.
 * @param {React.ReactNode} props.children - Child elements (TaskCards).
 * @returns {JSX.Element} The rendered droppable column.
 */
function DroppableColumn({
  id,
  title,
  count,
  children,
}: {
  id: string;
  title: string;
  count: number;
  children: React.ReactNode;
}) {
  const { setNodeRef, isOver } = useDroppable({ id });

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between px-2">
        <div className="flex items-center gap-2">
          <div
            className={cn(
              "size-2 rounded-full",
              id === "todo" && "bg-slate-400",
              id === "in_progress" && "bg-primary",
              id === "done" && "bg-emerald-500"
            )}
          />
          <h3 className="font-bold text-sm tracking-tight text-foreground/80 uppercase">
            {title}
          </h3>
        </div>
        <Badge variant="secondary" className="h-5 px-2 text-[10px] font-bold bg-muted/50 border-none">
          {count}
        </Badge>
      </div>
      <div
        ref={setNodeRef}
        className={cn(
          "flex flex-col gap-3 p-2 rounded-2xl bg-muted/20 min-h-[200px] border border-dashed border-muted transition-colors",
          isOver && "border-primary bg-primary/5"
        )}
      >
        {children}
        {count === 0 && (
          <div className="flex flex-col items-center justify-center py-8 text-muted-foreground/40 italic text-xs">
            Drop tasks here
          </div>
        )}
      </div>
    </div>
  );
}

/**
 * ProjectDetailPage Component.
 * The detailed view for a single project, featuring a Kanban board for task management.
 * Handles task CRUD operations, status filtering, and drag-and-drop interactions.
 *
 * @returns {JSX.Element} The rendered project details page.
 */
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
  const [activeTask, setActiveTask] = useState<Task | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

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

  /**
   * Validates the task creation/edit form.
   *
   * @returns {boolean} True if the form is valid, false otherwise.
   */
  const validateTaskForm = () => {
    const errors: Record<string, string> = {};
    if (!taskFormData.title?.trim()) {
      errors.title = "Task title is required";
    }
    setTaskFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  /**
   * Handles updating the project's basic information (name, description).
   *
   * @param {React.FormEvent} e - The form submission event.
   */
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

  /**
   * Handles creating a new task within the current project.
   *
   * @param {React.FormEvent} e - The form submission event.
   */
  const handleCreateTask = async (e: React.FormEvent) => {
    e.preventDefault();
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

  /**
   * Performs an optimistic update of a task's status or other fields.
   * Syncs with the backend and reverts on failure.
   *
   * @param {string} taskId - The ID of the task to update.
   * @param {UpdateTaskRequest} updates - The fields to update.
   */
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

  const handleStatusChange = (taskId: string, status: string) => {
    handleUpdateTaskStatus(taskId, { status: status as Task["status"] });
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

  /**
   * Resets the task form to its default state.
   */
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

  /**
   * Filters and returns tasks belonging to a specific status, applying active filters.
   *
   * @param {string} status - The status to filter tasks by.
   * @returns {Task[]} The filtered list of tasks.
   */
  const getTasksByStatus = (status: string) => {
    let tasks = currentProjectTasks.filter((task) => task.status === status);
    if (statusFilter !== "all") {
      tasks = tasks.filter((task) => task.status === statusFilter);
    }
    if (assigneeFilter !== "all") {
      tasks = tasks.filter((task) => {
        if (assigneeFilter === "unassigned") return !task.assignee_id;
        if (assigneeFilter === userDetails?.id) return task.assignee_id === userDetails?.id;
        return true;
      });
    }
    return tasks;
  };

  /**
   * Triggered when a drag operation starts.
   * Sets the active task for the drag overlay.
   *
   * @param {DragStartEvent} event - The dnd-kit drag start event.
   */
  const handleDragStart = (event: DragStartEvent) => {
    const task = currentProjectTasks.find((t) => t.id === event.active.id);
    if (task) {
      setActiveTask(task);
    }
  };

  /**
   * Triggered when a drag operation ends.
   * Determines the drop target and updates the task's status accordingly.
   *
   * @param {DragEndEvent} event - The dnd-kit drag end event.
   */
  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveTask(null);

    if (!over) return;

    const activeTaskId = active.id as string;
    const overId = over.id as string;

    // Check if dropped on a column
    const targetColumn = TASKS_COLUMNS.find((col) => col.key === overId);
    if (targetColumn) {
      handleUpdateTaskStatus(activeTaskId, { status: targetColumn.key as Task["status"] });
      return;
    }

    // Check if dropped on another task
    const overTask = currentProjectTasks.find((t) => t.id === overId);
    if (overTask && overTask.status) {
      handleUpdateTaskStatus(activeTaskId, { status: overTask.status });
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
        <DndContext
          sensors={sensors}
          collisionDetection={closestCorners}
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
        >
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {TASKS_COLUMNS.map((column) => {
              const columnTasks = getTasksByStatus(column.key);
              return (
                <DroppableColumn
                  key={column.key}
                  id={column.key}
                  title={column.label}
                  count={columnTasks.length}
                >
                  <SortableContext
                    items={columnTasks.map((t) => t.id)}
                    strategy={verticalListSortingStrategy}
                  >
                    {columnTasks.map((task) => (
                      <TaskCard
                        key={task.id}
                        task={task}
                        onEdit={handleEditTask}
                        onDelete={handleDeleteTask}
                        onStatusChange={handleStatusChange}
                      />
                    ))}
                  </SortableContext>
                </DroppableColumn>
              );
            })}
          </div>
          <DragOverlay>
            {activeTask && (
              <TaskCard
                task={activeTask}
                onEdit={() => {}}
                onDelete={() => {}}
                onStatusChange={() => {}}
                isDragging
              />
            )}
          </DragOverlay>
        </DndContext>
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
                <FieldLabel htmlFor="projectName">Project Name</FieldLabel>
                <Input
                  id="projectName"
                  value={projectFormData.name}
                  onChange={(e) =>
                    setProjectFormData((prev) => ({ ...prev, name: e.target.value }))
                  }
                  placeholder="Enter project name"
                />
                {projectFormErrors.name && (
                  <FieldError errors={[{ message: projectFormErrors.name }]} />
                )}
              </Field>
              <Field>
                <FieldLabel htmlFor="projectDescription">Description</FieldLabel>
                <Input
                  id="projectDescription"
                  value={projectFormData.description}
                  onChange={(e) =>
                    setProjectFormData((prev) => ({ ...prev, description: e.target.value }))
                  }
                  placeholder="Enter project description (optional)"
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

      <Dialog open={isTaskDialogOpen} onOpenChange={handleCloseTaskDialog}>
        <DialogContent>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (editingTask) {
                handleUpdateTaskFromDialog();
              } else {
                handleCreateTask(e);
              }
            }}
          >
            <DialogHeader>
              <DialogTitle>{editingTask ? "Edit Task" : "Create New Task"}</DialogTitle>
              <DialogDescription>
                {editingTask
                  ? "Update the task details below."
                  : "Add a new task to this project."}
              </DialogDescription>
            </DialogHeader>
            <div className="flex flex-col gap-4 py-4">
              <Field>
                <FieldLabel htmlFor="taskTitle">Title</FieldLabel>
                <Input
                  id="taskTitle"
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
                <FieldLabel htmlFor="taskDescription">Description</FieldLabel>
                <Input
                  id="taskDescription"
                  value={taskFormData.description}
                  onChange={(e) =>
                    setTaskFormData((prev) => ({ ...prev, description: e.target.value }))
                  }
                  placeholder="Enter task description (optional)"
                />
              </Field>
              <Field>
                <FieldLabel htmlFor="taskPriority">Priority</FieldLabel>
                <Select
                  value={taskFormData.priority}
                  onValueChange={(value) =>
                    setTaskFormData((prev) => ({
                      ...prev,
                      priority: value as Task["priority"],
                    }))
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
                <FieldLabel htmlFor="taskDueDate">Due Date</FieldLabel>
                <Input
                  id="taskDueDate"
                  type="date"
                  value={taskFormData.due_date}
                  onChange={(e) =>
                    setTaskFormData((prev) => ({ ...prev, due_date: e.target.value }))
                  }
                />
              </Field>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={handleCloseTaskDialog}>
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting
                  ? "Saving..."
                  : editingTask
                  ? "Save Changes"
                  : "Create Task"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}