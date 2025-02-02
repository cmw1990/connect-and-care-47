import React from "react";
import { AlertTriangle } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface MiniStatusIndicatorProps {
  status: string;
  message: string;
}

const statusColors = {
  normal: "bg-[#F2FCE2] text-green-700",
  warning: "bg-[#FEF7CD] text-yellow-700",
  urgent: "bg-[#F97316] text-white",
  emergency: "bg-[#ea384c] text-white",
};

export const MiniStatusIndicator = ({ status, message }: MiniStatusIndicatorProps) => {
  return (
    <Badge 
      className={`${statusColors[status as keyof typeof statusColors]} flex items-center gap-1 px-2 py-1`}
    >
      <AlertTriangle className="h-3 w-3" />
      <span className="text-xs">{message}</span>
    </Badge>
  );
};