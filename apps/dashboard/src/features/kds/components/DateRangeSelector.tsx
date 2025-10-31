import React, { useState } from "react";
import { CalendarIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { 
  getToday,
  getYesterday,
  getPastWeek, 
  getPastMonth, 
  getPastYear,
  formatDateDisplay,
  type DateRange 
} from "../../../lib/dateUtils";
import type { DateRangeType } from "../types/kds.types";

interface DateRangeSelectorProps {
  selectedRange: DateRangeType;
  dateFrom: Date;
  dateTo: Date;
  onRangeChange: (type: DateRangeType, from: Date, to: Date) => void;
}

export const DateRangeSelector: React.FC<DateRangeSelectorProps> = ({
  selectedRange,
  dateFrom,
  dateTo,
  onRangeChange,
}) => {
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);

  const handleQuickSelect = (type: DateRangeType) => {
    let range: DateRange;
    
    switch (type) {
      case 'today':
        range = getToday();
        break;
      case 'yesterday':
        range = getYesterday();
        break;
      case 'week':
        range = getPastWeek();
        break;
      case 'month':
        range = getPastMonth();
        break;
      case 'year':
        range = getPastYear();
        break;
      default:
        return;
    }
    
    onRangeChange(type, range.from, range.to);
  };

  const handleCustomDateSelect = (date: Date | undefined) => {
    if (!date) return;
    
    // Set to start of selected day
    const from = new Date(date.getFullYear(), date.getMonth(), date.getDate(), 0, 0, 0, 0);
    // Set to end of selected day
    const to = new Date(date.getFullYear(), date.getMonth(), date.getDate(), 23, 59, 59, 999);
    
    onRangeChange('custom', from, to);
    setIsCalendarOpen(false);
  };

  return (
    <div className="flex items-center gap-2 flex-wrap">
      <div className="flex gap-2">
        <Button
          variant={selectedRange === 'today' ? 'default' : 'outline'}
          size="sm"
          onClick={() => handleQuickSelect('today')}
        >
          Today
        </Button>
        <Button
          variant={selectedRange === 'yesterday' ? 'default' : 'outline'}
          size="sm"
          onClick={() => handleQuickSelect('yesterday')}
        >
          Yesterday
        </Button>
        <Button
          variant={selectedRange === 'week' ? 'default' : 'outline'}
          size="sm"
          onClick={() => handleQuickSelect('week')}
        >
          Past Week
        </Button>
        <Button
          variant={selectedRange === 'month' ? 'default' : 'outline'}
          size="sm"
          onClick={() => handleQuickSelect('month')}
        >
          Past Month
        </Button>
        <Button
          variant={selectedRange === 'year' ? 'default' : 'outline'}
          size="sm"
          onClick={() => handleQuickSelect('year')}
        >
          Past Year
        </Button>
      </div>

      <Popover open={isCalendarOpen} onOpenChange={setIsCalendarOpen}>
        <PopoverTrigger asChild>
          <Button
            variant={selectedRange === 'custom' ? 'default' : 'outline'}
            size="sm"
            className={cn("gap-2")}
          >
            <CalendarIcon className="h-4 w-4" />
            {selectedRange === 'custom' ? formatDateDisplay(dateFrom) : 'Custom Date'}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <Calendar
            mode="single"
            selected={dateFrom}
            onSelect={handleCustomDateSelect}
            disabled={(date) => date > new Date()}
            initialFocus
          />
        </PopoverContent>
      </Popover>
    </div>
  );
};

