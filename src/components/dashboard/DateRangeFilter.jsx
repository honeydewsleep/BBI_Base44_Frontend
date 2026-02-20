import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CalendarDays, ChevronDown } from "lucide-react";
import { format, subDays, subMonths, startOfMonth, endOfMonth, startOfYear } from "date-fns";
import { cn } from "@/lib/utils";
import { useState } from "react";

const PRESETS = [
  { label: "Last 7 days", value: "7d" },
  { label: "Last 30 days", value: "30d" },
  { label: "This month", value: "this_month" },
  { label: "Last 3 months", value: "3m" },
  { label: "This year", value: "this_year" },
  { label: "Custom", value: "custom" }
];

export default function DateRangeFilter({ dateRange, onDateRangeChange }) {
  const [preset, setPreset] = useState("30d");
  const [isOpen, setIsOpen] = useState(false);

  const handlePresetChange = (value) => {
    setPreset(value);
    const today = new Date();
    
    let start, end;
    switch (value) {
      case "7d":
        start = subDays(today, 7);
        end = today;
        break;
      case "30d":
        start = subDays(today, 30);
        end = today;
        break;
      case "this_month":
        start = startOfMonth(today);
        end = endOfMonth(today);
        break;
      case "3m":
        start = subMonths(today, 3);
        end = today;
        break;
      case "this_year":
        start = startOfYear(today);
        end = today;
        break;
      case "custom":
        return;
      default:
        start = subDays(today, 30);
        end = today;
    }
    
    onDateRangeChange({ from: start, to: end });
  };

  return (
    <div className="flex items-center gap-3">
      <Select value={preset} onValueChange={handlePresetChange}>
        <SelectTrigger className="w-44 bg-white border-slate-200 text-slate-700">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {PRESETS.map((p) => (
            <SelectItem key={p.value} value={p.value}>{p.label}</SelectItem>
          ))}
        </SelectContent>
      </Select>

      {preset === "custom" && (
        <Popover open={isOpen} onOpenChange={setIsOpen}>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className={cn(
                "justify-start text-left font-normal bg-white border-slate-200",
                !dateRange && "text-muted-foreground"
              )}
            >
              <CalendarDays className="mr-2 h-4 w-4 text-slate-500" />
              {dateRange?.from ? (
                dateRange.to ? (
                  <>
                    {format(dateRange.from, "MMM d")} - {format(dateRange.to, "MMM d, yyyy")}
                  </>
                ) : (
                  format(dateRange.from, "MMM d, yyyy")
                )
              ) : (
                <span>Pick a date range</span>
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <Calendar
              initialFocus
              mode="range"
              defaultMonth={dateRange?.from}
              selected={dateRange}
              onSelect={(range) => {
                onDateRangeChange(range);
                if (range?.from && range?.to) setIsOpen(false);
              }}
              numberOfMonths={2}
            />
          </PopoverContent>
        </Popover>
      )}
    </div>
  );
}