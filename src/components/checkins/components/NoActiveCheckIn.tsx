import { Card, CardContent } from "@/components/ui/card";
import { Heart } from "lucide-react";

export const NoActiveCheckIn = () => {
  return (
    <Card>
      <CardContent className="text-center py-6">
        <Heart className="h-12 w-12 text-primary mx-auto mb-4" />
        <p className="text-lg font-medium">No Active Check-ins</p>
        <p className="text-gray-500">
          You're all caught up! Your next check-in will appear here.
        </p>
      </CardContent>
    </Card>
  );
};