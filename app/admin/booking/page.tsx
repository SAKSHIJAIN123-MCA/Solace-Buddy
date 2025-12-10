"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/hooks/use-toast"
import { useRouter } from "next/navigation"
import { Plus, Search, Eye, Edit, Trash2, Calendar, Users, TrendingUp, AlertCircle, Download } from "lucide-react"
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
import { default as jsPDF } from "jspdf"

const pdfTerms = `Confirmation of Stay and Reservation
To confirm your stay and reserve a bed through the SolaceBuddy platform, you are required to complete a minimum booking amount payment and fulfill the Know Your Customer (KYC) verification process. Your reservation will only be confirmed upon successful completion of both these requirements.
Remaining Payment Schedule
The remaining amount, which includes the balance of your first month's rent and security deposit (after deducting the booking amount already paid), must be settled directly with the owner at least three (3) days prior to your scheduled joining date. Failure to do so may result in the cancellation of your booking by the owner.
Communication of Details
Upon successful booking and payment of the minimum booking amount, SolaceBuddy will facilitate the sharing of relevant communication details between both parties. The tenant will receive the owner's contact information, and the owner will receive the tenant's contact information. It is your responsibility to proactively communicate with the other party regarding payment terms, move-in details, and any other necessary understandings after the booking is made.
SolaceBuddy's Responsibility and Refund Policy
SolaceBuddy ensures bed availability only in cases where the minimum booking amount payment has been successfully completed through our platform. SolaceBuddy is solely responsible for refunding the booking amount if the cancellation is initiated by us. Any amounts paid directly to the owner (beyond the initial booking amount) are outside of SolaceBuddy's direct refund responsibility. In the event of a default by the PG owner regarding the terms agreed upon for direct payments, you will need to manage the refund process directly with the owner. However, SolaceBuddy will provide assistance and support to help you resolve such disputes, including legal guidance if necessary.
No Refund for Uncontrolled Conditions: In cases of natural pandemics, uncontrolled conditions, changes in local legal policy, or other force majeure events beyond the reasonable control of SolaceBuddy, no amount will be refunded for any booking.
Cancellation by User
If you choose to cancel your booking for any reason, the minimum booking amount paid will not be refunded under any circumstances. This booking amount serves as a non-refundable commitment fee for securing the reservation.
Image and Reality Disclaimer
SolaceBuddy does not guarantee that the images of the property displayed on the platform will perfectly match the actual reality of the premises. Discrepancies may occur due to various factors, including but not limited to depreciation, normal wear and tear, usage, changes made by the owner, or differences in photographic representation. We advise users to conduct their own due diligence or visit the property if possible before confirming their booking.
Variable Booking Amount
The booking amount varies for each property and is specifically displayed on each Property page according to the room and bed selections you make.
Bulk Booking Discounts
Any discounts offered for bulk bookings are solely dependent on the specific property and the duration selected. SolaceBuddy reserves the right to withdraw such discounts at any time, even if previously committed, in special cases or unforeseen circumstances.
Deposit Return Policy
Each PG owner may have their own policy regarding the return of the security deposit, including adjusting it against the last month’s rent or returning it after the stay ends.
Tenants are required to give at least one month’s advance notice before vacating the property in all cases.
The terms regarding deposit return must be directly discussed and confirmed by the tenant with the PG owner after booking confirmation.
SolaceBuddy will share the PG owner's contact number with the tenant after the booking is completed through our platform.
SolaceBuddy does not intervene in or guarantee any deposit return processes or timelines.
KYC and Documentation
Upon booking with SolaceBuddy, each tenant is required to fill out a Joining Form and provide necessary documentation as per local municipal or corporation rules.
All data collected will be securely transmitted to the PG owner for legal compliance, reference, and record-keeping.
SolaceBuddy regularly scrapes or deletes document copies from its systems and does not maintain long-term storage of personal documents.`

async function imageUrlToDataUrl(url: string) {
  const res = await fetch(url)
  const blob = await res.blob()
  return await new Promise<string>((resolve) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result as string)
    reader.readAsDataURL(blob)
  })
}

function safe(value: any, fallback = "") {
  return value ?? fallback
}

