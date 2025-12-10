"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/hooks/use-toast"
import { Calendar, Users, TrendingUp, AlertCircle, Eye, Search, Download } from "lucide-react"
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
} from "@/components/ui/alert-dialog"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"

export default function VendorBookingPage() {
  const { toast } = useToast()
  const [bookings, setBookings] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [paymentFilter, setPaymentFilter] = useState("all")
  const [startDate, setStartDate] = useState("")
  const [endDate, setEndDate] = useState("")
  const [stats, setStats] = useState({
    total: 0,
    confirmed: 0,
    pending: 0,
    totalRevenue: 0,
  })
  const [deletingBooking, setDeletingBooking] = useState<any>(null)
  const [viewingBooking, setViewingBooking] = useState<any>(null)
  const [kycDialogOpen, setKycDialogOpen] = useState(false)
  const [kycLoading, setKycLoading] = useState(false)
  const [kycRecord, setKycRecord] = useState<any>(null)
  const [kycError, setKycError] = useState<string | null>(null)
  const [updatingBookingId, setUpdatingBookingId] = useState<string | null>(null)

  useEffect(() => {
    fetchBookings()
  }, [statusFilter, paymentFilter, startDate, endDate])

  const fetchBookings = async () => {
    try {
      setLoading(true)

      // Build query params
      const params = new URLSearchParams({
        limit: "1000",
        status: statusFilter,
        paymentStatus: paymentFilter,
      })

      if (startDate) params.append("startDate", startDate)
      if (endDate) params.append("endDate", endDate)
      if (searchTerm) params.append("search", searchTerm)

      const response = await fetch(`/api/vendor-bookings?${params.toString()}`)
      const result = await response.json()

      if (result.success) {
        setBookings(result.data)
        calculateStats(result.data)
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

  const calculateStats = (bookingsData: any[]) => {
    const stats = {
      total: bookingsData.length,
      confirmed: bookingsData.filter((b) => b.bookingStatus === "confirmed").length,
      pending: bookingsData.filter((b) => b.bookingStatus === "pending").length,
      totalRevenue: bookingsData.reduce((sum, b) => sum + (b.totalAmount || 0), 0),
    }
    setStats(stats)
  }

  const handleStatusChange = async (bookingId: string, newStatus: string) => {
    try {
      setUpdatingBookingId(bookingId)
      const response = await fetch("/api/vendor-bookings", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          bookingId,
          bookingStatus: newStatus,
        }),
      })

      const result = await response.json()

      if (result.success) {
        toast({
          title: "Success",
          description: `Booking status updated to ${newStatus}`,
        })
        fetchBookings()
      } else {
        toast({
          title: "Error",
          description: result.error || "Failed to update booking status",
          variant: "destructive",
        })
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Something went wrong while updating status",
        variant: "destructive",
      })
    } finally {
      setUpdatingBookingId(null)
    }
  }

  const handleDelete = async (id: string) => {
    try {
      const response = await fetch(`/api/booking/${id}`, {
        method: "DELETE",
      })

      const result = await response.json()

      if (result.success) {
        toast({
          title: "Success",
          description: "Booking deleted successfully",
        })
        setDeletingBooking(null)
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
        description: "Failed to delete booking",
        variant: "destructive",
      })
    }
  }

  const handleSearch = () => {
    fetchBookings()
  }

  const handleClearFilters = () => {
    setSearchTerm("")
    setStatusFilter("all")
    setPaymentFilter("all")
    setStartDate("")
    setEndDate("")
  }

  const filteredBookings = bookings.filter((booking: any) => {
    if (!searchTerm) return true

    const matchesSearch =
      booking.student?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      booking.property?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      booking.bookingId?.toLowerCase().includes(searchTerm.toLowerCase())

    return matchesSearch
  })

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

  const getKycStatusBadge = (record: any) => {
    if (!record) return null
    if (record.isCompleted) {
      return <Badge className="bg-green-100 text-green-800">Completed</Badge>
    }
    if (record.currentStep > 1) {
      return <Badge className="bg-yellow-100 text-yellow-800">In Progress</Badge>
    }
    return <Badge className="bg-gray-100 text-gray-800">Not Started</Badge>
  }

  const renderKYCDetails = (record: any) => {
    return (
      <div className="space-y-6 max-h-[70vh] overflow-y-auto">
        <div>
          <h4 className="font-semibold text-lg mb-3">Personal Details</h4>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="font-medium text-muted-foreground">Name:</p>
              <p>{record.name || "-"}</p>
            </div>
            <div>
              <p className="font-medium text-muted-foreground">Mobile:</p>
              <p>{record.mobileNumber || "-"}</p>
            </div>
            <div>
              <p className="font-medium text-muted-foreground">Email:</p>
              <p>{record.email || "-"}</p>
            </div>
            <div>
              <p className="font-medium text-muted-foreground">Status:</p>
              {getKycStatusBadge(record)}
            </div>
          </div>
        </div>

        <div>
          <h4 className="font-semibold text-lg mb-3">Student Information</h4>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="font-medium text-muted-foreground">Student Name:</p>
              <p>{record.student?.name || "-"}</p>
            </div>
            <div>
              <p className="font-medium text-muted-foreground">College:</p>
              <p>{record.student?.college || "-"}</p>
            </div>
            <div>
              <p className="font-medium text-muted-foreground">Course:</p>
              <p>{record.student?.course || "-"}</p>
            </div>
            <div>
              <p className="font-medium text-muted-foreground">Year:</p>
              <p>{record.student?.year || "-"}</p>
            </div>
          </div>
        </div>

        <div>
          <h4 className="font-semibold text-lg mb-3">Payment & Stay</h4>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="font-medium text-muted-foreground">PG Start Date:</p>
              <p>{record.pgStartDate ? new Date(record.pgStartDate).toLocaleDateString() : "-"}</p>
            </div>
            <div>
              <p className="font-medium text-muted-foreground">Monthly Rent:</p>
              <p>{record.monthlyRent ? `₹${record.monthlyRent}` : "-"}</p>
            </div>
            <div>
              <p className="font-medium text-muted-foreground">Booking Amount:</p>
              <p>{record.bookingAmountPaid ? `₹${record.bookingAmountPaid}` : "-"}</p>
            </div>
            <div>
              <p className="font-medium text-muted-foreground">Current Step:</p>
              <p>{record.currentStep || 1} of 6</p>
            </div>
          </div>
        </div>

        <div>
          <h4 className="font-semibold text-lg mb-3">Submission</h4>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="font-medium text-muted-foreground">Created:</p>
              <p>{record.createdAt ? new Date(record.createdAt).toLocaleString() : "-"}</p>
            </div>
            <div>
              <p className="font-medium text-muted-foreground">Updated:</p>
              <p>{record.updatedAt ? new Date(record.updatedAt).toLocaleString() : "-"}</p>
            </div>
            {record.submittedAt && (
              <div>
                <p className="font-medium text-muted-foreground">Submitted:</p>
                <p>{new Date(record.submittedAt).toLocaleString()}</p>
              </div>
            )}
          </div>
        </div>
      </div>
    )
  }

  const loadKYCForStudent = async (studentId?: string) => {
    if (!studentId) return
    setKycDialogOpen(true)
    setKycLoading(true)
    setKycRecord(null)
    setKycError(null)
    try {
      const res = await fetch(`/api/kyc/by-student/${studentId}`)
      const data = await res.json()
      if (data?.kyc) {
        if (data.kyc.isCompleted) {
          setKycRecord(data.kyc)
        } else {
          setKycError("KYC not completed")
        }
      } else {
        setKycError("KYC not completed")
      }
    } catch (e) {
      setKycError("KYC details fetch karne mein problem aayi")
    } finally {
      setKycLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900"></div>
          <p className="mt-4">Loading bookings...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="p-8 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">My Property Bookings</h1>
          <p className="text-muted-foreground py-2">View and manage bookings for your properties</p>
        </div>
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
            <p className="text-xs text-muted-foreground">All time bookings</p>
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
            <AlertCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.pending}</div>
            <p className="text-xs text-muted-foreground">Awaiting confirmation</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₹{stats.totalRevenue.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">Total booking value</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Filters</CardTitle>
          <CardDescription>Filter bookings by various criteria</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Search and Status Filters */}
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search by student name, property, or booking ID..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                    className="pl-8"
                  />
                </div>
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full md:w-[180px]">
                  <SelectValue placeholder="Booking Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="confirmed">Confirmed</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                </SelectContent>
              </Select>
              <Select value={paymentFilter} onValueChange={setPaymentFilter}>
                <SelectTrigger className="w-full md:w-[180px]">
                  <SelectValue placeholder="Payment Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Payments</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="partial">Partial</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Date Filters */}
            <div className="flex flex-col md:flex-row gap-4 items-end">
              <div className="flex-1">
                <label className="text-sm font-medium mb-2 block">Start Date</label>
                <Input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
              </div>
              <div className="flex-1">
                <label className="text-sm font-medium mb-2 block">End Date</label>
                <Input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
              </div>
              <Button onClick={handleSearch} className="w-full md:w-auto">
                Apply Filters
              </Button>
              <Button onClick={handleClearFilters} variant="outline" className="w-full md:w-auto bg-transparent">
                Clear Filters
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Bookings Table */}
      <Card>
        <CardHeader>
          <CardTitle>All Bookings ({filteredBookings.length})</CardTitle>
          <CardDescription>Complete list of bookings for your properties</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Booking ID</TableHead>
                  <TableHead>Tenant Details</TableHead>
                  <TableHead>Property</TableHead>
                  <TableHead>Room Details</TableHead>
                  <TableHead>Check-in Date</TableHead>
                  <TableHead>Payment</TableHead>
                  <TableHead>Confirm</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredBookings.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={9} className="text-center py-8">
                      <div className="flex flex-col items-center space-y-2">
                        <Calendar className="h-8 w-8 text-muted-foreground" />
                        <p className="text-muted-foreground">No bookings found</p>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredBookings.map((booking: any) => (
                    <TableRow key={booking._id}>
                      <TableCell className="font-medium">{booking.bookingId}</TableCell>
                      <TableCell>
                        <div className="flex flex-col">
                          <button
                            type="button"
                            onClick={() => loadKYCForStudent(booking.student?._id)}
                            className="font-medium text-left text-primary hover:underline"
                            title="View KYC"
                          >
                            {booking.student?.name}
                          </button>
                          <button
                            type="button"
                            onClick={() => loadKYCForStudent(booking.student?._id)}
                            className="text-sm text-primary/80 hover:underline text-left"
                            title="View KYC"
                          >
                            {booking.student?.email}
                          </button>
                        </div>
                      </TableCell>
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
                          <span className="text-sm">
                            {booking.roomDetails?.displayName || booking.roomDetails?.name || "Room details"}
                          </span>
                          <span className="text-xs text-muted-foreground">
                            Bed {booking.bedDetails?.bedNumber || "N/A"}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>{new Date(booking.checkInDate).toLocaleDateString()}</TableCell>
                      <TableCell>
                        <div className="flex flex-col">
                          <span className="font-medium"> Total: ₹{booking.totalAmount?.toLocaleString()}</span>
                          <span className="text-xs text-muted-foreground">
                            Paid: ₹{booking.advanceAmount?.toLocaleString()}
                          </span>
                          <span className="text-xs text-muted-foreground font-semibold">
                            Due: ₹{booking.remainingAmount?.toLocaleString()}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Select
                          value={booking.bookingStatus}
                          onValueChange={(newStatus) => handleStatusChange(booking._id, newStatus)}
                          disabled={updatingBookingId === booking._id}
                        >
                          <SelectTrigger className="w-[140px]">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="pending">Pending</SelectItem>
                            <SelectItem value="confirmed">Confirmed</SelectItem>
                            <SelectItem value="cancelled">Cancelled</SelectItem>
                            <SelectItem value="completed">Completed</SelectItem>
                          </SelectContent>
                        </Select>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => loadKYCForStudent(booking.student?._id)}
                            title="View KYC Details"
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setViewingBooking(booking)}
                            title="View Booking Details"
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
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

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!deletingBooking} onOpenChange={() => setDeletingBooking(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the booking for{" "}
              <strong>{deletingBooking?.student?.name}</strong> and restore room availability.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={() => handleDelete(deletingBooking?._id)}>Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* View Booking Details Dialog */}
      <Dialog open={!!viewingBooking} onOpenChange={() => setViewingBooking(null)}>
        <DialogContent className="max-w-2xl max-h-[80vh] flex flex-col">
          <DialogHeader>
            <DialogTitle>Booking Details</DialogTitle>
            <DialogDescription>Complete information about this booking</DialogDescription>
          </DialogHeader>
          {viewingBooking && (
            <div className="space-y-4 overflow-y-auto pr-2 mt-4 flex-1">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Booking ID</label>
                  <p className="text-sm font-semibold">{viewingBooking.bookingId}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Booking Status</label>
                  <div className="mt-1">{getStatusBadge(viewingBooking.bookingStatus)}</div>
                </div>
              </div>

              <div className="border-t pt-4">
                <h3 className="font-semibold mb-2">Tenant Information</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Name</label>
                    <p className="text-sm">{viewingBooking.student?.name}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Email</label>
                    <p className="text-sm">{viewingBooking.student?.email}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Phone</label>
                    <p className="text-sm">{viewingBooking.student?.phone}</p>
                  </div>
                </div>
              </div>

              <div className="border-t pt-4">
                <h3 className="font-semibold mb-2">Property Information</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Property Name</label>
                    <p className="text-sm">{viewingBooking.property?.name}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Property ID</label>
                    <p className="text-sm">{viewingBooking.property?.propertyId}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Room</label>
                    <p className="text-sm">
                      {viewingBooking.roomDetails?.displayName || viewingBooking.roomDetails?.name || "N/A"}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Bed Number</label>
                    <p className="text-sm">Bed {viewingBooking.bedDetails?.bedNumber || "N/A"}</p>
                  </div>
                </div>
              </div>

              <div className="border-t pt-4">
                <h3 className="font-semibold mb-2">Payment Information</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Total Amount</label>
                    <p className="text-sm font-semibold">₹{viewingBooking.totalAmount?.toLocaleString()}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Advance Paid</label>
                    <p className="text-sm">₹{viewingBooking.advanceAmount?.toLocaleString()}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Remaining Amount</label>
                    <p className="text-sm">₹{viewingBooking.remainingAmount?.toLocaleString()}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Payment Status</label>
                    <div className="mt-1">{getPaymentBadge(viewingBooking.paymentStatus)}</div>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Payment Method</label>
                    <p className="text-sm">{viewingBooking.paymentMethod}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Check-in Date</label>
                    <p className="text-sm">{new Date(viewingBooking.checkInDate).toLocaleDateString()}</p>
                  </div>
                </div>
              </div>

              {viewingBooking.specialRequests && (
                <div className="border-t pt-4">
                  <label className="text-sm font-medium text-muted-foreground">Special Requests</label>
                  <p className="text-sm mt-1">{viewingBooking.specialRequests}</p>
                </div>
              )}

              {viewingBooking.notes && (
                <div className="border-t pt-4">
                  <label className="text-sm font-medium text-muted-foreground">Notes</label>
                  <p className="text-sm mt-1">{viewingBooking.notes}</p>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* KYC Dialog */}
      <Dialog open={kycDialogOpen} onOpenChange={setKycDialogOpen}>
        <DialogContent className="max-w-3xl">
          <DialogHeader className="flex flex-row items-center justify-between">
            <div>
              <DialogTitle>KYC Details</DialogTitle>
              <DialogDescription>Student KYC information</DialogDescription>
            </div>
            {kycRecord && (
              <Button variant="outline" size="sm" asChild>
                <a
                  href={`/api/admin/kyc/${kycRecord._id}/pdf`}
                  target="_blank"
                  rel="noopener noreferrer"
                  title="Download KYC PDF"
                >
                  <Download className="h-4 w-4 mr-2" />
                  Download PDF
                </a>
              </Button>
            )}
          </DialogHeader>

          {kycLoading && (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          )}

          {!kycLoading && kycError && (
            <div className="py-4">
              <p className="text-sm font-medium text-destructive">{kycError}</p>
            </div>
          )}

          {!kycLoading && !kycError && kycRecord && renderKYCDetails(kycRecord)}
        </DialogContent>
      </Dialog>
    </div>
  )
}
