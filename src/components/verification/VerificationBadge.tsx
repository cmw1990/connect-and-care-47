
import { Shield, AlertCircle, CheckCircle, Clock } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface VerificationBadgeProps {
  status: 'pending' | 'in_progress' | 'verified' | 'failed' | 'expired';
  showLabel?: boolean;
  size?: 'sm' | 'default';
}

export const VerificationBadge = ({ status, showLabel = true, size = 'default' }: VerificationBadgeProps) => {
  const statusConfig = {
    pending: {
      icon: Clock,
      text: "Verification Pending",
      className: "bg-yellow-100 text-yellow-800"
    },
    in_progress: {
      icon: AlertCircle,
      text: "Verification In Progress",
      className: "bg-blue-100 text-blue-800"
    },
    verified: {
      icon: Shield,
      text: "Verified",
      className: "bg-green-100 text-green-800"
    },
    failed: {
      icon: AlertCircle,
      text: "Verification Failed",
      className: "bg-red-100 text-red-800"
    },
    expired: {
      icon: Clock,
      text: "Verification Expired",
      className: "bg-gray-100 text-gray-800"
    }
  };

  const config = statusConfig[status];
  const Icon = config.icon;

  return (
    <Badge 
      variant="secondary"
      className={`flex items-center gap-1 ${config.className} ${size === 'sm' ? 'text-xs py-0' : ''}`}
    >
      <Icon className={size === 'sm' ? 'h-3 w-3' : 'h-4 w-4'} />
      {showLabel && config.text}
    </Badge>
  );
};
