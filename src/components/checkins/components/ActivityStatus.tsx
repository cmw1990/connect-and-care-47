import { format } from "date-fns";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Activity } from "lucide-react";

export const ActivityStatus = () => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <Activity className="mr-2 h-5 w-5" />
          Activity Status
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-4">
          <div className="text-center p-4 bg-green-50 rounded-lg">
            <p className="text-sm text-gray-600">Last Check-in</p>
            <p className="font-medium">
              {format(new Date(), 'h:mm a')}
            </p>
          </div>
          <div className="text-center p-4 bg-blue-50 rounded-lg">
            <p className="text-sm text-gray-600">Next Check-in</p>
            <p className="font-medium">
              {format(new Date(new Date().getTime() + 24 * 60 * 60 * 1000), 'h:mm a')}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};