import { Navigate, Route, Routes } from "react-router-dom";
import { Toaster } from "sonner";
import { PublicRoutes } from "./routes/publicRoutes";
import { useSelector } from "react-redux";
import { PrivateRoutes } from "./routes/privateRoutes";
import { ScrollToTop } from "./components/atoms/scroll-to-top";
import type { RootState } from "./redux/reducers/rootReducer";
import RouteOutlet from "./routes/routeOutlet";

function App() {
  const { isAuthenticated } = useSelector((state: RootState) => state.auth);

  return (
    <>
      <ScrollToTop />
      <Toaster position="top-right" />

      <Routes>
        {/* Private routes */}
        <Route element={<RouteOutlet />}>
          {PrivateRoutes.map((route) => (
            <Route
              key={route.path}
              path={route.path}
              Component={route.component}
            />
          ))}
          {/* Root redirect for authenticated users */}
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
        </Route>

        {/* Public routes */}
        {PublicRoutes.map((route) => (
          <Route
            key={route.path}
            path={route.path}
            element={
              isAuthenticated ? (
                <Navigate to="/dashboard" replace />
              ) : (
                <route.component />
              )
            }
          />
        ))}

        {/* Fallback */}
        <Route
          path="/"
          element={
            isAuthenticated ? (
              <Navigate to="/dashboard" replace />
            ) : (
              <Navigate to="/" replace />
            )
          }
        />
      </Routes>
    </>
  );
}

export default App;
