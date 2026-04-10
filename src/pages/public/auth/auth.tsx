"use client";

import { useState } from "react";
import { LoginForm } from "@/components/login-form";
import { RegisterForm } from "@/pages/public/register/register";

export default function AuthPage() {
  const [showRegister, setShowRegister] = useState(false);

  if (showRegister) {
    return (
      <div className="flex min-h-svh flex-col items-center justify-center gap-6 bg-background p-6">
        <RegisterForm onSwitchToLogin={() => setShowRegister(false)} />
      </div>
    );
  }

  return (
    <div className="flex min-h-svh flex-col items-center justify-center gap-6 bg-background p-6">
      <LoginForm onSwitchToRegister={() => setShowRegister(true)} />
    </div>
  );
}
