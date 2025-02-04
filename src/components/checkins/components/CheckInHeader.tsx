import { CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogTrigger } from "@/components/ui/dialog";

interface CheckInHeaderProps {
  isEditing: boolean;
  setIsEditing: (value: boolean) => void;
}

export const CheckInHeader = ({ isEditing, setIsEditing }: CheckInHeaderProps) => {
  return (
    <CardHeader>
      <div className="flex justify-between items-center">
        <CardTitle>Daily Check-ins</CardTitle>
        <Dialog open={isEditing} onOpenChange={setIsEditing}>
          <DialogTrigger asChild>
            <Button variant="outline">Configure</Button>
          </DialogTrigger>
        </Dialog>
      </div>
    </CardHeader>
  );
};