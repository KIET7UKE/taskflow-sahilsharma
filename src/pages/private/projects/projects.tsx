
import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import type { RootState } from "@/redux/reducers/rootReducer";
import { fetchProjects, createProject, deleteProject } from "@/redux/thunks/projectThunks";
import type { Project } from "@/apis/projects";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Field, FieldLabel, FieldError } from "@/components/ui/field";
import { Skeleton } from "@/components/ui/skeleton";
import { FolderIcon, PlusIcon, TrashIcon } from "lucide-react";
import { useAppDispatch } from "../../../hooks/useAppDispatch";
import { usePagination } from "@/hooks/use-pagination";
import { ConfirmDialog } from "@/components/molecules/confirm-dialog";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
  PaginationEllipsis,
} from "@/components/ui/pagination";

/**
 * ProjectsPage Component.
 * The main page for managing all user projects.
 * Displays a list of projects, allows creating new ones, and deleting existing ones.
 *
 * @returns {JSX.Element} The rendered projects management page.
 */
export default function ProjectsPage() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { projects, isLoading, error } = useSelector((state: RootState) => state.projects);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [formData, setFormData] = useState({ name: "", description: "" });
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [isCreating, setIsCreating] = useState(false);
  const [projectToDelete, setProjectToDelete] = useState<string | null>(null);

  const {
    currentPage,
    totalPages,
    startIndex,
    endIndex,
    pageRange,
    handlePageChange,
    handleNextPage,
    handlePreviousPage,
    hasPreviousPage,
    hasNextPage,
  } = usePagination({
    totalItems: projects.length,
    initialPageSize: 6, // 6 projects per page (2x3 or 3x2 grid)
  });

  const paginatedProjects = projects.slice(startIndex, endIndex);

  useEffect(() => {
    dispatch(fetchProjects());
  }, [dispatch]);

  /**
   * Validates the project creation form.
   *
   * @returns {boolean} True if the form is valid, false otherwise.
   */
  const validateForm = () => {
    const errors: Record<string, string> = {};
    if (!formData.name.trim()) {
      errors.name = "Project name is required";
    }
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  /**
   * Handles the creation of a new project.
   * Dispatches the createProject thunk and updates the local state on success.
   *
   * @param {React.FormEvent} e - The form submission event.
   */
  const handleCreateProject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsCreating(true);
    try {
      await dispatch(createProject(formData)).unwrap();
      toast.success("Project created successfully!");
      setIsDialogOpen(false);
      setFormData({ name: "", description: "" });
    } catch (err: any) {
      toast.error(err?.message || "Failed to create project");
    } finally {
      setIsCreating(false);
    }
  };

  /**
   * Handles the deletion of a project.
   * Dispatches the deleteProject thunk and shows a success toast on completion.
   *
   * @param {string} projectId - The ID of the project to delete.
   */
  const handleDeleteProject = async (projectId: string) => {
    try {
      await dispatch(deleteProject(projectId)).unwrap();
      toast.success("Project deleted successfully!");
    } catch (err: any) {
      toast.error(err?.message || "Failed to delete project");
    } finally {
      setProjectToDelete(null);
    }
  };

  /**
   * Navigates to the details page of a specific project.
   *
   * @param {Project} project - The project object to view.
   */
  const handleProjectClick = (project: Project) => {
    navigate(`/projects/${project.id}`);
  };

  /**
   * Formats a date string into a user-friendly format (e.g., "Jan 1, 2024").
   *
   * @param {string} dateString - The ISO date string to format.
   * @returns {string} The formatted date.
   */
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
    <div className="flex flex-col gap-4 md:gap-6 p-4 md:p-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl md:text-2xl font-bold">Projects</h1>
          <p className="text-sm text-muted-foreground">
            Manage your projects and tasks
          </p>
        </div>
        <Button onClick={() => setIsDialogOpen(true)} className="w-full sm:w-auto">
          <PlusIcon className="size-4 mr-2" />
          New Project
        </Button>
      </div>

      {isLoading ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
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
          <Button onClick={() => setIsDialogOpen(true)}>
            <PlusIcon className="size-4 mr-2" />
            Create Project
          </Button>
        </div>
      ) : (
        <>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {paginatedProjects.map((project) => (
            <div
              key={project.id}
              onClick={() => handleProjectClick(project)}
              className="group relative overflow-hidden rounded-2xl border bg-card p-6 cursor-pointer hover:border-primary/50 transition-all hover:shadow-xl hover:shadow-primary/5"
            >
              <div className="flex items-start justify-between relative z-10">
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <div className="size-2 rounded-full bg-primary animate-pulse" />
                    <h3 className="font-semibold text-lg tracking-tight group-hover:text-primary transition-colors">{project.name}</h3>
                  </div>
                  {project.description && (
                    <p className="mt-2 text-sm text-muted-foreground line-clamp-2 leading-relaxed">
                      {project.description}
                    </p>
                  )}
                  <div className="mt-6 flex items-center justify-between">
                    <p className="text-xs text-muted-foreground font-medium">
                      Created {formatDate(project.created_at)}
                    </p>
                    <div className="flex -space-x-2">
                      {[1, 2, 3].map((i) => (
                        <div key={i} className="size-6 rounded-full border-2 border-card bg-muted flex items-center justify-center text-[10px] font-bold">
                          {String.fromCharCode(64 + i)}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="icon-sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    setProjectToDelete(project.id);
                  }}
                  className="opacity-0 group-hover:opacity-100 transition-opacity -mr-2 -mt-2 hover:bg-destructive/10 hover:text-destructive"
                >
                  <TrashIcon className="size-4" />
                </Button>
              </div>
              <div className="absolute -right-8 -top-8 size-32 bg-primary/5 rounded-full blur-3xl group-hover:bg-primary/10 transition-colors" />
            </div>
          ))}
        </div>

        {totalPages > 1 && (
          <div className="mt-8">
            <Pagination>
              <PaginationContent>
                <PaginationItem>
                  <PaginationPrevious 
                    onClick={(e) => {
                      e.preventDefault();
                      handlePreviousPage();
                    }}
                    className={!hasPreviousPage ? "pointer-events-none opacity-50" : "cursor-pointer"}
                  />
                </PaginationItem>
                
                {pageRange[0] > 1 && (
                  <>
                    <PaginationItem>
                      <PaginationLink 
                        onClick={(e) => {
                          e.preventDefault();
                          handlePageChange(1);
                        }}
                        className="cursor-pointer"
                      >
                        1
                      </PaginationLink>
                    </PaginationItem>
                    <PaginationItem>
                      <PaginationEllipsis />
                    </PaginationItem>
                  </>
                )}

                {pageRange.map((page) => (
                  <PaginationItem key={page}>
                    <PaginationLink
                      isActive={currentPage === page}
                      onClick={(e) => {
                        e.preventDefault();
                        handlePageChange(page);
                      }}
                      className="cursor-pointer"
                    >
                      {page}
                    </PaginationLink>
                  </PaginationItem>
                ))}

                {pageRange[pageRange.length - 1] < totalPages && (
                  <>
                    <PaginationItem>
                      <PaginationEllipsis />
                    </PaginationItem>
                    <PaginationItem>
                      <PaginationLink
                        onClick={(e) => {
                          e.preventDefault();
                          handlePageChange(totalPages);
                        }}
                        className="cursor-pointer"
                      >
                        {totalPages}
                      </PaginationLink>
                    </PaginationItem>
                  </>
                )}

                <PaginationItem>
                  <PaginationNext
                    onClick={(e) => {
                      e.preventDefault();
                      handleNextPage();
                    }}
                    className={!hasNextPage ? "pointer-events-none opacity-50" : "cursor-pointer"}
                  />
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          </div>
        )}
      </>
      )}

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <form onSubmit={handleCreateProject}>
            <DialogHeader>
              <DialogTitle>Create New Project</DialogTitle>
              <DialogDescription>
                Add a new project to organize your tasks.
              </DialogDescription>
            </DialogHeader>
            <div className="flex flex-col gap-4 py-4">
              <Field>
                <FieldLabel htmlFor="name">Project Name <span className="text-destructive">*</span></FieldLabel>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
                  placeholder="Enter project name"
                />
                {formErrors.name && <FieldError errors={[{ message: formErrors.name }]} />}
              </Field>
              <Field>
                <FieldLabel htmlFor="description">Description <span className="text-muted-foreground font-normal ml-1">(optional)</span></FieldLabel>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))}
                  placeholder="Enter project description"
                />
              </Field>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={isCreating}>
                {isCreating ? "Creating..." : "Create Project"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
      <ConfirmDialog
        open={!!projectToDelete}
        onOpenChange={(open) => !open && setProjectToDelete(null)}
        title="Delete Project"
        description="Are you sure you want to delete this project? This will permanently remove all tasks associated with it."
        onConfirm={() => projectToDelete && handleDeleteProject(projectToDelete)}
        confirmText="Delete Project"
      />
    </div>
  );
}
