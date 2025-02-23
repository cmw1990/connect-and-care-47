
import { Card } from "@/components/ui/card";
import { MessageSquare } from "lucide-react";

export function SecureChat() {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Secure Messages</h3>
      </div>
      <Card className="p-4">
        <div className="flex items-center space-x-4">
          <MessageSquare className="h-5 w-5 text-primary" />
          <div>
            <h4 className="font-medium">Care Team Chat</h4>
            <p className="text-sm text-gray-600 dark:text-gray-300">
              Connect with your care team securely.
            </p>
          </div>
        </div>
      </Card>
    </div>
  );
}
