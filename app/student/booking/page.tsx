"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/hooks/use-toast"
import { Eye, Trash2, Calendar, Users, Clock, AlertCircle } from "lucide-react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"

export default function StudentBookingPage() {
  const { toast } = useToast()
  const [bookings, setBookings] = useState([])
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState({
    total: 0,
    confirmed: 0,
    pending: 0,
    cancelled: 0,
    completed: 0,
  })
  const [selectedBooking, setSelectedBooking] = useState<any>(null)

  useEffect(() => {
    fetchBookings()
  }, [])

  const fetchBookings = async () => {
    try {
      setLoading(true)
      const response = await fetch("/api/student/bookings?limit=1000")
      const result = await response.json()

      if (result.success) {
        setBookings(result.data)
        setStats(result.statistics)
      } else {
        toast({
          title: "Error",
          description: result.error || "Failed to fetch bookings",
          variant: "destructive",
        })
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Something went wrong while fetching bookings",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleCancelBooking = async (id: string) => {
    try {
      const response = await fetch(`/api/student/bookings/${id}`, {
        method: "DELETE",
      })

      const result = await response.json()

      if (result.success) {
        toast({
          title: "Success",
          description: "Booking cancelled successfully",
        })
        fetchBookings()
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
        description: "Failed to cancel booking",
        variant: "destructive",
      })
    }
  }

  const viewBookingDetails = async (id: string) => {
    try {
      const response = await fetch(`/api/student/bookings/${id}`)
      const result = await response.json()

      if (result.success) {
        setSelectedBooking(result.data)
      } else {
        toast({
          title: "Error",
          description: "Failed to fetch booking details",
          variant: "destructive",
        })
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Something went wrong",
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
    const variants: any = {
      pending: "destructive",
      partial: "secondary",
      completed: "default",
    }
    return <Badge variant={variants[status] || "secondary"}>{status}</Badge>
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900"></div>
          <p className="mt-4">Loading your bookings...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-balance">My Bookings</h1>
        <p className="text-muted-foreground">View and manage your hostel bookings</p>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Bookings</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
            <p className="text-xs text-muted-foreground">All your bookings</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Confirmed</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.confirmed}</div>
            <p className="text-xs text-muted-foreground">Active bookings</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.pending}</div>
            <p className="text-xs text-muted-foreground">Awaiting confirmation</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Cancelled</CardTitle>
            <AlertCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.cancelled}</div>
            <p className="text-xs text-muted-foreground">Cancelled bookings</p>
          </CardContent>
        </Card>
      </div>

      {/* Bookings Table */}
      <Card>
        <CardHeader>
          <CardTitle>Your Bookings ({bookings.length})</CardTitle>
          <CardDescription>All your hostel and PG bookings</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Booking ID</TableHead>
                  <TableHead>Property</TableHead>
                  <TableHead>Room Details</TableHead>
                  <TableHead>Check-in</TableHead>
                  <TableHead>Check-out</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Payment</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {bookings.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={9} className="text-center py-8">
                      <div className="flex flex-col items-center space-y-2">
                        <Calendar className="h-8 w-8 text-muted-foreground" />
                        <p className="text-muted-foreground">No bookings found</p>
                        <p className="text-sm text-muted-foreground">
                          Your bookings will appear here once you make a reservation
                        </p>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  bookings.map((booking: any) => (
                    <TableRow key={booking._id}>
                      <TableCell className="font-medium">{booking.bookingId}</TableCell>
                      <TableCell>
                        <div className="flex flex-col">
                          <span className="font-medium">{booking.property?.name}</span>
                          <span className="text-sm text-muted-foreground">
                            {booking.property?.city}, {booking.property?.state}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-col">
                          <span className="text-sm">{booking.roomDetails?.name || "Room details"}</span>
                          <span className="text-xs text-muted-foreground">
                            {booking.bedDetails?.bedNumber || "Bed details"}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>{new Date(booking.checkInDate).toLocaleDateString()}</TableCell>
                      <TableCell>{new Date(booking.checkOutDate).toLocaleDateString()}</TableCell>
                      <TableCell>
                        <div className="flex flex-col">
                          <span className="font-medium">₹{booking.totalAmount?.toLocaleString()}</span>
                          <span className="text-xs text-muted-foreground">
                            Advance: ₹{booking.advanceAmount?.toLocaleString()}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>{getPaymentBadge(booking.paymentStatus)}</TableCell>
                      <TableCell>{getStatusBadge(booking.bookingStatus)}</TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button variant="outline" size="sm" onClick={() => viewBookingDetails(booking._id)}>
                                <Eye className="h-4 w-4" />
                              </Button>
                            </DialogTrigger>
                            <DialogContent className="max-w-2xl">
                              <DialogHeader>
                                <DialogTitle>Booking Details</DialogTitle>
                                <DialogDescription>Complete information about your booking</DialogDescription>
                              </DialogHeader>
                              {selectedBooking && (
                                <div className="space-y-4">
                                  <div className="grid grid-cols-2 gap-4">
                                    <div>
                                      <label className="text-sm font-medium">Booking ID</label>
                                      <p className="text-sm text-muted-foreground">{selectedBooking.bookingId}</p>
                                    </div>
                                    <div>
                                      <label className="text-sm font-medium">Status</label>
                                      <div className="mt-1">{getStatusBadge(selectedBooking.bookingStatus)}</div>
                                    </div>
                                    <div>
                                      <label className="text-sm font-medium">Property</label>
                                      <p className="text-sm text-muted-foreground">{selectedBooking.property?.name}</p>
                                    </div>
                                    <div>
                                      <label className="text-sm font-medium">Room & Bed</label>
                                      <p className="text-sm text-muted-foreground">
                                        {selectedBooking.roomDetails?.name} - {selectedBooking.bedDetails?.bedNumber}
                                      </p>
                                    </div>
                                    <div>
                                      <label className="text-sm font-medium">Check-in Date</label>
                                      <p className="text-sm text-muted-foreground">
                                        {new Date(selectedBooking.checkInDate).toLocaleDateString()}
                                      </p>
                                    </div>
                                    <div>
                                      <label className="text-sm font-medium">Check-out Date</label>
                                      <p className="text-sm text-muted-foreground">
                                        {new Date(selectedBooking.checkOutDate).toLocaleDateString()}
                                      </p>
                                    </div>
                                    <div>
                                      <label className="text-sm font-medium">Total Amount</label>
                                      <p className="text-sm text-muted-foreground">
                                        ₹{selectedBooking.totalAmount?.toLocaleString()}
                                      </p>
                                    </div>
                                    <div>
                                      <label className="text-sm font-medium">Payment Status</label>
                                      <div className="mt-1">{getPaymentBadge(selectedBooking.paymentStatus)}</div>
                                    </div>
                                  </div>
                                  {selectedBooking.specialRequests && (
                                    <div>
                                      <label className="text-sm font-medium">Special Requests</label>
                                      <p className="text-sm text-muted-foreground">{selectedBooking.specialRequests}</p>
                                    </div>
                                  )}
                                  {selectedBooking.notes && (
                                    <div>
                                      <label className="text-sm font-medium">Notes</label>
                                      <p className="text-sm text-muted-foreground">{selectedBooking.notes}</p>
                                    </div>
                                  )}
                                </div>
                              )}
                            </DialogContent>
                          </Dialog>

                          {booking.bookingStatus === "pending" && (
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button variant="outline" size="sm">
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>Cancel Booking?</AlertDialogTitle>
                                  <AlertDialogDescription>
                                    This action cannot be undone. This will cancel your booking and make the bed
                                    available for others.
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>Keep Booking</AlertDialogCancel>
                                  <AlertDialogAction onClick={() => handleCancelBooking(booking._id)}>
                                    Cancel Booking
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
