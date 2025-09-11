import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { Provider } from "react-redux";
import { RouterProvider } from "react-router-dom";
import CssBaseline from "@mui/material/CssBaseline";
import { store } from "./stores";
import { router } from "./router";
import ThemeProviderWrapper from "./components/common/ThemeProviderWrapper";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <Provider store={store}>
      <ThemeProviderWrapper>
        <CssBaseline />
        <RouterProvider router={router} />
      </ThemeProviderWrapper>
    </Provider>
  </StrictMode>
);
