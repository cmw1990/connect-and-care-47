import { Button } from "@/components/ui/button";

interface NoActiveCheckInProps {
  onCheckIn?: () => void;
}

export const NoActiveCheckIn = ({ onCheckIn }: NoActiveCheckInProps) => {
  return (
    <div className="text-center py-8">
      <h3 className="text-lg font-medium mb-2">No Active Check-in</h3>
      <p className="text-muted-foreground mb-4">
        There are no active check-ins at the moment
      </p>
      {onCheckIn && (
        <Button onClick={onCheckIn} variant="outline">
          Start New Check-in
        </Button>
      )}
    </div>
  );
};