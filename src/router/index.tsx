import { createBrowserRouter } from "react-router-dom";
import ExamplePage from "../pages/Example";
import QrClockPage from "../pages/QrClock";
import NavigationPage from "../pages/Navigation";

export const router = createBrowserRouter([
  {
    path: "/",
    element: <NavigationPage />,
  },
  {
    path: "/example",
    element: <ExamplePage />,
  },
  {
    path: "/qrclock",
    element: <QrClockPage />,
  },
]);
