
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CalendarIcon, Clock } from 'lucide-react';
import { Textarea } from '@/components/ui/textarea';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { toast } from '@/hooks/use-toast';
import { useUser } from '@/lib/hooks/use-user';
import { CaregiverProfile } from '@/types/caregiver';

interface TimeSlot {
  id: string;
  day_of_week: string;  // Change from number to string to fix the TypeScript error
  start_time: string;
  end_time: string;
  recurring: boolean;
}

interface BookingDialogProps {
  caregiver: CaregiverProfile;
  onBookingComplete?: () => void;
  children: React.ReactNode;
}

export const BookingDialog = ({ caregiver, onBookingComplete, children }: BookingDialogProps) => {
  const [open, setOpen] = useState(false);
  const [date, setDate] = useState<Date | undefined>(undefined);
  const [startTime, setStartTime] = useState('09:00');
  const [endTime, setEndTime] = useState('10:00');
  const [notes, setNotes] = useState('');
  const { user } = useUser();
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Availability data would normally be fetched from the server
  // For now, we'll mock it
  const mockAvailability: TimeSlot[] = [
    {
      id: "1",
      day_of_week: "1", // Monday
      start_time: "09:00",
      end_time: "17:00",
      recurring: true
    },
    {
      id: "2",
      day_of_week: "3", // Wednesday
      start_time: "09:00",
      end_time: "17:00",
      recurring: true
    },
    {
      id: "3",
      day_of_week: "5", // Friday
      start_time: "09:00",
      end_time: "14:00",
      recurring: true
    }
  ];

  const handleBooking = async () => {
    if (!date || !startTime || !endTime || !user) {
      toast({
        title: "Missing information",
        description: "Please complete all booking details.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      // In a real application, this would send the booking to your backend
      const bookingData = {
        caregiver_id: caregiver.id,
        user_id: user.id,
        start_time: `${format(date, 'yyyy-MM-dd')}T${startTime}`,
        end_time: `${format(date, 'yyyy-MM-dd')}T${endTime}`,
        notes,
        rate: caregiver.hourly_rate
      };

      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      console.log("Booking submitted:", bookingData);
      
      toast({
        title: "Booking submitted",
        description: `Your booking with ${caregiver.first_name} has been submitted.`,
      });
      
      setOpen(false);
      if (onBookingComplete) onBookingComplete();
    } catch (error) {
      console.error("Booking error:", error);
      toast({
        title: "Booking failed",
        description: "There was an error processing your booking. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Book Caregiver</DialogTitle>
          <DialogDescription>
            Schedule a session with {caregiver.first_name} at ${caregiver.hourly_rate}/hour
          </DialogDescription>
        </DialogHeader>
        
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="date">Date</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  id="date"
                  variant={"outline"}
                  className={cn(
                    "w-full justify-start text-left font-normal",
                    !date && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {date ? format(date, "PPP") : "Select date"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={date}
                  onSelect={setDate}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label htmlFor="startTime">Start Time</Label>
              <div className="flex items-center">
                <Clock className="mr-2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="startTime"
                  type="time"
                  value={startTime}
                  onChange={(e) => setStartTime(e.target.value)}
                />
              </div>
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="endTime">End Time</Label>
              <div className="flex items-center">
                <Clock className="mr-2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="endTime"
                  type="time"
                  value={endTime}
                  onChange={(e) => setEndTime(e.target.value)}
                />
              </div>
            </div>
          </div>
          
          <div className="grid gap-2">
            <Label htmlFor="notes">Special Instructions or Notes</Label>
            <Textarea
              id="notes"
              placeholder="Add any special requests or information..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />
          </div>
        </div>
        
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button onClick={handleBooking} disabled={!date || !startTime || !endTime || isSubmitting}>
            {isSubmitting ? "Submitting..." : "Book Session"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
