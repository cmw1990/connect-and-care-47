import { useState } from "react";
import { Calendar } from "@/components/ui/calendar";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { PlusCircle, Users, Clock, CalendarDays } from "lucide-react";
import { useTranslation } from "react-i18next";

interface CareEvent {
  id: string;
  title: string;
  start: Date;
  end: Date;
  type: "medication" | "appointment" | "task";
  assignedTo?: string[];
}

export function CareCalendar() {
  const { t } = useTranslation();
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [view, setView] = useState<"day" | "week" | "month">("week");

  // Sample data - will be replaced with real data from Supabase
  const sampleEvents: CareEvent[] = [
    {
      id: "1",
      title: "Morning Medication",
      start: new Date(),
      end: new Date(),
      type: "medication",
      assignedTo: ["caregiver1"],
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-semibold tracking-tight">
          {t('care.calendar')}
        </h2>
        <div className="flex items-center gap-4">
          <Select value={view} onValueChange={(v: "day" | "week" | "month") => setView(v)}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder={t('care.selectView')} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="day">{t('care.dayView')}</SelectItem>
              <SelectItem value="week">{t('care.weekView')}</SelectItem>
              <SelectItem value="month">{t('care.monthView')}</SelectItem>
            </SelectContent>
          </Select>

          <Dialog>
            <DialogTrigger asChild>
              <Button>
                <PlusCircle className="mr-2 h-4 w-4" />
                {t('care.addEvent')}
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>{t('care.addNewEvent')}</DialogTitle>
                <DialogDescription>
                  {t('care.addEventDescription')}
                </DialogDescription>
              </DialogHeader>
              {/* Add event form will go here */}
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="grid grid-cols-12 gap-6">
        <div className="col-span-9">
          <Card className="p-6">
            <Calendar
              mode="single"
              selected={date}
              onSelect={setDate}
              className="rounded-md border"
            />
          </Card>
        </div>

        <div className="col-span-3 space-y-4">
          <Card className="p-4">
            <h3 className="font-medium mb-2">{t('care.upcomingEvents')}</h3>
            <div className="space-y-3">
              {sampleEvents.map((event) => (
                <div key={event.id} className="flex items-start space-x-3 p-2 hover:bg-accent rounded-lg cursor-pointer">
                  {event.type === "medication" && (
                    <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                      <Clock className="h-4 w-4 text-blue-600" />
                    </div>
                  )}
                  <div>
                    <div className="font-medium">{event.title}</div>
                    <div className="text-sm text-muted-foreground">
                      {event.start.toLocaleTimeString()}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </Card>

          <Card className="p-4">
            <h3 className="font-medium mb-2">{t('care.assignedCaregivers')}</h3>
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                  <Users className="h-4 w-4 text-primary" />
                </div>
                <div>
                  <div className="font-medium">Sarah Johnson</div>
                  <div className="text-sm text-muted-foreground">Primary Caregiver</div>
                </div>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
