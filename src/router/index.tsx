import { createBrowserRouter } from "react-router-dom";
import Example from "../pages/Example";
import QrClockPage from "../pages/QrClock";

export const router = createBrowserRouter([
  {
    path: "/",
    element: <Example />,
  },
  {
    path: "/qrclock",
    element: <QrClockPage />,
  },
]);
