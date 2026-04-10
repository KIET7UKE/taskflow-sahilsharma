
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
  FieldSeparator,
  FieldError,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { GalleryVerticalEndIcon } from "lucide-react";
import { registerThunk } from "@/redux/thunks/authThunks";
import { useAppDispatch } from "@/hooks/useAppDispatch";

interface RegisterFormProps extends React.ComponentProps<"div"> {
  onSwitchToLogin?: () => void;
}

/**
 * RegisterForm Component.
 * A comprehensive form for new user registration.
 * Handles validation and submission of user details to create a new account.
 *
 * @param {RegisterFormProps} props - The component props.
 * @param {string} props.className - Additional CSS classes.
 * @param {Function} props.onSwitchToLogin - Callback to switch to the login view.
 * @returns {JSX.Element} The rendered registration form.
 */
export function RegisterForm({ className, onSwitchToLogin, ...props }: RegisterFormProps) {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  /**
   * Validates the registration form data.
   * Ensures all required fields are present, email is valid, and passwords match.
   *
   * @returns {boolean} True if the form is valid, false otherwise.
   */
  const validate = () => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.name.trim()) {
      newErrors.name = "Name is required";
    }
    
    if (!formData.email) {
      newErrors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Invalid email format";
    }
    
    if (!formData.password) {
      newErrors.password = "Password is required";
    } else if (formData.password.length < 6) {
      newErrors.password = "Password must be at least 6 characters";
    }
    
    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  /**
   * Handles the submission of the registration form.
   * Dispatches the registration thunk and navigates to the dashboard on success.
   *
   * @param {React.FormEvent} e - The form event.
   */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setIsLoading(true);
    try {
      const { confirmPassword, ...registerData } = formData;
      await dispatch(registerThunk(registerData)).unwrap();
      toast.success("Registration successful!");
      navigate("/dashboard");
    } catch (error: any) {
      if (error?.fields) {
        setErrors(error.fields);
      } else {
        toast.error(error?.error || "Registration failed");
      }
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Handles input changes in the registration form.
   * Updates state and clears corresponding validation errors.
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
        <h1 className="text-3xl font-bold tracking-tight">Create your account</h1>
        <p className="text-muted-foreground">
          Join TaskFlow today and start managing projects like a pro.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <FieldGroup>
          <div className="space-y-4">
            <Field>
              <FieldLabel htmlFor="name" className="text-sm font-medium">Full Name</FieldLabel>
              <Input
                id="name"
                name="name"
                type="text"
                placeholder="John Doe"
                value={formData.name}
                onChange={handleChange}
                aria-invalid={!!errors.name}
                className="h-12 bg-background border-input px-4 rounded-xl focus-visible:ring-primary/20 transition-all"
              />
              {errors.name && <FieldError errors={[{ message: errors.name }]} />}
            </Field>

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

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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

              <Field>
                <FieldLabel htmlFor="confirmPassword" className="text-sm font-medium">Confirm</FieldLabel>
                <Input
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password"
                  placeholder="••••••••"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  aria-invalid={!!errors.confirmPassword}
                  className="h-12 bg-background border-input px-4 rounded-xl focus-visible:ring-primary/20 transition-all"
                />
                {errors.confirmPassword && <FieldError errors={[{ message: errors.confirmPassword }]} />}
              </Field>
            </div>

            <Button 
              type="submit" 
              disabled={isLoading}
              className="w-full h-12 text-base font-bold rounded-xl shadow-lg shadow-primary/20 transition-all hover:translate-y-[-1px] active:translate-y-[0px]"
            >
              {isLoading ? "Creating account..." : "Start your free trial"}
            </Button>
          </div>

          <div className="text-center text-sm">
            <span className="text-muted-foreground">Already have an account? </span>
            <button
              type="button"
              onClick={(e) => {
                e.preventDefault();
                onSwitchToLogin?.();
              }}
              className="font-bold text-primary hover:text-primary/80 transition-colors"
            >
              Sign in
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
