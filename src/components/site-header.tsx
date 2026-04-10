
import { useSelector } from "react-redux";
import { useLocation, Link } from "react-router-dom";
import { Separator } from "@/components/ui/separator";
import { SidebarTrigger } from "@/components/ui/sidebar";
import type { RootState } from "@/redux/reducers/rootReducer";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";

import { ModeToggle } from "@/components/mode-toggle";

export function SiteHeader() {
  const location = useLocation();
  const { userDetails } = useSelector((state: RootState) => state.auth);
  const { currentProject } = useSelector((state: RootState) => state.projects);

  const pathnames = location.pathname.split("/").filter((x) => x);

  return (
    <header className="flex h-(--header-height) shrink-0 items-center gap-2 border-b transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-(--header-height)">
      <div className="flex w-full items-center gap-1 px-4 lg:gap-2 lg:px-6">
        <SidebarTrigger className="-ml-1" />
        <Separator
          orientation="vertical"
          className="mx-2 h-4 data-vertical:self-auto"
        />
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink render={<Link to="/dashboard" />}>
                Dashboard
              </BreadcrumbLink>
            </BreadcrumbItem>
            {pathnames.includes("projects") && (
              <>
                <BreadcrumbSeparator />
                <BreadcrumbItem>
                  {pathnames.length === 1 ? (
                    <BreadcrumbPage>Projects</BreadcrumbPage>
                  ) : (
                    <BreadcrumbLink render={<Link to="/projects" />}>
                      Projects
                    </BreadcrumbLink>
                  )}
                </BreadcrumbItem>
              </>
            )}
            {pathnames.length > 1 && pathnames[0] === "projects" && currentProject && (
              <>
                <BreadcrumbSeparator />
                <BreadcrumbItem>
                  <BreadcrumbPage>{currentProject.name}</BreadcrumbPage>
                </BreadcrumbItem>
              </>
            )}
            {pathnames.length === 0 && (
              <>
                <BreadcrumbSeparator />
                <BreadcrumbItem>
                  <BreadcrumbPage>Home</BreadcrumbPage>
                </BreadcrumbItem>
              </>
            )}
          </BreadcrumbList>
        </Breadcrumb>
        <div className="ml-auto flex items-center gap-4 text-sm">
          <ModeToggle />
          <div className="flex items-center gap-2 text-muted-foreground">
            <span className="hidden sm:inline">Welcome,</span>
            <span className="font-medium text-foreground">{userDetails?.name}</span>
          </div>
        </div>
      </div>
    </header>
  );
}
