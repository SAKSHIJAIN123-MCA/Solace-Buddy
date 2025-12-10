"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { CalendarIcon } from "lucide-react"
import { format } from "date-fns"
import { cn } from "@/lib/utils"

interface BedManagementDialogProps {
  open: boolean
  onClose: () => void
  onSubmit: (data: any) => void
  bed: any
  roomRent: number
  bedNumber: number
}

export function BedManagementDialog({ open, onClose, onSubmit, bed, roomRent, bedNumber }: BedManagementDialogProps) {
  const [formData, setFormData] = useState({
    status: "",
    checkInDate: null as Date | null, // For onbook status
    checkOutDate: null as Date | null, // For notice status
  })

  const [errors, setErrors] = useState<Record<string, string>>({})

  useEffect(() => {
    if (bed && open) {
      setFormData({
        status: bed.status || "available",
        checkInDate: bed.bookingDate ? new Date(bed.bookingDate) : null,
        checkOutDate: bed.noticeDate ? new Date(bed.noticeDate) : null,
      })
    }
    setErrors({})
  }, [bed, open])

  const handleInputChange = (field: string, value: any) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }))

    // Clear error when user starts typing
    if (errors[field]) {
      setErrors((prev) => ({
        ...prev,
        [field]: "",
      }))
    }
  }

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (!formData.status) {
      newErrors.status = "Bed status is required"
    }

    if (formData.status === "onbook" && !formData.checkInDate) {
      newErrors.checkInDate = "Check-in date is required for booked beds"
    }

    if (formData.status === "notice" && !formData.checkOutDate) {
      newErrors.checkOutDate = "Check-out date is required for beds on notice"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) {
      return
    }

    const submitData = {
      status: formData.status,
      bookingDate: formData.status === "onbook" ? formData.checkInDate : undefined,
      noticeDate: formData.status === "notice" ? formData.checkOutDate : undefined,
    }

    onSubmit(submitData)
  }

  const getBedStatusColor = (status: string) => {
    switch (status) {
      case "occupied":
        return "text-red-600"
      case "available":
        return "text-green-600"
      case "onbook":
        return "text-blue-600"
      case "notice":
        return "text-yellow-600"
      case "maintenance":
        return "text-gray-600"
      default:
        return "text-gray-400"
    }
  }

  const getBedStatusBackground = (status: string) => {
    switch (status) {
      case "occupied":
        return "bg-red-50 border border-red-200"
      case "available":
        return "bg-green-50 border border-green-200"
      case "onbook":
        return "bg-blue-50 border border-blue-200"
      case "notice":
        return "bg-yellow-50 border border-yellow-200"
      case "maintenance":
        return "bg-gray-50 border border-gray-200"
      default:
        return "bg-gray-50 border border-gray-200"
    }
  }

  const getBedStatusText = (status: string) => {
    switch (status) {
      case "occupied":
        return "Occupied"
      case "available":
        return "Available"
      case "onbook":
        return "On Book"
      case "notice":
        return "On Notice"
      case "maintenance":
        return "Maintenance"
      default:
        return "Unknown"
    }
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <span>Manage Bed {bedNumber}</span>
            <span
              className={`text-sm font-normal px-2 py-1 rounded-md ${getBedStatusColor(bed?.status)} ${getBedStatusBackground(bed?.status)}`}
            >
              ({getBedStatusText(bed?.status)})
            </span>
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Bed Status */}
          <div className="space-y-2">
            <Label htmlFor="status">Bed Status *</Label>
            <Select value={formData.status} onValueChange={(value) => handleInputChange("status", value)}>
              <SelectTrigger className={errors.status ? "border-red-500" : ""}>
                <SelectValue placeholder="Select bed status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="available">Available</SelectItem>
                <SelectItem value="occupied">Occupied</SelectItem>
                <SelectItem value="onbook">On Book</SelectItem>
                <SelectItem value="notice">On Notice</SelectItem>
                <SelectItem value="maintenance">Maintenance</SelectItem>
              </SelectContent>
            </Select>
            {errors.status && <p className="text-sm text-red-500">{errors.status}</p>}
          </div>

          {/* Check-in Date - Show only for onbook */}
          {formData.status === "onbook" && (
            <div className="space-y-2">
              <Label>Check-in Date *</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !formData.checkInDate && "text-muted-foreground",
                      errors.checkInDate && "border-red-500",
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {formData.checkInDate ? format(formData.checkInDate, "PPP") : "Select check-in date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={formData.checkInDate}
                    onSelect={(date) => handleInputChange("checkInDate", date)}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
              {errors.checkInDate && <p className="text-sm text-red-500">{errors.checkInDate}</p>}
            </div>
          )}

          {/* Check-out Date - Show only for notice */}
          {formData.status === "notice" && (
            <div className="space-y-2">
              <Label>Check-out Date *</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !formData.checkOutDate && "text-muted-foreground",
                      errors.checkOutDate && "border-red-500",
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {formData.checkOutDate ? format(formData.checkOutDate, "PPP") : "Select check-out date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={formData.checkOutDate}
                    onSelect={(date) => handleInputChange("checkOutDate", date)}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
              {errors.checkOutDate && <p className="text-sm text-red-500">{errors.checkOutDate}</p>}
            </div>
          )}

          {/* Room Rent Info */}
          <div className="p-3 bg-gray-50 rounded-lg">
            <div className="text-sm text-gray-600">
              <strong>Room Rent:</strong> ₹{roomRent.toLocaleString()}/month
            </div>
          </div>

          {/* Form Actions */}
          <div className="flex justify-end space-x-4 pt-4 border-t">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" className="bg-black text-white">
              Update Bed
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
