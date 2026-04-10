
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

export function LoginForm({ className, onSwitchToRegister, ...props }: LoginFormProps) {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

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
              <div className="flex items-center justify-between">
                <FieldLabel htmlFor="password" className="text-sm font-medium">Password</FieldLabel>
                <a href="#" className="text-xs font-semibold text-primary hover:text-primary/80 transition-colors">
                  Forgot password?
                </a>
              </div>
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
