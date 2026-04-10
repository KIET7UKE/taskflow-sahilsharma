
import { useEffect } from "react"
import { useDispatch } from "react-redux"
import { fetchProjects } from "@/redux/thunks/projectThunks"
import type { AppDispatch } from "@/redux/store/store"
import { AppSidebar } from "@/components/organisms/app-sidebar"
import { SiteHeader } from "@/components/organisms/site-header"
import {
    SidebarInset,
    SidebarProvider,
} from "@/components/ui/sidebar"

/**
 * Main Layout Component.
 * Assembles the Sidebar, Header, and main content area.
 * Handles initial data fetching (projects).
 *
 * @param {Object} props - Component props.
 * @returns {JSX.Element} The rendered layout.
 */
export default function Layout({ children }: { children: React.ReactNode }) {
    const dispatch = useDispatch<AppDispatch>();

    useEffect(() => {
        dispatch(fetchProjects());
    }, [dispatch]);

    return (
        <SidebarProvider
            style={
                {
                    "--sidebar-width": "calc(var(--spacing) * 72)",
                    "--header-height": "calc(var(--spacing) * 12)",
                } as React.CSSProperties
            }
        >
            <AppSidebar variant="inset" />
            <SidebarInset>
                <SiteHeader />
                <div className="flex flex-1 flex-col gap-4 p-4 pb-6 md:p-6 md:pt-4">{children}</div>
            </SidebarInset>
        </SidebarProvider>
    )
}
