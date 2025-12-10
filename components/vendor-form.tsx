"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { useToast } from "@/hooks/use-toast"
import { Loader2, Building2, Mail, Phone, User, MapPin } from "lucide-react"

interface VendorFormProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
  vendor?: any
  mode: "add" | "edit"
}

export function VendorForm({ isOpen, onClose, onSuccess, vendor, mode }: VendorFormProps) {
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    name: "",
    ownerName: "",
    email: "",
    phone: "",
    businessType: "PG",
    address: "",
    city: "",
    state: "",
    pincode: "",
    gstNumber: "",
    panNumber: "",
  })
  const [formErrors, setFormErrors] = useState<{ [key: string]: string }>({})

  useEffect(() => {
    if (vendor && mode === "edit") {
      setFormData({
        name: vendor.name || "",
        ownerName: vendor.ownerName || "",
        email: vendor.email || "",
        phone: vendor.phone || "",
        businessType: vendor.businessType || "PG",
        address: vendor.address || "",
        city: vendor.city || "",
        state: vendor.state || "",
        pincode: vendor.pincode || "",
        gstNumber: vendor.gstNumber || "",
        panNumber: vendor.panNumber || "",
      })
    } else {
      setFormData({
        name: "",
        ownerName: "",
        email: "",
        phone: "",
        businessType: "PG",
        address: "",
        city: "",
        state: "",
        pincode: "",
        gstNumber: "",
        panNumber: "",
      })
    }
    setFormErrors({})
  }, [vendor, mode, isOpen])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setFormErrors({})

    try {
      const url = mode === "add" ? "/api/vendors" : `/api/vendors/${vendor._id}`
      const method = mode === "add" ? "POST" : "PUT"

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      })

      const result = await response.json()

      if (result.success) {
        toast({
          title: "Success",
          description: result.message || `Vendor ${mode === "add" ? "added" : "updated"} successfully`,
        })
        onSuccess()
        onClose()
      } else {
        if (result.errors) {
          setFormErrors(result.errors)
        }
        toast({
          title: "Error",
          description: result.error || "Something went wrong. Please try again.",
          variant: "destructive",
        })
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Something went wrong. Please try again.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
    if (formErrors[field]) {
      setFormErrors((prev) => {
        const newErrors = { ...prev }
        delete newErrors[field]
        return newErrors
      })
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{mode === "add" ? "Add New Vendor" : "Edit Vendor"}</DialogTitle>
          <DialogDescription>
            {mode === "add"
              ? "Fill in the vendor details to add them to the system."
              : "Update the vendor information below."}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Business Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-gray-900">Business Information</h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Business Name *</Label>
                <div className="relative">
                  <Building2 className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => handleChange("name", e.target.value)}
                    placeholder="Enter business name"
                    className="pl-10"
                    required
                  />
                </div>
                {formErrors.name && <p className="text-red-500 text-sm mt-1">{formErrors.name}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="ownerName">Owner Name *</Label>
                <div className="relative">
                  <User className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    id="ownerName"
                    value={formData.ownerName}
                    onChange={(e) => handleChange("ownerName", e.target.value)}
                    placeholder="Enter owner name"
                    className="pl-10"
                    required
                  />
                </div>
                {formErrors.ownerName && <p className="text-red-500 text-sm mt-1">{formErrors.ownerName}</p>}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email Address *</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleChange("email", e.target.value)}
                    placeholder="Enter email address"
                    className="pl-10"
                    required
                  />
                </div>
                {formErrors.email && <p className="text-red-500 text-sm mt-1">{formErrors.email}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone">Phone Number *</Label>
                <div className="relative">
                  <Phone className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    id="phone"
                    value={formData.phone}
                    onChange={(e) => handleChange("phone", e.target.value)}
                    placeholder="+91 9876543210"
                    className="pl-10"
                    required
                  />
                </div>
                {formErrors.phone && <p className="text-red-500 text-sm mt-1">{formErrors.phone}</p>}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="businessType">Business Type *</Label>
              <Select value={formData.businessType} onValueChange={(value) => handleChange("businessType", value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select business type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Hostel">Hostel</SelectItem>
                  <SelectItem value="PG">PG</SelectItem>
                  <SelectItem value="Both">Both</SelectItem>
                </SelectContent>
              </Select>
              {formErrors.businessType && <p className="text-red-500 text-sm mt-1">{formErrors.businessType}</p>}
            </div>
          </div>

          {/* Location Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-gray-900">Location Information</h3>

            <div className="space-y-2">
              <Label htmlFor="address">Business Address</Label>
              <div className="relative">
                <MapPin className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Textarea
                  id="address"
                  value={formData.address}
                  onChange={(e) => handleChange("address", e.target.value)}
                  placeholder="Enter complete business address"
                  className="pl-10"
                  rows={3}
                />
              </div>
              {formErrors.address && <p className="text-red-500 text-sm mt-1">{formErrors.address}</p>}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="city">City</Label>
                <Input
                  id="city"
                  value={formData.city}
                  onChange={(e) => handleChange("city", e.target.value)}
                  placeholder="Enter city"
                />
                {formErrors.city && <p className="text-red-500 text-sm mt-1">{formErrors.city}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="state">State</Label>
                <Input
                  id="state"
                  value={formData.state}
                  onChange={(e) => handleChange("state", e.target.value)}
                  placeholder="Enter state"
                />
                {formErrors.state && <p className="text-red-500 text-sm mt-1">{formErrors.state}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="pincode">Pincode</Label>
                <Input
                  id="pincode"
                  value={formData.pincode}
                  onChange={(e) => handleChange("pincode", e.target.value)}
                  placeholder="Enter pincode"
                />
                {formErrors.pincode && <p className="text-red-500 text-sm mt-1">{formErrors.pincode}</p>}
              </div>
            </div>
          </div>

          {/* Business Documents */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-gray-900">Business Documents (Optional)</h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="gstNumber">GST Number</Label>
                <Input
                  id="gstNumber"
                  value={formData.gstNumber}
                  onChange={(e) => handleChange("gstNumber", e.target.value.toUpperCase())}
                  placeholder="27ABCDE1234F1Z5"
                />
                {formErrors.gstNumber && <p className="text-red-500 text-sm mt-1">{formErrors.gstNumber}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="panNumber">PAN Number</Label>
                <Input
                  id="panNumber"
                  value={formData.panNumber}
                  onChange={(e) => handleChange("panNumber", e.target.value.toUpperCase())}
                  placeholder="ABCDE1234F"
                />
                {formErrors.panNumber && <p className="text-red-500 text-sm mt-1">{formErrors.panNumber}</p>}
              </div>
            </div>
          </div>

          <div className="flex justify-end space-x-2 pt-6">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {mode === "add" ? "Add Vendor" : "Update Vendor"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
