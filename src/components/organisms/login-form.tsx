
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { FieldGroup } from "@/components/ui/field";
import { FormField } from "@/components/molecules/form-field";
import { useLoginForm } from "@/hooks/use-login-form";

interface LoginFormProps extends React.ComponentProps<"div"> {
  onSwitchToRegister?: () => void;
}

/**
 * LoginForm Organism.
 * A comprehensive login form component that manages its own logic via a custom hook.
 * Follows Atomic Design: Organism (composed of molecules and atoms).
 *
 * @param {LoginFormProps} props - The component props.
 * @returns {JSX.Element} The rendered login form organism.
 */
export function LoginForm({ className, onSwitchToRegister, ...props }: LoginFormProps) {
  const {
    formData,
    isLoading,
    errors,
    handleChange,
    handleSubmit,
    handleDemoLogin,
  } = useLoginForm();

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
            <FormField
              id="email"
              name="email"
              label="Email Address"
              type="email"
              placeholder="name@example.com"
              value={formData.email}
              onChange={handleChange}
              error={errors.email}
              required
            />
            
            <FormField
              id="password"
              name="password"
              label="Password"
              type="password"
              placeholder="••••••••"
              value={formData.password}
              onChange={handleChange}
              error={errors.password}
              required
            />

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
