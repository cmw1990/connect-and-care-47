import React, { useState } from "react";
import { format, startOfWeek, endOfWeek, eachDayOfInterval, addWeeks, subWeeks } from "date-fns";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface MiniCalendarProps {
  onDateSelect?: (date: Date) => void;
}

export const MiniCalendar = ({ onDateSelect }: MiniCalendarProps) => {
  const [currentDate, setCurrentDate] = useState<Date>(new Date());
  
  const weekStart = startOfWeek(currentDate);
  const weekEnd = endOfWeek(currentDate);
  const weekDays = eachDayOfInterval({ start: weekStart, end: weekEnd });

  const handlePreviousWeek = () => {
    setCurrentDate(subWeeks(currentDate, 1));
  };

  const handleNextWeek = () => {
    setCurrentDate(addWeeks(currentDate, 1));
  };

  const handleDateClick = (date: Date) => {
    if (onDateSelect) {
      onDateSelect(date);
    }
  };

  return (
    <div className="flex items-center justify-between p-2 bg-white border-b">
      <Button variant="ghost" size="icon" onClick={handlePreviousWeek}>
        <ChevronLeft className="h-4 w-4" />
      </Button>
      <div className="flex-1 overflow-x-auto">
        <div className="flex justify-between min-w-full px-2">
          {weekDays.map((day, index) => (
            <button
              key={index}
              onClick={() => handleDateClick(day)}
              className={`flex flex-col items-center p-1 rounded-lg ${
                format(day, 'yyyy-MM-dd') === format(new Date(), 'yyyy-MM-dd')
                  ? 'bg-primary/10 text-primary'
                  : ''
              }`}
            >
              <span className="text-xs font-medium">{format(day, 'EEE')}</span>
              <span className="text-sm">{format(day, 'd')}</span>
            </button>
          ))}
        </div>
      </div>
      <Button variant="ghost" size="icon" onClick={handleNextWeek}>
        <ChevronRight className="h-4 w-4" />
      </Button>
    </div>
  );
};