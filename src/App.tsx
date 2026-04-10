import { Navigate, Route, Routes } from "react-router-dom";
import { Toaster } from "sonner";
import { PublicRoutes } from "./routes/publicRoutes";
import { useSelector } from "react-redux";
import { PrivateRoutes } from "./routes/privateRoutes";
import { ScrollToTop } from "./components/atoms/scroll-to-top";
import type { RootState } from "./redux/reducers/rootReducer";
import RouteOutlet from "./routes/routeOutlet";

/**
 * Root Application Component.
 * Sets up global providers like Toaster, ScrollToTop, and defines the main routing structure.
 * Handles both public and private route rendering.
 *
 * @returns {JSX.Element} The rendered application layout.
 */
function App() {
  const { userDetails } = useSelector((state: RootState) => state.auth);
  console.log(userDetails, "userDetails");
  return (
    <>
      <ScrollToTop />
      <Toaster position="top-right" />

      <Routes>
        {/* Private routes first - when authenticated, these will be matched */}
        <Route element={<RouteOutlet />}>
          <Route>
            {PrivateRoutes.map((route) => (
              <Route
                key={route.path}
                path={route.path}
                Component={route.component}
              />
            ))}
          </Route>
        </Route>

        {/* Public routes - only matched if not authenticated or for public-only routes */}
        {PublicRoutes.map((route) => (
          <Route
            key={route.path}
            path={route.path}
            Component={route.component}
          />
        ))}

        <Route path={"/"} element={<PrivateLoginRedirect />} />
      </Routes>
    </>
  );
}

/**
 * A helper component that handles redirection based on authentication state.
 * If the user is not authenticated, they are redirected to the login page.
 *
 * @returns {JSX.Element | null} Redirects to login if not authenticated, otherwise returns null.
 */
const PrivateLoginRedirect = () => {
  const { isAuthenticated } = useSelector(
    (state: RootState) => state.auth
  );

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  return null;
};

export default App;
