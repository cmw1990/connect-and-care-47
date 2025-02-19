
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { WeeklyAvailability } from "./WeeklyAvailability";
import { CaregiverCard } from "../CaregiverCard";
import type { CaregiverProfile, Availability } from "@/types/caregiver";

interface BookingFormData {
  start_time: string;
  end_time: string;
  notes: string;
}

interface BookingDialogProps {
  caregiver: CaregiverProfile;
  availability: Availability[] | null;
  bookingData: BookingFormData;
  onBookingSubmit: () => Promise<void>;
  onBookingDataChange: (data: Partial<BookingFormData>) => void;
}

export function BookingDialog({
  caregiver,
  availability,
  bookingData,
  onBookingSubmit,
  onBookingDataChange,
}: BookingDialogProps) {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <div>
          <CaregiverCard caregiver={caregiver} />
        </div>
      </DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Book Caregiver</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Start Time</Label>
              <Input
                type="datetime-local"
                value={bookingData.start_time}
                onChange={(e) => onBookingDataChange({ start_time: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>End Time</Label>
              <Input
                type="datetime-local"
                value={bookingData.end_time}
                onChange={(e) => onBookingDataChange({ end_time: e.target.value })}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Notes</Label>
            <textarea
              className="w-full min-h-[100px] p-2 border rounded-md"
              value={bookingData.notes}
              onChange={(e) => onBookingDataChange({ notes: e.target.value })}
              placeholder="Add any specific requirements or notes for the caregiver..."
            />
          </div>

          <WeeklyAvailability availability={availability} />

          <Button
            className="w-full"
            onClick={onBookingSubmit}
            disabled={!bookingData.start_time || !bookingData.end_time}
          >
            Request Booking
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
