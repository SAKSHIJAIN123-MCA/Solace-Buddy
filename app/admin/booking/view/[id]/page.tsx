"use client"

import { useState, useEffect, use } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { useToast } from "@/hooks/use-toast"
import { useRouter } from "next/navigation"
import { ArrowLeft, Calendar, CreditCard, User, Building2, MapPin, Phone, Mail, Edit, Trash2 } from "lucide-react"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"

export default function ViewBookingPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params)
  const { toast } = useToast()
  const router = useRouter()
  const [booking, setBooking] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchBooking()
  }, [])

  const fetchBooking = async () => {
    try {
      const response = await fetch(`/api/booking/${resolvedParams.id}`)
      const result = await response.json()

      if (result.success) {
        setBooking(result.data)
      } else {
        toast({
          title: "Error",
          description: "Failed to fetch booking details",
          variant: "destructive",
        })
        router.push("/admin/booking")
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Something went wrong while fetching booking",
        variant: "destructive",
      })
      router.push("/admin/booking")
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async () => {
    try {
      const response = await fetch(`/api/booking/${resolvedParams.id}`, {
        method: "DELETE",
      })

      const result = await response.json()

      if (result.success) {
        toast({
          title: "Success",
          description: "Booking deleted successfully",
        })
        router.push("/admin/booking")
      } else {
        toast({
          title: "Error",
          description: result.error,
          variant: "destructive",
        })
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete booking",
        variant: "destructive",
      })
    }
  }

  const getStatusBadge = (status: string) => {
    const variants: any = {
      pending: "secondary",
      confirmed: "default",
      cancelled: "destructive",
      completed: "outline",
    }
    return <Badge variant={variants[status] || "secondary"}>{status}</Badge>
  }

  const getPaymentBadge = (status: string) => {
    const normalized = (status || "").toString()
    const variants: any = {
      Pending: "destructive",
      "Booking Amount Paid": "secondary",
      "Full Amount Paid": "default",
      "Partially Paid": "secondary",
    }
    // Backward compatibility with old values
    if (normalized === "pending") return <Badge variant="destructive">Pending</Badge>
    if (normalized === "partial") return <Badge variant="secondary">Partially Paid</Badge>
    if (normalized === "completed") return <Badge variant="default">Full Amount Paid</Badge>
    return <Badge variant={variants[normalized] || "secondary"}>{normalized}</Badge>
  }

  const formatINR = (n: number) =>
    typeof n === "number" && !Number.isNaN(n) ? n.toLocaleString("en-IN", { maximumFractionDigits: 0 }) : "0"

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900"></div>
          <p className="mt-4">Loading booking details...</p>
        </div>
      </div>
    )
  }

  if (!booking) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <p className="text-lg text-muted-foreground">Booking not found</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button variant="outline" size="sm" onClick={() => router.back()}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Booking Details</h1>
            <p className="text-muted-foreground">Booking ID: {booking.bookingId}</p>
          </div>
        </div>
        <div className="flex space-x-2">
          <Button variant="outline" onClick={() => router.push(`/admin/booking/edit/${booking._id}`)}>
            <Edit className="h-4 w-4 mr-2" />
            Edit
          </Button>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="destructive">
                <Trash2 className="h-4 w-4 mr-2" />
                Delete
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                <AlertDialogDescription>
                  This action cannot be undone. This will permanently delete the booking and restore room availability.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={handleDelete}>Delete</AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Student Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <User className="h-5 w-5 mr-2" />
              Student Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <User className="h-4 w-4 text-muted-foreground" />
                <span className="font-medium">{booking.student?.name}</span>
              </div>
              <div className="flex items-center space-x-2">
                <Mail className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">{booking.student?.email}</span>
              </div>
              <div className="flex items-center space-x-2">
                <Phone className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">{booking.student?.phone}</span>
              </div>
              {/* <div className="flex items-center space-x-2">
                <GraduationCap className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">
                  {booking.student?.course} - Year {booking.student?.year}
                </span>
              </div>
              <div className="flex items-center space-x-2">
                <Building2 className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">{booking.student?.college}</span>
              </div> */}
            </div>
          </CardContent>
        </Card>

        {/* Property Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Building2 className="h-5 w-5 mr-2" />
              Property Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <Building2 className="h-4 w-4 text-muted-foreground" />
                <span className="font-medium">{booking.property?.name}</span>
              </div>
              <div className="flex items-center space-x-2">
                <MapPin className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">
                  {booking.property?.city}, {booking.property?.state}
                </span>
              </div>
              {booking.roomDetails && (
                <div className="flex items-center space-x-2">
                  <span className="text-sm font-medium">Room:</span>
                  <span className="text-sm">
                    {booking.roomDetails.name} ({booking.roomDetails.roomNumber}) - {booking.roomDetails.roomType}
                  </span>

                    <span className="text-sm font-medium">Room Rent:</span>
                <span className="text-sm font-bold">₹{formatINR(booking.totalAmount)}</span>
                </div>
              )}
              {booking.bedDetails && (
                <div className="flex items-center space-x-2">
                  <span className="text-sm font-medium">Bed:</span>
                  <span className="text-sm">{booking.bedDetails.bedNumber}</span>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Booking Details */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Calendar className="h-5 w-5 mr-2" />
              Booking Details
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm font-medium">Check-in Date</p>
                <p className="text-sm text-muted-foreground">{new Date(booking.checkInDate).toLocaleDateString()}</p>
              </div>
              {/* <div>
                <p className="text-sm font-medium">Check-out Date</p>
                <p className="text-sm text-muted-foreground">{new Date(booking.checkOutDate).toLocaleDateString()}</p>
              </div> */}
              <div>
                <p className="text-sm font-medium">Booking Status</p>
                <div className="mt-1">{getStatusBadge(booking.bookingStatus)}</div>
              </div>
              <div>
                <p className="text-sm font-medium">Booking Source</p>
                <p className="text-sm text-muted-foreground capitalize">{booking.bookingSource}</p>
              </div>
            </div>
          </CardContent>
        </Card>

          {/* Payment Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <CreditCard className="h-5 w-5 mr-2" />
              Payment Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-sm font-medium">Total Payable:</span>
                <span className="text-sm font-bold">₹{formatINR(booking.totalAmount)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm font-medium">Booking Amount:</span>
                <span className="text-sm text-green-600">₹{formatINR(booking.advanceAmount)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm font-medium">Remaining Payable directly to Owner:</span>
                <span className="text-sm text-orange-600">
                  ₹{formatINR((booking.totalAmount || 0) - (booking.advanceAmount || 0))}
                </span>
              </div>
              <Separator />
              <div className="flex justify-between">
                <span className="text-sm font-medium">Payment Method:</span>
                <span className="text-sm">{booking.paymentMethod}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm font-medium">Payment Status:</span>
                <div>{getPaymentBadge(booking.paymentStatus)}</div>
              </div>

               <div className="flex justify-between">
               <span className="text-sm font-medium">Booking Confirmation Status:</span>
                <div>{getStatusBadge(booking.bookingStatus)}</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Additional Information */}
      {(booking.specialRequests || booking.notes) && (
        <Card>
          <CardHeader>
            <CardTitle>Additional Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {booking.specialRequests && (
              <div>
                <p className="text-sm font-medium mb-2">Special Requests:</p>
                <p className="text-sm text-muted-foreground bg-muted p-3 rounded-lg">{booking.specialRequests}</p>
              </div>
            )}
            {booking.notes && (
              <div>
                <p className="text-sm font-medium mb-2">Admin Notes:</p>
                <p className="text-sm text-muted-foreground bg-muted p-3 rounded-lg">{booking.notes}</p>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Booking Timeline */}
      <Card>
        <CardHeader>
          <CardTitle>Booking Timeline</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center space-x-3">
              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
              <div>
                <p className="text-sm font-medium">Booking Created</p>
                <p className="text-xs text-muted-foreground">{new Date(booking.createdAt).toLocaleString()}</p>
              </div>
            </div>
            {booking.updatedAt !== booking.createdAt && (
              <div className="flex items-center space-x-3">
                <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                <div>
                  <p className="text-sm font-medium">Last Updated</p>
                  <p className="text-xs text-muted-foreground">{new Date(booking.updatedAt).toLocaleString()}</p>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
