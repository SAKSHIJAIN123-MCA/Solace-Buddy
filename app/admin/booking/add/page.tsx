"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { useRouter } from "next/navigation"
import { ArrowLeft, Calendar, CreditCard, User, Building2, AlertCircle } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { toast } from "react-toastify"

export default function EditBookingPage() {
  const [loading, setLoading] = useState(false)
  const [initialLoading, setInitialLoading] = useState(true)
  const [students, setStudents] = useState([])
  const [properties, setProperties] = useState([])
  const [rooms, setRooms] = useState([])
  const [beds, setBeds] = useState([])
  const [selectedProperty, setSelectedProperty] = useState<any>(null)
  const [selectedRoom, setSelectedRoom] = useState<any>(null)
  const [errors, setErrors] = useState<any>({})
  const [formData, setFormData] = useState({
    student: "",
    property: "",
    room: "",
    bed: "",
    checkInDate: "",
    totalAmount: "",
    advanceAmount: "",
    paymentMethod: "",
    paymentScreenshot: "",
    paymentStatus: "Pending",
    bookingStatus: "pending",
    bookingSource: "admin",
    specialRequests: "",
    notes: "",
  })
  const [uploading, setUploading] = useState(false)
  const [paymentFile, setPaymentFile] = useState<File | null>(null)
  const router = useRouter()

  useEffect(() => {
    setInitialLoading(false)
    fetchStudents()
    fetchProperties()
  }, [])

  const fetchStudents = async () => {
    try {
      const response = await fetch("/api/students?limit=1000")
      const result = await response.json()
      if (result.success) {
        setStudents(result.data)
      }
    } catch (error) {
      console.error("Error fetching students:", error)
    }
  }

  const fetchProperties = async () => {
    try {
      const response = await fetch("/api/booking/properties")
      const result = await response.json()
      if (result.success) {
        setProperties(result.data)
      }
    } catch (error) {
      console.error("Error fetching properties:", error)
    }
  }

  const fetchRooms = async (propertyId: string) => {
    try {
      const response = await fetch(`/api/booking/properties/${propertyId}/rooms`)
      const result = await response.json()
      if (result.success) {
        setRooms(result.data)
        return result.data
      } else {
        setRooms([])
        return []
      }
    } catch (error) {
      console.error("Error fetching rooms:", error)
      setRooms([])
      return []
    }
  }

  const fetchBeds = async (propertyId: string, roomId: string) => {
    try {
      const response = await fetch(`/api/booking/properties/${propertyId}/rooms/${roomId}/beds`)
      const result = await response.json()
      if (result.success) {
        setBeds(result.data.beds)
        setSelectedRoom(result.data.room)
        return result.data.beds
      } else {
        setBeds([])
        setSelectedRoom(null)
        return []
      }
    } catch (error) {
      console.error("Error fetching beds:", error)
      setBeds([])
      setSelectedRoom(null)
      return []
    }
  }

  const handlePropertyChange = async (propertyId: string) => {
    const property = properties.find((p: any) => p._id === propertyId)
    setSelectedProperty(property)
    setFormData((prev) => ({
      ...prev,
      property: propertyId,
      room: "",
      bed: "",
      totalAmount: property ? property.price.toString() : prev.totalAmount,
    }))
    setRooms([])
    setBeds([])
    setSelectedRoom(null)
    setErrors((prev: any) => ({ ...prev, property: "", room: "", bed: "" }))

    if (propertyId) {
      await fetchRooms(propertyId)
    }
  }

  const handleRoomChange = async (roomId: string) => {
    const room = rooms.find((r: any) => r._id === roomId)
    setFormData((prev) => ({
      ...prev,
      room: roomId,
      bed: "",
      totalAmount: room ? room.rent.toString() : prev.totalAmount,
    }))
    setBeds([])
    setErrors((prev: any) => ({ ...prev, room: "", bed: "" }))

    if (roomId && formData.property) {
      await fetchBeds(formData.property, roomId)
    }
  }

  const handleBedChange = (bedId: string) => {
    setFormData((prev) => ({
      ...prev,
      bed: bedId,
    }))
    setErrors((prev: any) => ({ ...prev, bed: "" }))
  }

  const validateForm = () => {
    const newErrors: any = {}

    if (!formData.student) newErrors.student = "Please select a student"
    if (!formData.property) newErrors.property = "Please select a property"
    if (!formData.room) newErrors.room = "Please select a room"
    if (!formData.bed) newErrors.bed = "Please select a bed"
    if (!formData.checkInDate) newErrors.checkInDate = "Please select check-in date"
    if (!formData.totalAmount) newErrors.totalAmount = "Please enter total amount"
    if (!formData.advanceAmount) newErrors.advanceAmount = "Please enter advance amount"
    if (!formData.paymentMethod) newErrors.paymentMethod = "Please select payment method"

    // Validate amounts
    if (formData.totalAmount && formData.advanceAmount) {
      const total = Number.parseFloat(formData.totalAmount)
      const advance = Number.parseFloat(formData.advanceAmount)
      if (advance > total) {
        newErrors.advanceAmount = "Advance amount cannot be greater than total amount"
      }
      if (total <= 0) {
        newErrors.totalAmount = "Total amount must be greater than 0"
      }
      if (advance < 0) {
        newErrors.advanceAmount = "Advance amount cannot be negative"
      }
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) {
      toast({
        title: "Validation Error",
        description: "Please fix the errors in the form",
        variant: "destructive",
      })
      return
    }

    setLoading(true)

    try {
      const totalAmount = Number.parseFloat(formData.totalAmount)
      const advanceAmount = Number.parseFloat(formData.advanceAmount)
      const remainingAmount = totalAmount - advanceAmount

      const createData = {
        ...formData,
        totalAmount,
        advanceAmount,
        remainingAmount,
      }

      console.log("[v0] Submitting new booking:", createData)

      const response = await fetch(`/api/booking`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(createData),
      })

      const result = await response.json()
      console.log("[v0] Create booking result:", result)

      if (result.success) {
        toast({ title: "Success", description: "Booking created successfully" })
        router.push("/admin/booking")
      } else {
        toast({
          title: "Error",
          description: result.error || "Failed to create booking",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("[v0] Error creating booking:", error)
      toast({
        title: "Error",
        description: "Failed to create booking",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }))
    if (errors[field]) {
      setErrors((prev: any) => ({ ...prev, [field]: "" }))
    }
  }

  const calculateRemainingAmount = () => {
    const total = Number.parseFloat(formData.totalAmount) || 0
    const advance = Number.parseFloat(formData.advanceAmount) || 0
    return total - advance
  }

  const getBedStatusBadge = (status: string) => {
    const variants: any = {
      available: "default",
      occupied: "destructive",
      onbook: "secondary",
      notice: "outline",
      maintenance: "secondary",
    }
    const colors: any = {
      available: "text-green-600",
      occupied: "text-red-600",
      onbook: "text-blue-600",
      notice: "text-orange-600",
      maintenance: "text-gray-600",
    }
    return (
      <Badge variant={variants[status] || "secondary"} className={colors[status]}>
        {status === "onbook" ? "On Book" : status === "notice" ? "On Notice" : status}
      </Badge>
    )
  }

  async function handleUploadPayment() {
    if (!paymentFile) return
    try {
      setUploading(true)
      const fd = new FormData()
      fd.append("file", paymentFile)
      const res = await fetch("/api/upload", { method: "POST", body: fd })
      const json = await res.json()
      if (json?.url) {
        handleInputChange("paymentScreenshot", json.url)
      }
    } finally {
      setUploading(false)
    }
  }

  if (initialLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900"></div>
          <p className="mt-4">Loading booking details...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-4">
        <Button variant="outline" size="sm" onClick={() => router.back()}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Add Booking</h1>
          <p className="text-muted-foreground">Create a new booking</p>
        </div>
      </div>

      {Object.keys(errors).length > 0 && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Please fix the following errors:
            <ul className="list-disc list-inside mt-2">
              {Object.values(errors).map((error: any, index) => (
                <li key={index}>{error}</li>
              ))}
            </ul>
          </AlertDescription>
        </Alert>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid gap-6 md:grid-cols-2">
          {/* Student Details */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <User className="h-5 w-5 mr-2" />
                Student Details
              </CardTitle>
              <CardDescription>Select the student for this booking</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="student">Student *</Label>
                <Select value={formData.student} onValueChange={(value) => handleInputChange("student", value)}>
                  <SelectTrigger className={`h-16 ${errors.student ? "border-red-500" : ""}`}>
                    <SelectValue placeholder="Choose a student from the list" />
                  </SelectTrigger>
                  <SelectContent className="max-h-60">
                    {students.map((student: any) => (
                      <SelectItem key={student._id} value={student._id} className="h-16">
                        <div className="flex flex-col py-1">
                          <span className="font-medium text-base">{student.name}</span>
                          <span className="text-sm text-muted-foreground">{student.email}</span>
                          
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.student && <p className="text-sm text-red-500">{errors.student}</p>}
              </div>
            </CardContent>
          </Card>

          {/* Property Details */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Building2 className="h-5 w-5 mr-2" />
                Property Details
              </CardTitle>
              <CardDescription>Select property, room, and bed</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="property">Property *</Label>
                <Select value={formData.property} onValueChange={handlePropertyChange}>
                  <SelectTrigger className={`h-16 ${errors.property ? "border-red-500" : ""}`}>
                    <SelectValue placeholder="Choose a property from the list" />
                  </SelectTrigger>
                  <SelectContent className="max-h-60">
                    {properties.map((property: any) => (
                      <SelectItem key={property._id} value={property._id} className="h-16">
                        <div className="flex flex-col py-1">
                          <span className="font-medium text-base">{property.name}</span>
                          <span className="text-sm text-muted-foreground">
                            {property.roomsCount} rooms, {property.availableBeds} beds
                            available
                          </span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.property && <p className="text-sm text-red-500">{errors.property}</p>}
              </div>

              {formData.property && (
                <div className="space-y-2">
                  <Label htmlFor="room">Room *</Label>
                  <Select value={formData.room} onValueChange={handleRoomChange}>
                    <SelectTrigger className={errors.room ? "border-red-500" : ""}>
                      <SelectValue placeholder="Choose a room" />
                    </SelectTrigger>
                    <SelectContent>
                      {rooms.map((room: any) => (
                        <SelectItem key={room._id} value={room._id}>
                          <div className="flex flex-col">
                            <span className="font-medium">
                              {room.name} ({room.roomNumber})
                            </span>
                            <span className="text-sm text-muted-foreground">
                              {room.roomType} - ₹{room.rent}/month - {room.availableBeds} beds available
                            </span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.room && <p className="text-sm text-red-500">{errors.room}</p>}
                </div>
              )}

              {formData.room && (
                <div className="space-y-2">
                  <Label htmlFor="bed">Bed *</Label>
                  <Select value={formData.bed} onValueChange={handleBedChange}>
                    <SelectTrigger className={errors.bed ? "border-red-500" : ""}>
                      <SelectValue placeholder="Choose a bed" />
                    </SelectTrigger>
                    <SelectContent>
                      {beds.map((bed: any) => (
                        <SelectItem
                          key={bed._id}
                          value={bed._id}
                          disabled={!bed.isBookable && bed._id !== formData.bed}
                        >
                          <div className="flex items-center justify-between w-full">
                            <span className="font-medium">{bed.bedNumber}</span>
                            {getBedStatusBadge(bed.status)}
                            {bed.studentName && (
                              <span className="text-xs text-muted-foreground ml-2">({bed.studentName})</span>
                            )}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.bed && <p className="text-sm text-red-500">{errors.bed}</p>}
                  {beds.length > 0 &&
                    beds.filter((bed: any) => bed.isBookable || bed._id === formData.bed).length === 0 && (
                      <p className="text-sm text-orange-600">No available beds in this room</p>
                    )}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Booking Dates */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Calendar className="h-5 w-5 mr-2" />
                Booking Dates
              </CardTitle>
              <CardDescription>Set check-in date</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="checkInDate">Check-in Date *</Label>
                  <Input
                    id="checkInDate"
                    type="date"
                    value={formData.checkInDate}
                    onChange={(e) => handleInputChange("checkInDate", e.target.value)}
                    className={errors.checkInDate ? "border-red-500" : ""}
                    min={new Date().toISOString().split("T")[0]}
                  />
                  {errors.checkInDate && <p className="text-sm text-red-500">{errors.checkInDate}</p>}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Payment Details */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <CreditCard className="h-5 w-5 mr-2" />
                Payment Details
              </CardTitle>
              <CardDescription>Configure payment information</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="totalAmount">Total Amount (₹) *</Label>
                  <Input
                    id="totalAmount"
                    type="number"
                    placeholder="e.g. 25000"
                    value={formData.totalAmount}
                    onChange={(e) => handleInputChange("totalAmount", e.target.value)}
                    className={errors.totalAmount ? "border-red-500" : ""}
                    min="0"
                    step="0.01"
                  />
                  {errors.totalAmount && <p className="text-sm text-red-500">{errors.totalAmount}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="advanceAmount">Advance Amount (₹) *</Label>
                  <Input
                    id="advanceAmount"
                    type="number"
                    placeholder="e.g. 5000"
                    value={formData.advanceAmount}
                    onChange={(e) => handleInputChange("advanceAmount", e.target.value)}
                    className={errors.advanceAmount ? "border-red-500" : ""}
                    min="0"
                    step="0.01"
                  />
                  {errors.advanceAmount && <p className="text-sm text-red-500">{errors.advanceAmount}</p>}
                </div>
              </div>

              {formData.totalAmount && formData.advanceAmount && (
                <div className="p-3 bg-muted rounded-lg">
                  <p className="text-sm">
                    <strong>Remaining Amount: ₹{calculateRemainingAmount().toLocaleString()}</strong>
                  </p>
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="paymentMethod">Payment Method *</Label>
                <Select
                  value={formData.paymentMethod}
                  onValueChange={(value) => handleInputChange("paymentMethod", value)}
                >
                  <SelectTrigger className={errors.paymentMethod ? "border-red-500" : ""}>
                    <SelectValue placeholder="Choose payment method" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Cash">Cash</SelectItem>
                    <SelectItem value="UPI">UPI</SelectItem>
                    <SelectItem value="Bank Transfer">Bank Transfer</SelectItem>
                    <SelectItem value="Credit Card">Credit Card</SelectItem>
                    <SelectItem value="Debit Card">Debit Card</SelectItem>
                    <SelectItem value="Online">Online</SelectItem>
                  </SelectContent>
                </Select>
                {errors.paymentMethod && <p className="text-sm text-red-500">{errors.paymentMethod}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="paymentScreenshot">Payment Screenshot (Optional)</Label>
                <Input
                  id="paymentScreenshot"
                  type="url"
                  placeholder="Paste image link or use the uploader"
                  value={formData.paymentScreenshot}
                  onChange={(e) => handleInputChange("paymentScreenshot", e.target.value)}
                />
                <div className="flex items-center gap-2">
                  <Input type="file" accept="image/*" onChange={(e) => setPaymentFile(e.target.files?.[0] || null)} />
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleUploadPayment}
                    disabled={!paymentFile || uploading}
                  >
                    {uploading ? "Uploading..." : "Upload"}
                  </Button>
                </div>
                {formData.paymentScreenshot ? (
                  <div className="text-xs text-muted-foreground break-all">Uploaded: {formData.paymentScreenshot}</div>
                ) : null}
                <p className="text-xs text-muted-foreground">Upload payment proof screenshot or paste a URL.</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="paymentStatus">Payment Status</Label>
                  <Select
                    value={formData.paymentStatus}
                    onValueChange={(value) => handleInputChange("paymentStatus", value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Pending">Pending</SelectItem>
                      <SelectItem value="Booking Amount Paid">Booking Amount Paid</SelectItem>
                      <SelectItem value="Full Amount Paid">Full Amount Paid</SelectItem>
                      <SelectItem value="Partially Paid">Partially Paid</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="bookingStatus">Booking Status</Label>
                  <Select
                    value={formData.bookingStatus}
                    onValueChange={(value) => handleInputChange("bookingStatus", value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="confirmed">Confirmed</SelectItem>
                      <SelectItem value="cancelled">Cancelled</SelectItem>
                      <SelectItem value="completed">Completed</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Additional Information */}
        <Card>
          <CardHeader>
            <CardTitle>Additional Information</CardTitle>
            <CardDescription>Optional details and notes</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="specialRequests">Special Requests</Label>
              <Textarea
                id="specialRequests"
                placeholder="Any special requests from the student (e.g., ground floor room, near washroom, etc.)"
                value={formData.specialRequests}
                onChange={(e) => handleInputChange("specialRequests", e.target.value)}
                rows={3}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="notes">Admin Notes</Label>
              <Textarea
                id="notes"
                placeholder="Internal notes for this booking (e.g., payment reminders, special conditions, etc.)"
                value={formData.notes}
                onChange={(e) => handleInputChange("notes", e.target.value)}
                rows={3}
              />
            </div>
          </CardContent>
        </Card>

        {/* Submit Button */}
        <div className="flex justify-end space-x-4">
          <Button type="button" variant="outline" onClick={() => router.back()}>
            Cancel
          </Button>
          <Button type="submit" disabled={loading}>
            {loading ? "Creating..." : "Create Booking"}
          </Button>
        </div>
      </form>
    </div>
  )
}
