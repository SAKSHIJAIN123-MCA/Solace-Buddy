"use client"

import * as React from "react"
import { Button } from "@/components/ui/button"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Calendar, ChevronLeft, ChevronRight } from "lucide-react"
import { cn } from "@/lib/utils"

interface DatePickerProps {
  value: string
  onChange: (date: string) => void
  min?: string
  id?: string
  name?: string
  required?: boolean
}

export function DatePicker({ value, onChange, min, id, name, required }: DatePickerProps) {
  const [isOpen, setIsOpen] = React.useState(false)
  const [currentMonth, setCurrentMonth] = React.useState(() => {
    if (value) {
      const date = new Date(value)
      return new Date(date.getFullYear(), date.getMonth(), 1)
    }
    return new Date(new Date().getFullYear(), new Date().getMonth(), 1)
  })

  const minDate = min ? new Date(min) : null
  const selectedDate = value ? new Date(value) : null

  const getDaysInMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate()
  }

  const getFirstDayOfMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth(), 1).getDay()
  }

  const handlePrevMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1))
  }

  const handleNextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1))
  }

  const handleDateClick = (day: number) => {
    const newDate = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day)
    const dateString = newDate.toISOString().split("T")[0]
    onChange(dateString)
    setIsOpen(false)
  }

  const formatDate = (dateString: string) => {
    if (!dateString) return "Select date"
    const date = new Date(dateString)
    return date.toLocaleDateString("en-IN", {
      year: "numeric",
      month: "short",
      day: "numeric",
    })
  }

  const isDateDisabled = (day: number) => {
    const date = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day)
    const dateString = date.toISOString().split("T")[0]

    if (minDate) {
      const minDateString = minDate.toISOString().split("T")[0]
      return dateString < minDateString
    }
    return false
  }

  const isDateSelected = (day: number) => {
    if (!selectedDate) return false
    return (
      day === selectedDate.getDate() &&
      currentMonth.getMonth() === selectedDate.getMonth() &&
      currentMonth.getFullYear() === selectedDate.getFullYear()
    )
  }

  const daysInMonth = getDaysInMonth(currentMonth)
  const firstDay = getFirstDayOfMonth(currentMonth)
  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1)
  const emptyDays = Array.from({ length: firstDay }, (_, i) => i)

  const monthName = currentMonth.toLocaleDateString("en-IN", {
    month: "long",
    year: "numeric",
  })

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button
          id={id}
          variant="outline"
          className="w-full justify-start text-left font-normal bg-transparent"
          type="button"
        >
          <Calendar className="mr-2 h-4 w-4" />
          {formatDate(value)}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <div className="p-3 space-y-4">
          {/* Month/Year Header */}
          <div className="flex items-center justify-between">
            <Button variant="outline" size="sm" onClick={handlePrevMonth} className="h-7 w-7 p-0 bg-transparent">
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <div className="text-sm font-semibold min-w-40 text-center">{monthName}</div>
            <Button variant="outline" size="sm" onClick={handleNextMonth} className="h-7 w-7 p-0 bg-transparent">
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>

          {/* Calendar Grid */}
          <div className="grid grid-cols-7 gap-2">
            {/* Day Headers */}
            {["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"].map((day) => (
              <div key={day} className="text-xs font-semibold text-center w-8 h-8">
                {day}
              </div>
            ))}

            {/* Empty Days */}
            {emptyDays.map((_, index) => (
              <div key={`empty-${index}`} className="w-8 h-8" />
            ))}

            {/* Days */}
            {days.map((day) => {
              const disabled = isDateDisabled(day)
              const selected = isDateSelected(day)

              return (
                <Button
                  key={day}
                  variant={selected ? "default" : "ghost"}
                  size="sm"
                  className={cn(
                    "h-8 w-8 p-0 text-sm",
                    disabled && "opacity-50 cursor-not-allowed hover:bg-transparent",
                    selected && "bg-purple-600 hover:bg-purple-700 text-white",
                  )}
                  onClick={() => !disabled && handleDateClick(day)}
                  disabled={disabled}
                  type="button"
                >
                  {day}
                </Button>
              )
            })}
          </div>
        </div>
      </PopoverContent>
    </Popover>
  )
}
