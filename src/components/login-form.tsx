
import { useState } from "react";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
  FieldError,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { GalleryVerticalEndIcon } from "lucide-react";
import { loginThunk } from "@/redux/thunks/authThunks";
import { useAppDispatch } from "@/hooks/useAppDispatch";

interface LoginFormProps extends React.ComponentProps<"div"> {
  onSwitchToRegister?: () => void;
}

/**
 * LoginForm Component.
 * A reusable form for user authentication, supporting email/password login and a quick demo login.
 *
 * @param {LoginFormProps} props - The component props.
 * @param {string} props.className - Additional CSS classes.
 * @param {Function} props.onSwitchToRegister - Callback to switch to the registration view.
 * @returns {JSX.Element} The rendered login form.
 */
export function LoginForm({ className, onSwitchToRegister, ...props }: LoginFormProps) {
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
   * Checks for required fields and proper email format.
   *
   * @returns {boolean} True if the form is valid, false otherwise.
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
   * Handles the submission of the login form.
   * Dispatches the login thunk and navigates to the dashboard on success.
   *
   * @param {React.FormEvent} e - The form event.
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
   * Performs an automated demo login with pre-defined credentials.
   * Useful for quick access and showcase purposes.
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
   * Handles input changes in the login form.
   * Updates state and clears corresponding errors.
   *
   * @param {React.ChangeEvent<HTMLInputElement>} e - The input change event.
   */
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <div className="flex flex-col gap-2 text-center lg:text-left">
        <h1 className="text-3xl font-bold tracking-tight">Welcome back</h1>
        <p className="text-muted-foreground">
          Enter your credentials to access your workspace
        </p>
      </div>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        <FieldGroup>
          <div className="space-y-4">
            <Field>
              <FieldLabel htmlFor="email" className="text-sm font-medium">Email Address</FieldLabel>
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="name@example.com"
                value={formData.email}
                onChange={handleChange}
                aria-invalid={!!errors.email}
                className="h-12 bg-background border-input px-4 rounded-xl focus-visible:ring-primary/20 transition-all"
              />
              {errors.email && <FieldError errors={[{ message: errors.email }]} />}
            </Field>
            
            <Field>
              <FieldLabel htmlFor="password" className="text-sm font-medium">Password</FieldLabel>
              <Input
                id="password"
                name="password"
                type="password"
                placeholder="••••••••"
                value={formData.password}
                onChange={handleChange}
                aria-invalid={!!errors.password}
                className="h-12 bg-background border-input px-4 rounded-xl focus-visible:ring-primary/20 transition-all"
              />
              {errors.password && <FieldError errors={[{ message: errors.password }]} />}
            </Field>

            <Button 
              type="submit" 
              disabled={isLoading}
              className="w-full h-12 text-base font-bold rounded-xl shadow-lg shadow-primary/20 transition-all hover:translate-y-[-1px] active:translate-y-[0px]"
            >
              {isLoading ? "Signing in..." : "Sign in to TaskFlow"}
            </Button>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-background px-2 text-muted-foreground font-medium">
                  Or explore TaskFlow
                </span>
              </div>
            </div>

            <Button 
              type="button"
              variant="outline"
              onClick={handleDemoLogin}
              disabled={isLoading}
              className="w-full h-12 text-sm font-semibold border-primary/20 hover:bg-primary/5 hover:text-primary rounded-xl transition-all"
            >
              Quick Demo Login
            </Button>
          </div>

          <div className="text-center text-sm">
            <span className="text-muted-foreground">Don&apos;t have an account? </span>
            <button
              type="button"
              onClick={(e) => {
                e.preventDefault();
                onSwitchToRegister?.();
              }}
              className="font-bold text-primary hover:text-primary/80 transition-colors"
            >
              Create an account
            </button>
          </div>
        </FieldGroup>
      </form>
      
      <div className="text-center text-[11px] text-muted-foreground/60 leading-relaxed px-4">
        By continuing, you agree to our <a href="#" className="underline hover:text-primary">Terms of Service</a> and <a href="#" className="underline hover:text-primary">Privacy Policy</a>.
      </div>
    </div>
  );
}
