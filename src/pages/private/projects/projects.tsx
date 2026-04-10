"use client";

import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import type { RootState } from "@/redux/reducers/rootReducer";
import { fetchProjects, createProject, deleteProject } from "@/redux/slices/projects/projectsSlice";
import type { Project } from "@/apis/projects";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription, SheetFooter } from "@/components/ui/sheet";
import { Field, FieldLabel, FieldError } from "@/components/ui/field";
import { Skeleton } from "@/components/ui/skeleton";
import { FolderIcon, PlusIcon, TrashIcon } from "lucide-react";
import { useAppDispatch } from "../../../hooks/useAppDispatch";

export default function ProjectsPage() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { projects, isLoading, error } = useSelector((state: RootState) => state.projects);
  const { userDetails } = useSelector((state: RootState) => state.auth);
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [formData, setFormData] = useState({ name: "", description: "" });
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [isCreating, setIsCreating] = useState(false);

  useEffect(() => {
    dispatch(fetchProjects());
  }, [dispatch]);

  const validateForm = () => {
    const errors: Record<string, string> = {};
    if (!formData.name.trim()) {
      errors.name = "Project name is required";
    }
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleCreateProject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsCreating(true);
    try {
      await dispatch(createProject(formData)).unwrap();
      toast.success("Project created successfully!");
      setIsSheetOpen(false);
      setFormData({ name: "", description: "" });
    } catch (err: any) {
      toast.error(err?.message || "Failed to create project");
    } finally {
      setIsCreating(false);
    }
  };

  const handleDeleteProject = async (e: React.MouseEvent, projectId: string) => {
    e.stopPropagation();
    if (!confirm("Are you sure you want to delete this project?")) return;

    try {
      await dispatch(deleteProject(projectId)).unwrap();
      toast.success("Project deleted successfully!");
    } catch (err: any) {
      toast.error(err?.message || "Failed to delete project");
    }
  };

  const handleProjectClick = (project: Project) => {
    navigate(`/projects/${project.id}`);
  };

  const formatDate = (dateString: string) => {
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
        <Button onClick={() => dispatch(fetchProjects())}>Retry</Button>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Projects</h1>
          <p className="text-muted-foreground">
            Manage your projects and tasks
          </p>
        </div>
        <Button onClick={() => setIsSheetOpen(true)}>
          <PlusIcon className="size-4 mr-2" />
          New Project
        </Button>
      </div>

      {isLoading ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="rounded-lg border bg-card p-6">
              <Skeleton className="h-5 w-2/3 mb-2" />
              <Skeleton className="h-4 w-full mb-4" />
              <Skeleton className="h-4 w-1/3" />
            </div>
          ))}
        </div>
      ) : projects.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-4 rounded-lg border border-dashed p-12 text-center">
          <FolderIcon className="size-12 text-muted-foreground" />
          <div>
            <h3 className="text-lg font-medium">No projects yet</h3>
            <p className="text-sm text-muted-foreground">
              Create your first project to get started
            </p>
          </div>
          <Button onClick={() => setIsSheetOpen(true)}>
            <PlusIcon className="size-4 mr-2" />
            Create Project
          </Button>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {projects.map((project) => (
            <div
              key={project.id}
              onClick={() => handleProjectClick(project)}
              className="group relative rounded-lg border bg-card p-6 cursor-pointer hover:border-primary/50 transition-colors"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h3 className="font-medium">{project.name}</h3>
                  {project.description && (
                    <p className="mt-1 text-sm text-muted-foreground line-clamp-2">
                      {project.description}
                    </p>
                  )}
                  <p className="mt-3 text-xs text-muted-foreground">
                    Created {formatDate(project.created_at)}
                  </p>
                </div>
                <Button
                  variant="ghost"
                  size="icon-sm"
                  onClick={(e) => handleDeleteProject(e, project.id)}
                  className="opacity-0 group-hover:opacity-100 transition-opacity -mr-2 -mt-2"
                >
                  <TrashIcon className="size-4 text-destructive" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
        <SheetContent>
          <form onSubmit={handleCreateProject}>
            <SheetHeader>
              <SheetTitle>Create New Project</SheetTitle>
              <SheetDescription>
                Add a new project to organize your tasks.
              </SheetDescription>
            </SheetHeader>
            <div className="flex flex-col gap-4 py-4">
              <Field>
                <FieldLabel htmlFor="name">Project Name</FieldLabel>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
                  placeholder="Enter project name"
                />
                {formErrors.name && <FieldError errors={[{ message: formErrors.name }]} />}
              </Field>
              <Field>
                <FieldLabel htmlFor="description">Description (optional)</FieldLabel>
                <Input
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))}
                  placeholder="Enter project description"
                />
              </Field>
            </div>
            <SheetFooter>
              <Button type="button" variant="outline" onClick={() => setIsSheetOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={isCreating}>
                {isCreating ? "Creating..." : "Create Project"}
              </Button>
            </SheetFooter>
          </form>
        </SheetContent>
      </Sheet>
    </div>
  );
}
