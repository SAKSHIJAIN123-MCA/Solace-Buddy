"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { ScrollArea } from "@/components/ui/scroll-area"

interface RoomFormDialogProps {
  open: boolean
  onClose: () => void
  onSubmit: (data: any) => void
  initialData?: any
  mode: "add" | "edit"
  pgId: string
}

export function RoomFormDialog({ open, onClose, onSubmit, initialData, mode, pgId }: RoomFormDialogProps) {
  const [formData, setFormData] = useState({
    roomNumber: "",
    name: "",
    noOfSharing: "",
    acType: "",
    bedSize: "",
    totalBeds: "",
    rent: "",
    bathroomType: "common",
    description: "",
    balcony: false,
  })

  const [errors, setErrors] = useState<Record<string, string>>({})
  const generateDisplayName = (noOfSharing: string, acType: string) => {
    if (noOfSharing && acType) {
      return `${noOfSharing}-Sharing-${acType}`
    }
    return ""
  }

  useEffect(() => {
    if (initialData && mode === "edit") {
      setFormData({
        roomNumber: initialData.roomNumber || "",
        name: initialData.name || "",
        noOfSharing: initialData.noOfSharing?.toString() || "",
        acType: initialData.acType || "",
        bedSize: initialData.bedSize || "",
        totalBeds: initialData.totalBeds?.toString() || "",
        rent: initialData.rent?.toString() || "",
        bathroomType: initialData.bathroomType || "common",
        description: initialData.description || "",
        balcony: initialData.balcony || false,
      })
    } else {
      // Reset form for add mode
      setFormData({
        roomNumber: "",
        name: "",
        noOfSharing: "",
        acType: "",
        bedSize: "",
        totalBeds: "",
        rent: "",
        bathroomType: "common",
        description: "",
        balcony: false,
      })
    }
    setErrors({})
  }, [initialData, mode, open])

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

    if (!formData.noOfSharing) newErrors.noOfSharing = "Number of sharing is required"
    if (!formData.acType) newErrors.acType = "AC type is required"
    if (!formData.bedSize) newErrors.bedSize = "Bed size is required"
    if (!formData.totalBeds || Number.parseInt(formData.totalBeds) < 1) {
      newErrors.totalBeds = "Total beds must be at least 1"
    }
    if (!formData.rent || Number.parseFloat(formData.rent) <= 0) {
      newErrors.rent = "Monthly rent is required and must be greater than 0"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) {
      return
    }

    const displayName = `${formData.noOfSharing}-Sharing-${formData.acType}`

    const submitData = {
      ...formData,
      noOfSharing: Number.parseInt(formData.noOfSharing),
      displayName,
      totalBeds: Number.parseInt(formData.totalBeds),
      rent: Number.parseFloat(formData.rent),
    }

    onSubmit(submitData)
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-hidden">
        <DialogHeader>
          <DialogTitle>{mode === "edit" ? "Edit Room" : "Add New Room"}</DialogTitle>
        </DialogHeader>

        <ScrollArea className="max-h-[calc(90vh-120px)] pr-4">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Basic Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="roomNumber">Room Number</Label>
                <Input
                  id="roomNumber"
                  value={formData.roomNumber}
                  onChange={(e) => handleInputChange("roomNumber", e.target.value)}
                  placeholder="e.g., R101, A-1, etc."
                  className={errors.roomNumber ? "border-red-500" : ""}
                />
                {errors.roomNumber && <p className="text-sm text-red-500">{errors.roomNumber}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="name">Room Name</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => handleInputChange("name", e.target.value)}
                  placeholder="e.g., Deluxe Room, Standard Room"
                  className={errors.name ? "border-red-500" : ""}
                />
                {errors.name && <p className="text-sm text-red-500">{errors.name}</p>}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="noOfSharing">No of Sharing *</Label>
                <Select value={formData.noOfSharing} onValueChange={(value) => handleInputChange("noOfSharing", value)}>
                  <SelectTrigger className={errors.noOfSharing ? "border-red-500" : ""}>
                    <SelectValue placeholder="Select sharing" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">1</SelectItem>
                    <SelectItem value="2">2</SelectItem>
                    <SelectItem value="3">3</SelectItem>
                    <SelectItem value="4">4</SelectItem>
                    <SelectItem value="5">5</SelectItem>
                    <SelectItem value="6">6</SelectItem>
                    <SelectItem value="7">7</SelectItem>
                  </SelectContent>
                </Select>
                {errors.noOfSharing && <p className="text-sm text-red-500">{errors.noOfSharing}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="acType">AC/Non AC *</Label>
                <Select value={formData.acType} onValueChange={(value) => handleInputChange("acType", value)}>
                  <SelectTrigger className={errors.acType ? "border-red-500" : ""}>
                    <SelectValue placeholder="Select AC type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="AC">AC</SelectItem>
                    <SelectItem value="Non AC">Non AC</SelectItem>
                  </SelectContent>
                </Select>
                {errors.acType && <p className="text-sm text-red-500">{errors.acType}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="bedSize">Bed Size *</Label>
                <Select value={formData.bedSize} onValueChange={(value) => handleInputChange("bedSize", value)}>
                  <SelectTrigger className={errors.bedSize ? "border-red-500" : ""}>
                    <SelectValue placeholder="Select bed size" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Single">Single</SelectItem>
                    <SelectItem value="Double">Double</SelectItem>
                    <SelectItem value="Other">Other</SelectItem>
                  </SelectContent>
                </Select>
                {errors.bedSize && <p className="text-sm text-red-500">{errors.bedSize}</p>}
              </div>
            </div>

 {formData.noOfSharing && formData.acType && (
              <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <Label className="text-sm font-medium text-blue-800">Display Name (Auto-generated):</Label>
                <p className="text-blue-900 font-semibold">
                  {generateDisplayName(formData.noOfSharing, formData.acType)}
                </p>
              </div>
            )}

            {/* Beds and Pricing */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="totalBeds">Total Beds *</Label>
                <Input
                  id="totalBeds"
                  type="number"
                  min="1"
                  value={formData.totalBeds}
                  onChange={(e) => handleInputChange("totalBeds", e.target.value)}
                  placeholder="Enter number of beds"
                  className={errors.totalBeds ? "border-red-500" : ""}
                />
                {errors.totalBeds && <p className="text-sm text-red-500">{errors.totalBeds}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="rent">Monthly Rent (₹) *</Label>
                <Input
                  id="rent"
                  type="number"
                  min="0"
                  step="0.01"
                  value={formData.rent}
                  onChange={(e) => handleInputChange("rent", e.target.value)}
                  placeholder="Enter monthly rent"
                  className={errors.rent ? "border-red-500" : ""}
                />
                {errors.rent && <p className="text-sm text-red-500">{errors.rent}</p>}
              </div>
            </div>

            {/* Bathroom Type */}
            <div className="space-y-2">
              <Label htmlFor="bathroomType">Bathroom Type</Label>
              <Select value={formData.bathroomType} onValueChange={(value) => handleInputChange("bathroomType", value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select bathroom type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="attached">Attached</SelectItem>
                  <SelectItem value="common">Common</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Room Features */}
            <div className="space-y-4">
              <Label>Room Features</Label>
              <div className="grid grid-cols-1 gap-4">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="balcony"
                    checked={formData.balcony}
                    onCheckedChange={(checked) => handleInputChange("balcony", checked)}
                  />
                  <Label htmlFor="balcony" className="text-sm font-normal cursor-pointer">
                    Balcony
                  </Label>
                </div>
              </div>
            </div>

            {/* Description */}
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => handleInputChange("description", e.target.value)}
                placeholder="Enter room description (optional)"
                rows={3}
              />
            </div>

            {/* Form Actions */}
            <div className="flex justify-end space-x-4 pt-4 border-t">
              <Button type="button" variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button type="submit" className="bg-black text-white">
                {mode === "edit" ? "Update Room" : "Add Room"}
              </Button>
            </div>
          </form>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  )
}
