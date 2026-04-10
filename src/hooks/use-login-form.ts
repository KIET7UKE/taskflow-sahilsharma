
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { loginThunk } from "@/redux/thunks/authThunks";
import { useAppDispatch } from "@/hooks/useAppDispatch";

/**
 * Custom hook for managing login form state and logic.
 *
 * @returns {object} The login form state and handlers.
 */
export function useLoginForm() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  /**
   * Validates the login form data.
   */
  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.email) {
      newErrors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Invalid email format";
    }
    if (!formData.password) {
      newErrors.password = "Password is required";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  /**
   * Handles form submission.
   */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setIsLoading(true);
    try {
      await dispatch(loginThunk(formData)).unwrap();
      toast.success("Login successful!");
      navigate("/dashboard");
    } catch (error: any) {
      if (error?.fields) {
        setErrors(error.fields);
      } else {
        toast.error(error?.error || "Login failed");
      }
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Handles demo login.
   */
  const handleDemoLogin = async () => {
    const demoData = {
      email: "test@example.com",
      password: "password123",
    };
    setFormData(demoData);
    setErrors({});
    setIsLoading(true);
    
    try {
      await dispatch(loginThunk(demoData)).unwrap();
      toast.success("Demo Login successful!");
      navigate("/dashboard");
    } catch (error: any) {
      toast.error("Demo login failed. Please try manual login.");
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Handles input changes.
   */
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  return {
    formData,
    isLoading,
    errors,
    handleChange,
    handleSubmit,
    handleDemoLogin,
  };
}
