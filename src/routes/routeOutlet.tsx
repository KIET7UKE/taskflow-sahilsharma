import React from "react";
import { Outlet, Navigate } from "react-router-dom";
import { useSelector } from "react-redux";
import type { RootState } from "@/redux/reducers/rootReducer";
import Layout from "@/components/layout/layout";

/**
 * RouteOutlet Component.
 * Acts as a wrapper for protected routes.
 * If the user is authenticated, it renders the application Layout and the child routes (via Outlet).
 * Otherwise, it redirects the user to the base path (Login).
 *
 * @returns {JSX.Element} The rendered layout or a redirect.
 */
const RouteOutlet: React.FC = () => {
    const isAuthenticate = useSelector(
        (state: RootState) => state.auth.isAuthenticated
    );

    return isAuthenticate ? (
        <Layout>
            <Outlet />
        </Layout>
    ) : (
        <Navigate to={`/`} />
    );
};

export default RouteOutlet;