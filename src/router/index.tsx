import { lazy, Suspense } from "react";
import { createBrowserRouter } from "react-router-dom";
import PageLoadingFallback from "../components/common/PageLoadingFallback";

// 懒加载页面组件
const ExamplePage = lazy(() => import("../pages/Example"));
const QrClockPage = lazy(() => import("../pages/QrClock"));
const BadVideoPage = lazy(() => import("../pages/BadVideo"));
const VideoConvertorPage = lazy(() => import("../pages/VideoConvertor"));

// Navigation 页面作为首页，保持同步加载以获得最快的首屏速度
import NavigationPage from "../pages/Navigation";

// 包装懒加载组件的 Suspense
const withSuspense = (Component: React.LazyExoticComponent<React.FC>) => (
  <Suspense fallback={<PageLoadingFallback />}>
    <Component />
  </Suspense>
);

export const router = createBrowserRouter([
  {
    path: "/",
    element: <NavigationPage />,
  },
  {
    path: "/example",
    element: withSuspense(ExamplePage),
  },
  {
    path: "/qrclock",
    element: withSuspense(QrClockPage),
  },
  {
    path: "/badvideo",
    element: withSuspense(BadVideoPage),
  },
  {
    path: "/videoconvertor",
    element: withSuspense(VideoConvertorPage),
  },
]);
