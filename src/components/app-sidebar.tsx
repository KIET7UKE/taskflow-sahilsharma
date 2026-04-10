"use client"

import * as React from "react"
import { useSelector } from "react-redux"
import { NavMain } from "@/components/nav-main"
import { NavProjects } from "@/components/nav-projects"
import { NavUser } from "@/components/nav-user"
import { TeamSwitcher } from "@/components/team-switcher"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
} from "@/components/ui/sidebar"
import { GalleryVerticalEndIcon, LayoutDashboardIcon, FolderIcon, PlusIcon } from "lucide-react"
import type { RootState } from "@/redux/reducers/rootReducer"

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const { userDetails } = useSelector((state: RootState) => state.auth);
  const { projects } = useSelector((state: RootState) => state.projects);

  const data = {
    user: {
      name: userDetails?.name || "User",
      email: userDetails?.email || "",
      avatar: "",
    },
    teams: [
      {
        name: "TaskFlow",
        logo: <GalleryVerticalEndIcon />,
        plan: "Enterprise",
      },
    ],
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
      name: p.name,
      url: `/projects/${p.id}`,
      icon: <FolderIcon />,
    })),
  }

  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <TeamSwitcher teams={data.teams} />
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
