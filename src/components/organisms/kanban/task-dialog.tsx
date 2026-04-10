import type { Task, CreateTaskRequest } from "@/apis/projects";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Field, FieldLabel, FieldError } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface TaskDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editingTask: Task | null;
  formData: CreateTaskRequest;
  formErrors: Record<string, string>;
  isSubmitting: boolean;
  onFormDataChange: (data: CreateTaskRequest) => void;
  onSubmit: () => void;
  onValidate: () => boolean;
}

export function TaskDialog({
  open,
  onOpenChange,
  editingTask,
  formData,
  formErrors,
  isSubmitting,
  onFormDataChange,
  onSubmit,
}: TaskDialogProps) {
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <form onSubmit={handleSubmit}>
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
                value={formData.title}
                onChange={(e) => onFormDataChange({ ...formData, title: e.target.value })}
                placeholder="Enter task title"
              />
              {formErrors.title && (
                <FieldError errors={[{ message: formErrors.title }]} />
              )}
            </Field>
            <Field>
              <FieldLabel htmlFor="taskDescription">Description</FieldLabel>
              <Input
                id="taskDescription"
                value={formData.description}
                onChange={(e) => onFormDataChange({ ...formData, description: e.target.value })}
                placeholder="Enter task description (optional)"
              />
            </Field>
            <Field>
              <FieldLabel htmlFor="taskPriority">Priority</FieldLabel>
              <Select
                value={formData.priority}
                onValueChange={(value) =>
                  onFormDataChange({ ...formData, priority: value as Task["priority"] })
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
                value={formData.due_date}
                onChange={(e) => onFormDataChange({ ...formData, due_date: e.target.value })}
              />
            </Field>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
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
  );
}
