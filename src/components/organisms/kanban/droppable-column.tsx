import { Badge } from "@/components/ui/badge";
import { useDroppable } from "@dnd-kit/core";
import { cn } from "@/lib/utils";

const TASKS_COLUMNS = [
  { key: "todo", label: "To Do" },
  { key: "in_progress", label: "In Progress" },
  { key: "done", label: "Done" },
];

interface DroppableColumnProps {
  id: string;
  title: string;
  count: number;
  children: React.ReactNode;
}

export function DroppableColumn({ id, title, count, children }: DroppableColumnProps) {
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

export { TASKS_COLUMNS };
