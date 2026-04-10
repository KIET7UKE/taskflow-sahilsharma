"use client";

import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { logout } from "@/redux/slices/auth/authSlice";
import type { RootState } from "@/redux/reducers/rootReducer";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

export default function Dashboard() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { userDetails } = useSelector((state: RootState) => state.auth);

  const handleLogout = () => {
    dispatch(logout());
    toast.success("Logged out successfully");
    navigate("/");
  };

  return (
    <div className="flex flex-col gap-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Dashboard</h1>
          <p className="text-muted-foreground">
            Welcome back, {userDetails?.name || "User"}
          </p>
        </div>
        <Button variant="outline" onClick={handleLogout}>
          Logout
        </Button>
      </div>
      <div className="grid gap-6 md:grid-cols-3">
        <div className="group relative overflow-hidden rounded-2xl border bg-card p-6 transition-all hover:shadow-lg hover:shadow-primary/5">
          <div className="relative z-10">
            <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
              Total Projects
            </h3>
            <p className="mt-2 text-4xl font-bold tracking-tight">0</p>
          </div>
          <div className="absolute -right-4 -bottom-4 size-24 bg-primary/5 rounded-full blur-2xl group-hover:bg-primary/10 transition-colors" />
        </div>
        
        <div className="group relative overflow-hidden rounded-2xl border bg-card p-6 transition-all hover:shadow-lg hover:shadow-primary/5">
          <div className="relative z-10">
            <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
              Total Tasks
            </h3>
            <p className="mt-2 text-4xl font-bold tracking-tight">0</p>
          </div>
          <div className="absolute -right-4 -bottom-4 size-24 bg-primary/5 rounded-full blur-2xl group-hover:bg-primary/10 transition-colors" />
        </div>

        <div className="group relative overflow-hidden rounded-2xl border bg-card p-6 transition-all hover:shadow-lg hover:shadow-accent/5">
          <div className="relative z-10">
            <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
              Completed Tasks
            </h3>
            <p className="mt-2 text-4xl font-bold tracking-tight text-accent-foreground">0</p>
          </div>
          <div className="absolute -right-4 -bottom-4 size-24 bg-accent/5 rounded-full blur-2xl group-hover:bg-accent/10 transition-colors" />
        </div>
      </div>
    </div>
  );
}
