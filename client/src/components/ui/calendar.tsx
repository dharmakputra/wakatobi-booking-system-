import * as React from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { DayPicker } from "react-day-picker"

import { cn } from "@/lib/utils"
import { buttonVariants } from "@/components/ui/button"
import { isMonday, isFriday } from "date-fns"

export type CalendarProps = React.ComponentProps<typeof DayPicker> & {
  disabledDays?: Date[] | ((date: Date) => boolean)
  onlyMonFri?: boolean
}

function Calendar({
  className,
  classNames,
  showOutsideDays = true,
  disabledDays,
  onlyMonFri = false,
  ...props
}: CalendarProps) {
  // Function to check if a date is Monday or Friday
  const isMonFri = (date: Date) => {
    const day = date.getDay()
    return day === 1 || day === 5 // 1 is Monday, 5 is Friday
  }

  // Combine the onlyMonFri restriction with any other disabled days
  const combinedDisabledDays = React.useCallback(
    (date: Date) => {
      if (onlyMonFri && !isMonFri(date)) {
        return true
      }

      if (typeof disabledDays === 'function') {
        return disabledDays(date)
      }

      if (Array.isArray(disabledDays)) {
        return disabledDays.some(disabledDate => 
          disabledDate.getFullYear() === date.getFullYear() &&
          disabledDate.getMonth() === date.getMonth() &&
          disabledDate.getDate() === date.getDate()
        )
      }

      return false
    },
    [disabledDays, onlyMonFri]
  )

  return (
    <DayPicker
      showOutsideDays={showOutsideDays}
      className={cn("p-3", className)}
      classNames={{
        months: "flex flex-col sm:flex-row space-y-4 sm:space-x-4 sm:space-y-0",
        month: "space-y-4",
        caption: "flex justify-center pt-1 relative items-center",
        caption_label: "text-sm font-medium",
        nav: "space-x-1 flex items-center",
        nav_button: cn(
          buttonVariants({ variant: "outline" }),
          "h-7 w-7 bg-transparent p-0 opacity-50 hover:opacity-100"
        ),
        nav_button_previous: "absolute left-1",
        nav_button_next: "absolute right-1",
        table: "w-full border-collapse space-y-1",
        head_row: "flex",
        head_cell:
          "text-muted-foreground rounded-md w-9 font-normal text-[0.8rem]",
        row: "flex w-full mt-2",
        cell: "h-9 w-9 text-center text-sm p-0 relative [&:has([aria-selected])]:bg-accent first:[&:has([aria-selected])]:rounded-l-md last:[&:has([aria-selected])]:rounded-r-md focus-within:relative focus-within:z-20",
        day: cn(
          buttonVariants({ variant: "ghost" }),
          "h-9 w-9 p-0 font-normal aria-selected:opacity-100"
        ),
        day_selected:
          "bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground focus:bg-primary focus:text-primary-foreground",
        day_today: "bg-accent text-accent-foreground",
        day_outside: "text-muted-foreground opacity-50",
        day_disabled: "text-muted-foreground opacity-50 line-through",
        day_range_middle:
          "aria-selected:bg-accent aria-selected:text-accent-foreground",
        day_hidden: "invisible",
        ...classNames,
      }}
      components={{
        IconLeft: ({ ...props }) => <ChevronLeft className="h-4 w-4" />,
        IconRight: ({ ...props }) => <ChevronRight className="h-4 w-4" />,
      }}
      modifiers={{
        // Add a special highlight for Monday and Friday dates
        monFri: (date) => isMonday(date) || isFriday(date)
      }}
      modifiersClassNames={{
        monFri: "border-2 border-wakatobi-secondary font-semibold"
      }}
      disabled={combinedDisabledDays}
      {...props}
    />
  )
}
Calendar.displayName = "Calendar"

export { Calendar }
