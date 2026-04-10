import { BrowserRouter } from "react-router-dom";
import { Provider } from "react-redux";
import { createRoot } from "react-dom/client";
import { GoogleOAuthProvider } from "@react-oauth/google";
import "./index.css";
import App from "./App.tsx";
import { initializeAuthenticationState } from "./redux/slices/auth/authSlice.ts";
import store from "./redux/store/store";
import { worker } from "./mocks/browser";
import { ThemeProvider } from "./components/atoms/theme-provider";

store.dispatch(initializeAuthenticationState());

/**
 * Prepares the application environment.
 * Starts Mocks Service Worker (MSW) in development mode for API mocking.
 *
 * @returns {Promise<void>}
 */
async function prepare() {
  if (import.meta.env.DEV || import.meta.env.VITE_USE_MSW === "true") {
    // For production builds, we need to specify the path to the worker script
    return worker.start({
      onUnhandledRequest: "bypass",
      serviceWorker: {
        url: "/mockServiceWorker.js",
      },
    });
  }
  return Promise.resolve();
}

const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID || "";

/**
 * Application Entry Point.
 * Initializes the MSW worker, sets up the Redux store, and renders the React application
 * wrapped in necessary providers (Google OAuth, Router, Redux, Theme).
 */
prepare().then(() => {
  createRoot(document.getElementById("root")!).render(
    <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
      <BrowserRouter>
        <Provider store={store}>
          <ThemeProvider defaultTheme="light" storageKey="taskflow-theme">
            <App />
          </ThemeProvider>
        </Provider>
      </BrowserRouter>
    </GoogleOAuthProvider>
  );
});
