import { useEffect } from "react";
import { useSelector } from "react-redux";
import type { RootState } from "@/redux/reducers/rootReducer";
import { fetchDashboardStats } from "@/redux/thunks/projectThunks";
import { useAppDispatch } from "@/hooks/useAppDispatch";

export default function Dashboard() {
  const { userDetails } = useSelector((state: RootState) => state.auth);
  const { dashboardStats, isLoading } = useSelector((state: RootState) => state.projects);
  const dispatch = useAppDispatch();

  useEffect(() => {
    dispatch(fetchDashboardStats());
  }, [dispatch]);

  const stats = dashboardStats || {
    totalProjects: 0,
    totalTasks: 0,
    completedTasks: 0,
  };

  return (
    <div className="flex flex-col gap-8 p-8">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold tracking-tight">Dashboard Overview</h1>
          <p className="text-muted-foreground">
            Welcome back, <span className="text-foreground font-medium">{userDetails?.name || "User"}</span>. Here&apos;s what&apos;s happening today.
          </p>
        </div>
      </div>
      
      <div className="grid gap-6 md:grid-cols-3">
        <div className="group relative overflow-hidden rounded-2xl border bg-card p-6 transition-all hover:shadow-xl hover:shadow-primary/5">
          <div className="relative z-10">
            <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-widest">
              Active Projects
            </h3>
            <p className="mt-2 text-5xl font-extrabold tracking-tight">
              {isLoading ? "..." : stats.totalProjects}
            </p>
          </div>
          <div className="absolute -right-4 -bottom-4 size-32 bg-primary/5 rounded-full blur-3xl group-hover:bg-primary/10 transition-colors" />
        </div>
        
        <div className="group relative overflow-hidden rounded-2xl border bg-card p-6 transition-all hover:shadow-xl hover:shadow-primary/5">
          <div className="relative z-10">
            <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-widest">
              Total Tasks
            </h3>
            <p className="mt-2 text-5xl font-extrabold tracking-tight">
              {isLoading ? "..." : stats.totalTasks}
            </p>
          </div>
          <div className="absolute -right-4 -bottom-4 size-32 bg-primary/5 rounded-full blur-3xl group-hover:bg-primary/10 transition-colors" />
        </div>

        <div className="group relative overflow-hidden rounded-2xl border bg-accent/5 p-6 border-accent/20 transition-all hover:shadow-xl hover:shadow-accent/5">
          <div className="relative z-10">
            <h3 className="text-sm font-semibold text-accent-foreground/60 uppercase tracking-widest">
              Completed Tasks
            </h3>
            <p className="mt-2 text-5xl font-extrabold tracking-tight text-accent-foreground">
              {isLoading ? "..." : stats.completedTasks}
            </p>
          </div>
          <div className="absolute -right-4 -bottom-4 size-32 bg-accent/10 rounded-full blur-3xl group-hover:bg-accent/20 transition-colors" />
        </div>
      </div>
    </div>
  );
}
