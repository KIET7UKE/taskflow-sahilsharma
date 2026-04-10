
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { logout } from "@/redux/slices/auth/authSlice";
import { toast } from "sonner";

/**
 * Custom hook for authentication-related actions.
 *
 * @returns {object} Auth actions.
 */
export function useAuth() {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  /**
   * Logs out the user and cleans up local state.
   */
  const handleLogout = () => {
    dispatch(logout());
    localStorage.removeItem("token");
    toast.success("Logged out successfully");
    navigate("/");
  };

  return {
    handleLogout,
  };
}
