import { BrowserRouter } from "react-router-dom";
import { Provider } from "react-redux";
import { createRoot } from "react-dom/client";
import { GoogleOAuthProvider } from "@react-oauth/google";
import "./index.css";
import App from "./App.tsx";
import { initializeAuthenticationState } from "./redux/slices/auth/authSlice.ts";
import store from "./redux/store/store";
import { worker } from "./mocks/browser";

store.dispatch(initializeAuthenticationState());

async function prepare() {
  if (import.meta.env.DEV) {
    return worker.start();
  }
  return Promise.resolve();
}

const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID || "";

prepare().then(() => {
  createRoot(document.getElementById("root")!).render(
    <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
      <BrowserRouter>
        <Provider store={store}>
          <App />
        </Provider>
      </BrowserRouter>
    </GoogleOAuthProvider>
  );
});
