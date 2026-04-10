

import * as React from "react"
import { useSelector } from "react-redux"
import { NavMain } from "@/components/nav-main"
import { NavProjects } from "@/components/nav-projects"
import { NavUser } from "@/components/nav-user"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
} from "@/components/ui/sidebar"
import { GalleryVerticalEndIcon, LayoutDashboardIcon, FolderIcon, PlusIcon } from "lucide-react"
import type { RootState } from "@/redux/reducers/rootReducer"

/**
 * AppSidebar Component.
 * The primary navigation sidebar for the application.
 * Contains the main navigation links, project list, and user profile section.
 * Responsive and collapsible.
 *
 * @param {React.ComponentProps<typeof Sidebar>} props - Standard Sidebar props.
 * @returns {JSX.Element} The rendered Sidebar.
 */
export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const { userDetails } = useSelector((state: RootState) => state.auth);
  const { projects } = useSelector((state: RootState) => state.projects);

  const data = {
    user: {
      name: userDetails?.name || "User",
      email: userDetails?.email || "",
      avatar: "",
    },
    navMain: [
      {
        title: "Dashboard",
        url: "/dashboard",
        icon: <LayoutDashboardIcon />,
        isActive: true,
      },
      {
        title: "Projects",
        url: "/projects",
        icon: <FolderIcon />,
      },
    ],
    projects: projects.map(p => ({
      id: p.id,
      name: p.name,
      url: `/projects/${p.id}`,
      icon: <FolderIcon />,
    })),
  }

  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <div className="flex items-center gap-2 px-2 py-4">
          <div className="flex size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground shadow-sm">
            <GalleryVerticalEndIcon className="size-5" />
          </div>
          <div className="flex flex-col gap-0.5 leading-none group-data-[collapsible=icon]:hidden">
            <span className="font-bold text-sm tracking-tight">TaskFlow</span>
            <span className="text-[10px] text-muted-foreground font-medium">Enterprise</span>
          </div>
        </div>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={data.navMain} />
        <NavProjects projects={data.projects} />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={data.user} />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}