function formatINR(n: number) {
  return typeof n === "number" && !Number.isNaN(n) ? n.toLocaleString("en-IN", { maximumFractionDigits: 0 }) : "0"
}

function drawDivider(doc: jsPDF, marginX: number, contentWidth: number, y: number) {
  doc.setDrawColor(200, 200, 200)
  doc.line(marginX, y, marginX + contentWidth, y)
  return y + 6
}

async function generateBookingPDF(booking: any) {
  const doc = new jsPDF({ unit: "mm", format: "a4", orientation: "p" })
  const marginX = 15
  let y = 15
  const pageWidth = 210
  const contentWidth = pageWidth - marginX * 2

  // Logo top-right with fallback
  try {
    try {
      const logoDataUrl = await imageUrlToDataUrl("/solace logo.jpg")
      doc.addImage(logoDataUrl, "PNG", pageWidth - marginX - 28, y - 5, 28, 12)
    } catch {
      const logoFallback = await imageUrlToDataUrl("/placeholder-logo.png")
      doc.addImage(logoFallback, "PNG", pageWidth - marginX - 28, y - 5, 28, 12)
    }
  } catch {
    // ignore if logo fails
  }

  // Typography: bold title, uniform body size
  doc.setFontSize(16)
  doc.setFont(undefined, "bold")
  doc.text("Booking Details", marginX, y)
  y += 10

  doc.setFontSize(12)
  doc.setTextColor(0, 0, 0)

  // Tenant Details
  doc.setFont(undefined, "bold")
  doc.text("Tenant Details:", marginX, y)
  doc.setFont(undefined, "normal")
  y += 7
  doc.text(`Name              : ${safe(booking.student?.name, "")}`, marginX, y)
  y += 6
  doc.text(`Mobile Number     : ${safe(booking.student?.phone, "")}`, marginX, y)
  y += 6
  doc.text(`Email Address     : ${safe(booking.student?.email, "")}`, marginX, y)
  y += 6
  y = drawDivider(doc, marginX, contentWidth, y)

  // Stay related
  doc.setFont(undefined, "bold")
  doc.text("Stay related", marginX, y)
  doc.setFont(undefined, "normal")
  y += 7
  doc.text(`Hostel/PG Name    : ${safe(booking.property?.name, "")}`, marginX, y)
  y += 6
  const fullAddress = [booking.property?.address, booking.property?.city, booking.property?.state]
    .filter(Boolean)
    .join(", ")
  doc.text(`Complete Address   : ${fullAddress}`, marginX, y)
  y += 6
  doc.text(`Check in Date      : ${new Date(booking.checkInDate).toLocaleDateString()}`, marginX, y)
  y += 6
  doc.text(`Owner Name         : `, marginX, y)
  y += 6
  doc.text(`Owner Contact      : `, marginX, y)
  y += 6
  y = drawDivider(doc, marginX, contentWidth, y)

  // Room Related
  doc.setFont(undefined, "bold")
  doc.text("Room Related", marginX, y)
  doc.setFont(undefined, "normal")
  y += 7

  const rd = booking?.roomDetails || {}
  const roomDisplay = rd.displayName
    ? rd.displayName
    : rd.noOfSharing && rd.acType
      ? `${rd.noOfSharing}-Sharing-${rd.acType}`
      : rd.name || ""

  doc.text(`Room Details       : ${roomDisplay}`, marginX, y)
  y += 6
  doc.text(`Bed Number         : ${safe(booking.bedDetails?.bedNumber, "")}`, marginX, y)
  y += 6
  doc.text(`Room Rent          : INR ${formatINR(booking.roomDetails?.rent ?? booking.totalAmount ?? 0)}`, marginX, y)
  y += 6
  doc.text(`Deposit            : `, marginX, y)
  y += 6
  y = drawDivider(doc, marginX, contentWidth, y)

  // Payment Related (keep INR to avoid encoding issues)
  doc.setFont(undefined, "bold")
  doc.text("Payment Related", marginX, y)
  doc.setFont(undefined, "normal")
  y += 7
  const total = booking.totalAmount || 0
  const advance = booking.advanceAmount || 0
  const payableToOwner = Math.max(total - advance, 0)
  doc.text(`Total Payable             : INR ${formatINR(total)}`, marginX, y)
  y += 6
  doc.text(`Booking Amount Received   : INR ${formatINR(advance)}`, marginX, y)
  y += 6
  doc.text(`Payable to Direct Owner   : INR ${formatINR(payableToOwner)}`, marginX, y)
  y += 6
  doc.text(`Booking Status            : ${safe(booking.bookingStatus, "")}`, marginX, y)
  y += 8
  y = drawDivider(doc, marginX, contentWidth, y)

  // Booking Related General Information
  doc.setFont(undefined, "bold")
  doc.text("Booking Related General Information", marginX, y)
  y += 7
  doc.setFont(undefined, "normal")
  const paragraphs = doc.splitTextToSize(pdfTerms, contentWidth)

  paragraphs.forEach((line: string) => {
    if (y > 285) {
      doc.addPage()
      y = 15
    }
    doc.text(line, marginX, y)
    y += 6
  })

  const fileName = `Booking_${safe(booking.bookingId, booking._id || "details")}.pdf`
  doc.save(fileName)
}

