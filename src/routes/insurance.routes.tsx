
import React from "react";
import Coverage from "@/pages/insurance/Coverage";
import Claims from "@/pages/insurance/Claims";
import Documents from "@/pages/insurance/Documents";
import Network from "@/pages/insurance/Network";
import Setup from "@/pages/insurance/Setup";

export const insuranceRoutes = [
  {
    path: "/insurance/coverage",
    element: <Coverage />,
    meta: {
      title: "Insurance Coverage",
      description: "View your insurance coverage details"
    }
  },
  {
    path: "/insurance/claims",
    element: <Claims />,
    meta: {
      title: "Insurance Claims",
      description: "Manage your insurance claims"
    }
  },
  {
    path: "/insurance/documents", 
    element: <Documents />,
    meta: {
      title: "Insurance Documents",
      description: "Access your insurance documents"
    }
  },
  {
    path: "/insurance/network",
    element: <Network />,
    meta: {
      title: "Provider Network",
      description: "Find in-network healthcare providers"
    }
  },
  {
    path: "/insurance/setup",
    element: <Setup />,
    meta: {
      title: "Insurance Setup",
      description: "Set up your insurance information"
    }
  }
];
