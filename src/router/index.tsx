import { createBrowserRouter } from "react-router-dom";
import Example from "../pages/Example";

export const router = createBrowserRouter([
  {
    path: "/",
    element: <Example />,
  },
]);
