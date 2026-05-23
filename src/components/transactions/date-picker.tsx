"use client"

import { useState, useCallback } from "react"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { format } from "date-fns"
import { CalendarIcon, ChevronLeft, ChevronRight } from "lucide-react"

interface DatePickerProps {
  value: string
  onChange: (value: string) => void
}

export function DatePicker({ value, onChange }: DatePickerProps) {
  const [open, setOpen] = useState(false)
  const [viewMonth, setViewMonth] = useState(() => {
    const d = value ? new Date(value) : new Date()
    return new Date(d.getFullYear(), d.getMonth(), 1)
  })

  const selectedDate = value ? new Date(value) : undefined

  const daysInMonth = new Date(viewMonth.getFullYear(), viewMonth.getMonth() + 1, 0).getDate()
  const firstDayOfWeek = new Date(viewMonth.getFullYear(), viewMonth.getMonth(), 1).getDay()

  const handlePrevMonth = () => {
    setViewMonth(new Date(viewMonth.getFullYear(), viewMonth.getMonth() - 1, 1))
  }
  const handleNextMonth = () => {
    setViewMonth(new Date(viewMonth.getFullYear(), viewMonth.getMonth() + 1, 1))
  }

  const handleSelect = (day: number) => {
    const d = new Date(viewMonth.getFullYear(), viewMonth.getMonth(), day)
    onChange(d.toISOString())
    setOpen(false)
  }

  const isSelected = (day: number) => {
    if (!selectedDate) return false
    return (
      selectedDate.getDate() === day &&
      selectedDate.getMonth() === viewMonth.getMonth() &&
      selectedDate.getFullYear() === viewMonth.getFullYear()
    )
  }

  const isToday = (day: number) => {
    const today = new Date()
    return (
      today.getDate() === day &&
      today.getMonth() === viewMonth.getMonth() &&
      today.getFullYear() === viewMonth.getFullYear()
    )
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className={cn("w-full justify-start text-left font-normal h-12", !value && "text-muted-foreground")}
        >
          <CalendarIcon className="mr-2 h-4 w-4" />
          {value ? format(new Date(value), "MMM d, yyyy") : "Pick a date"}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <div className="p-3">
          <div className="flex items-center justify-between mb-4">
            <Button variant="ghost" size="icon-sm" onClick={handlePrevMonth}>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <div className="font-medium text-sm">
              {format(viewMonth, "MMMM yyyy")}
            </div>
            <Button variant="ghost" size="icon-sm" onClick={handleNextMonth}>
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
          <div className="grid grid-cols-7 gap-1">
            {["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"].map((day) => (
              <div key={day} className="text-center text-xs text-muted-foreground font-medium py-1">
                {day}
              </div>
            ))}
            {Array.from({ length: firstDayOfWeek }).map((_, i) => (
              <div key={`empty-${i}`} />
            ))}
            {Array.from({ length: daysInMonth }).map((_, i) => {
              const day = i + 1
              return (
                <button
                  key={day}
                  onClick={() => handleSelect(day)}
                  className={cn(
                    "h-9 w-9 rounded-lg text-sm transition-all hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                    isToday(day) && "border border-primary font-semibold",
                    isSelected(day) && "bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground font-semibold shadow-sm"
                  )}
                >
                  {day}
                </button>
              )
            })}
          </div>
        </div>
        <div className="border-t border-border p-2 flex justify-center">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              onChange(new Date().toISOString())
              setOpen(false)
            }}
          >
            Today
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  )
}
