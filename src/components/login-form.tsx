
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
    <div className={cn("flex flex-col gap-8", className)} {...props}>
      <form onSubmit={handleSubmit} className="bg-card p-8 rounded-2xl border shadow-xl shadow-primary/5">
        <FieldGroup>
          <div className="flex flex-col items-center gap-4 text-center mb-6">
            <div className="flex size-14 items-center justify-center rounded-2xl bg-primary/10 text-primary shadow-inner">
              <GalleryVerticalEndIcon className="size-8" />
            </div>
            <div className="space-y-1">
              <h1 className="text-2xl font-bold tracking-tight">Welcome back</h1>
              <FieldDescription className="text-sm">
                Enter your credentials to access your workspace
              </FieldDescription>
            </div>
          </div>
          
          <div className="space-y-4">
            <Field>
              <FieldLabel htmlFor="email">Email <span className="text-destructive">*</span></FieldLabel>
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="m@example.com"
                value={formData.email}
                onChange={handleChange}
                aria-invalid={!!errors.email}
                className="h-11 bg-muted/30 focus-visible:ring-primary/20"
              />
              {errors.email && <FieldError errors={[{ message: errors.email }]} />}
            </Field>
            
            <Field>
              <div className="flex items-center justify-between">
                <FieldLabel htmlFor="password">Password <span className="text-destructive">*</span></FieldLabel>
                <a href="#" className="text-xs text-primary hover:underline underline-offset-4">
                  Forgot password?
                </a>
              </div>
              <Input
                id="password"
                name="password"
                type="password"
                placeholder="Enter your password"
                value={formData.password}
                onChange={handleChange}
                aria-invalid={!!errors.password}
                className="h-11 bg-muted/30 focus-visible:ring-primary/20"
              />
              {errors.password && <FieldError errors={[{ message: errors.password }]} />}
            </Field>

            <Button 
              type="submit" 
              disabled={isLoading}
              className="w-full h-11 text-base font-semibold transition-all hover:opacity-90 active:scale-[0.98]"
            >
              {isLoading ? "Logging in..." : "Continue to Dashboard"}
            </Button>
          </div>

          <div className="mt-8 text-center text-sm">
            <span className="text-muted-foreground">Don&apos;t have an account? </span>
            <a
              href="#"
              onClick={(e) => {
                e.preventDefault();
                onSwitchToRegister?.();
              }}
              className="font-semibold text-primary hover:underline underline-offset-4"
            >
              Sign up
            </a>
          </div>
        </FieldGroup>
      </form>
      <div className="max-w-[280px] mx-auto text-center text-xs text-muted-foreground leading-relaxed">
        By continuing, you agree to our <a href="#" className="underline">Terms</a> and <a href="#" className="underline">Privacy Policy</a>.
      </div>
    </div>
  );
}
