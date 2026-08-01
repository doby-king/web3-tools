import { Suspense } from "react";
import { createBrowserRouter } from "react-router";
import { AppLayout } from "@/components/layout/AppLayout";
import { SpinnerIcon } from "@/components/ui";
import Home from "@/pages/Home";
import { tools } from "@/tools/registry";

const lazyFallback = (
  <div className="flex min-h-[50vh] items-center justify-center text-text-muted">
    <SpinnerIcon size={28} />
  </div>
);

export const router = createBrowserRouter([
  {
    path: "/",
    element: <AppLayout />,
    children: [
      { index: true, element: <Home /> },
      ...tools.map((tool) => ({
        path: tool.path,
        element: (
          <Suspense fallback={lazyFallback}>
            <tool.component />
          </Suspense>
        ),
      })),
    ],
  },
]);
