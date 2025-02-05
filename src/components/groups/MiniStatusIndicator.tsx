import React, { useState } from "react";
import { AlertTriangle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { GroupStatusBar } from "./GroupStatusBar";

interface MiniStatusIndicatorProps {
  status: string;
  message: string;
  groupId: string;
  isAdmin?: boolean;
}

const statusColors = {
  normal: "bg-[#F2FCE2] text-green-700",
  warning: "bg-[#FEF7CD] text-yellow-700",
  urgent: "bg-[#F97316] text-white",
  emergency: "bg-[#ea384c] text-white",
};

const statusMessages = {
  normal: "Everything is fine",
  warning: "Attention needed",
  urgent: "Urgent situation",
  emergency: "Emergency",
};

export const MiniStatusIndicator = ({ status, groupId, isAdmin = false }: MiniStatusIndicatorProps) => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  return (
    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
      <Badge 
        onClick={() => isAdmin && setIsDialogOpen(true)}
        className={`${statusColors[status as keyof typeof statusColors]} flex items-center gap-1 px-2 py-1 cursor-pointer`}
      >
        <AlertTriangle className="h-3 w-3" />
        <span className="text-xs">{statusMessages[status as keyof typeof statusMessages]}</span>
      </Badge>
      {isAdmin && (
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Update Group Status</DialogTitle>
          </DialogHeader>
          <GroupStatusBar groupId={groupId} initialStatus={status} />
        </DialogContent>
      )}
    </Dialog>
  );
};