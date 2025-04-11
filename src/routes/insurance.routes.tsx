
import React from "react";
import Coverage from "@/pages/insurance/Coverage";
import Claims from "@/pages/insurance/Claims";
import Documents from "@/pages/insurance/Documents";
import Network from "@/pages/insurance/Network";
import Setup from "@/pages/insurance/Setup";

export const insuranceRoutes = [
  {
    path: "insurance",
    children: [
      {
        path: "coverage",
        element: <Coverage />,
        meta: {
          title: "Insurance Coverage",
          description: "View your insurance coverage details"
        }
      },
      {
        path: "claims",
        element: <Claims />,
        meta: {
          title: "Insurance Claims",
          description: "Manage your insurance claims"
        }
      },
      {
        path: "documents",
        element: <Documents />,
        meta: {
          title: "Insurance Documents",
          description: "Access your insurance documents"
        }
      },
      {
        path: "network",
        element: <Network />,
        meta: {
          title: "Provider Network",
          description: "Find in-network healthcare providers"
        }
      },
      {
        path: "setup",
        element: <Setup />,
        meta: {
          title: "Insurance Setup",
          description: "Set up your insurance information"
        }
      }
    ]
  }
];
