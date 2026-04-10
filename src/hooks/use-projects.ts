
import { useDispatch } from "react-redux"
import { useNavigate } from "react-router-dom"
import { deleteProject } from "@/redux/thunks/projectThunks"
import { toast } from "sonner"
import { AppDispatch } from "@/redux/store/store"

/**
 * Custom hook for project-related actions.
 *
 * @returns {object} Project actions and handlers.
 */
export function useProjects() {
  const dispatch = useDispatch<AppDispatch>()
  const navigate = useNavigate()

  /**
   * Handles the deletion of a project with a confirmation prompt.
   *
   * @param {string} id - Project ID.
   * @param {string} name - Project name (for confirmation).
   */
  const handleDeleteProject = async (id: string, name: string) => {
    if (confirm(`Are you sure you want to delete "${name}"?`)) {
      try {
        await dispatch(deleteProject(id)).unwrap()
        toast.success("Project deleted successfully")
        navigate("/dashboard")
      } catch (error) {
        toast.error("Failed to delete project")
      }
    }
  }

  return {
    handleDeleteProject,
  };
}
