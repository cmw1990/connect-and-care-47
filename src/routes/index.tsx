
import { createBrowserRouter, RouteObject } from "react-router-dom";
import { AppLayout } from "@/components/layout/AppLayout";
import { MobileAppLayout } from "@/components/mobile/MobileAppLayout";
import { useIsMobile } from "@/hooks/use-mobile";
import { specializedCareRoutes } from "./specialized-care.routes";
import { marketplaceRoutes } from "./marketplace.routes";
import { careManagementRoutes } from "./care-management.routes";
import { careTeamRoutes } from "./care-team.routes";
import { insuranceRoutes } from "./insurance.routes";

// Page imports
import Index from "@/pages/Index";
import Dashboard from "@/pages/Dashboard";
import Auth from "@/pages/Auth";
import NotFound from "@/pages/NotFound";
import { DiagramEditor } from "@/pages/development/DiagramEditor";

export interface RouteMetadata {
  title: string;
  description?: string;
  icon?: string;
  showInNav?: boolean;
  group?: string;
  order?: number;
  beta?: boolean;
}

export interface AppRoute extends RouteObject {
  meta?: RouteMetadata;
  children?: AppRoute[];
}

export const routes: AppRoute[] = [
  {
    path: "/",
    element: <AppLayout />,
    meta: {
      title: "Home",
      showInNav: true,
      order: 1
    },
    children: [
      {
        index: true,
        element: <Index />,
        meta: {
          title: "Welcome",
        }
      },
      {
        path: "dashboard",
        element: <Dashboard />,
        meta: {
          title: "Dashboard",
          showInNav: true,
          order: 2
        }
      },
      ...specializedCareRoutes,
      ...marketplaceRoutes,
      ...careManagementRoutes,
      ...careTeamRoutes,
      ...insuranceRoutes,
      {
        path: "dev",
        children: [
          {
            path: "diagram",
            element: <DiagramEditor />,
            meta: {
              title: "App Diagram",
              description: "Visual diagram editor for app routes and wireframes",
            }
          }
        ]
      }
    ]
  },
  {
    path: "/auth",
    element: <Auth />,
    meta: {
      title: "Authentication"
    }
  },
  {
    path: "*",
    element: <NotFound />,
    meta: {
      title: "Not Found"
    }
  }
];

export const router = createBrowserRouter(routes);

// Helper functions for route management
export const findRouteByPath = (path: string): AppRoute | undefined => {
  const findRoute = (routes: AppRoute[], targetPath: string): AppRoute | undefined => {
    for (const route of routes) {
      if (route.path === targetPath) return route;
      if (route.children) {
        const found = findRoute(route.children, targetPath);
        if (found) return found;
      }
    }
    return undefined;
  };
  return findRoute(routes, path);
};

export const getAllRoutes = (): AppRoute[] => {
  const flattenRoutes = (routes: AppRoute[]): AppRoute[] => {
    return routes.reduce((acc: AppRoute[], route) => {
      acc.push(route);
      if (route.children) {
        acc.push(...flattenRoutes(route.children));
      }
      return acc;
    }, []);
  };
  return flattenRoutes(routes);
};

export const getNavigationRoutes = (): AppRoute[] => {
  return getAllRoutes().filter(route => route.meta?.showInNav);
};
