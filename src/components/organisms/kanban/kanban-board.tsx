import { useState } from "react";
import type { Task, UpdateTaskRequest } from "@/apis/projects";
import { TaskCard } from "./task-card";
import { DroppableColumn, TASKS_COLUMNS } from "./droppable-column";
import {
  DndContext,
  DragOverlay,
  closestCorners,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragStartEvent,
  DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";

interface KanbanBoardProps {
  tasks: Task[];
  onEditTask: (task: Task) => void;
  onDeleteTask: (taskId: string) => void;
  onStatusChange: (taskId: string, status: string) => void;
  onTaskMove: (taskId: string, updates: UpdateTaskRequest) => void;
  statusFilter: string;
  assigneeFilter: string;
  userId?: string;
}

export function KanbanBoard({
  tasks,
  onEditTask,
  onDeleteTask,
  onStatusChange,
  onTaskMove,
  statusFilter,
  assigneeFilter,
  userId,
}: KanbanBoardProps) {
  const [activeTask, setActiveTask] = useState<Task | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const getTasksByStatus = (status: string) => {
    let filtered = tasks.filter((task) => task.status === status);
    if (statusFilter !== "all") {
      filtered = filtered.filter((task) => task.status === statusFilter);
    }
    if (assigneeFilter !== "all") {
      filtered = filtered.filter((task) => {
        if (assigneeFilter === "unassigned") return !task.assignee_id;
        if (assigneeFilter === userId) return task.assignee_id === userId;
        return true;
      });
    }
    return filtered;
  };

  const handleDragStart = (event: DragStartEvent) => {
    const task = tasks.find((t) => t.id === event.active.id);
    if (task) setActiveTask(task);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveTask(null);
    if (!over) return;

    const activeTaskId = active.id as string;
    const overId = over.id as string;

    const targetColumn = TASKS_COLUMNS.find((col) => col.key === overId);
    if (targetColumn) {
      onTaskMove(activeTaskId, { status: targetColumn.key as Task["status"] });
      return;
    }

    const overTask = tasks.find((t) => t.id === overId);
    if (overTask && overTask.status) {
      onTaskMove(activeTaskId, { status: overTask.status });
    }
  };

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCorners}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <div className="overflow-x-auto -mx-4 md:mx-0 px-4 md:px-0">
        <div className="min-w-[768px] md:min-w-0 grid grid-cols-3 gap-4">
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
                      onEdit={onEditTask}
                      onDelete={onDeleteTask}
                      onStatusChange={onStatusChange}
                    />
                  ))}
                </SortableContext>
              </DroppableColumn>
            );
          })}
        </div>
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
  );
}
