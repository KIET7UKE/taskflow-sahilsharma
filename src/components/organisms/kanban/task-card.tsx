import type { Task } from "@/apis/projects";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { TrashIcon, CalendarIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

const PRIORITY_COLORS = {
  low: "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300",
  medium: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300",
  high: "bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300",
};

interface TaskCardProps {
  task: Task;
  onEdit: (task: Task) => void;
  onDelete: (taskId: string) => void;
  onStatusChange: (taskId: string, status: string) => void;
  isDragging?: boolean;
}

export function TaskCard({ task, onEdit, onDelete, onStatusChange, isDragging }: TaskCardProps) {
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

  const handleClick = () => {
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
