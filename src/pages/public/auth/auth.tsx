
import { useState } from "react";
import { RegisterForm } from "@/pages/public/register/register";
import { LoginForm } from "@/components/organisms/login-form";

export default function AuthPage() {
  const [showRegister, setShowRegister] = useState(false);

  return (
    <div className="flex min-h-screen bg-background overflow-hidden">
      {/* Left Side: Branding/Background (Hidden on mobile) */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden bg-primary/5">
        {/* Modern Mesh Gradient Background */}
        <div className="absolute inset-0 z-0">
          <div className="absolute -top-[10%] -left-[10%] w-[70%] h-[70%] bg-primary/20 rounded-full blur-[120px] animate-pulse" />
          <div className="absolute top-[20%] -right-[10%] w-[60%] h-[60%] bg-blue-400/10 rounded-full blur-[100px]" />
          <div className="absolute -bottom-[10%] left-[20%] w-[50%] h-[50%] bg-indigo-400/10 rounded-full blur-[100px]" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_transparent_0%,_rgba(var(--background),_0.4)_100%)]" />
        </div>
        
        <div className="relative z-10 flex flex-col justify-between p-12 h-full">
          <div className="flex items-center gap-2">
            <div className="size-10 bg-primary text-primary-foreground rounded-xl flex items-center justify-center shadow-lg shadow-primary/20">
              <span className="text-xl font-bold">TF</span>
            </div>
            <span className="text-2xl font-bold tracking-tight text-foreground">TaskFlow</span>
          </div>
          
          <div className="space-y-4">
            <h2 className="text-4xl font-bold leading-tight text-foreground">
              Manage your tasks <br /> with elegance.
            </h2>
            <p className="text-lg text-muted-foreground max-w-md">
              The ultimate workspace for teams to collaborate, track projects, and achieve more together.
            </p>
          </div>

          <div className="text-sm text-muted-foreground/60">
            © 2024 TaskFlow. All rights reserved.
          </div>
        </div>
      </div>

      {/* Right Side: Auth Form */}
      <div className="flex flex-col flex-1 items-center justify-center p-6 sm:p-12">
        <div className="w-full max-w-md space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="lg:hidden flex justify-center mb-8">
            <div className="flex items-center gap-2">
              <div className="size-10 bg-primary/10 rounded-xl flex items-center justify-center border border-primary/20">
                <span className="text-primary text-xl font-bold">TF</span>
              </div>
              <span className="text-2xl font-bold tracking-tight text-foreground">TaskFlow</span>
            </div>
          </div>

          {showRegister ? (
            <RegisterForm onSwitchToLogin={() => setShowRegister(false)} />
          ) : (
            <LoginForm onSwitchToRegister={() => setShowRegister(true)} />
          )}
        </div>
      </div>
    </div>
  );
}