const handleDownloadPDF = async (booking: any) => {
  try {
    await generateBookingPDF(booking)
  } catch (e) {
    console.log("[v0] PDF generation failed:", e)
  }
}

export default function BookingPage() {
  const { toast } = useToast()
  const router = useRouter()
  const [bookings, setBookings] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [paymentFilter, setPaymentFilter] = useState("all")
  const [stats, setStats] = useState({
    total: 0,
    confirmed: 0,
    pending: 0,
    totalRevenue: 0,
  })

  useEffect(() => {
    fetchBookings()
  }, [])

  const fetchBookings = async () => {
    try {
      setLoading(true)
      const response = await fetch("/api/booking?limit=1000")
      const result = await response.json()

      if (result.success) {
        setBookings(result.data)
        calculateStats(result.data)
      } else {
        toast({
          title: "Error",
          description: "Failed to fetch bookings",
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

  const filteredBookings = bookings.filter((booking: any) => {
    const matchesSearch =
      booking.student?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      booking.property?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      booking.bookingId?.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesStatus = statusFilter === "all" || booking.bookingStatus === statusFilter
    const matchesPayment = paymentFilter === "all" || booking.paymentStatus === paymentFilter

    return matchesSearch && matchesStatus && matchesPayment
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
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Booking Management</h1>
          <p className="text-muted-foreground">Manage hostel and PG bookings</p>
        </div>
        <Button onClick={() => router.push("/admin/booking/add")}>
          <Plus className="h-4 w-4 mr-2" />
          Add Booking
        </Button>
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
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by student name, property, or booking ID..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
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
        </CardContent>
      </Card>

      {/* Bookings Table */}
      <Card>
        <CardHeader>
          <CardTitle>All Bookings ({filteredBookings.length})</CardTitle>
          <CardDescription>Complete list of all bookings</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Booking ID</TableHead>
                  <TableHead>Student</TableHead>
                  <TableHead>Property</TableHead>
                  <TableHead>Room Details</TableHead>
                  <TableHead>Check-in</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Payment</TableHead>
                  <TableHead>Status</TableHead>
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
                          <span className="font-medium">{booking.student?.name}</span>
                          <span className="text-sm text-muted-foreground">{booking.student?.email}</span>
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
                          <span className="text-sm">{booking.roomDetails?.name || "Room details"}</span>
                          <span className="text-xs text-muted-foreground">
                            {booking.bedDetails?.bedNumber || "Bed details"}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>{new Date(booking.checkInDate).toLocaleDateString()}</TableCell>
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
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => router.push(`/admin/booking/view/${booking._id}`)}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => router.push(`/admin/booking/edit/${booking._id}`)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDownloadPDF(booking)}
                            aria-label="Download booking PDF"
                            title="Download PDF"
                          >
                            <Download className="h-4 w-4" />
                          </Button>
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button variant="outline" size="sm">
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                                <AlertDialogDescription>
                                  This action cannot be undone. This will permanently delete the booking and restore
                                  room availability.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction onClick={() => handleDelete(booking._id)}>Delete</AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
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
