import { type NextRequest, NextResponse } from "next/server"
import { connectDB } from "@/lib/db"
import Booking from "@/lib/models/booking"
import Student from "@/lib/models/student"
import VendorProperty from "@/lib/models/vendorproper"
import { normalizePaymentStatus } from "@/lib/models/booking"

// GET - Fetch all booking records
export async function GET(request: NextRequest) {
  try {
    await connectDB()

    const { searchParams } = new URL(request.url)
    const search = searchParams.get("search") || ""
    const status = searchParams.get("status") || "all"
    const paymentStatusRaw = searchParams.get("paymentStatus") || "all"
    const paymentStatus = paymentStatusRaw === "all" ? "all" : normalizePaymentStatus(paymentStatusRaw)
    const source = searchParams.get("source") || "all"
    const page = Number.parseInt(searchParams.get("page") || "1")
    const limit = Number.parseInt(searchParams.get("limit") || "10")
    const skip = (page - 1) * limit

    // Build query
    const query: any = {}

    if (status !== "all") {
      query.bookingStatus = status
    }

    if (paymentStatus !== "all") {
      query.paymentStatus = paymentStatus
    }

    if (source !== "all") {
      query.bookingSource = source
    }

    // Get booking records with populated data
    let bookingQuery = Booking.find(query)
      .populate("student", "name email phone college course")
      .populate("property", "name propertyId rentRange address city state")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)

    // Add search functionality
    if (search) {
      const students = await Student.find({
        $or: [{ name: { $regex: search, $options: "i" } }, { email: { $regex: search, $options: "i" } }],
      }).select("_id")

      const properties = await VendorProperty.find({
        name: { $regex: search, $options: "i" },
      }).select("_id")

      const studentIds = students.map((s) => s._id)
      const propertyIds = properties.map((p) => p._id)

      query.$or = [
        { bookingId: { $regex: search, $options: "i" } },
        { student: { $in: studentIds } },
        { property: { $in: propertyIds } },
      ]

      bookingQuery = Booking.find(query)
        .populate("student", "name email phone college course")
        .populate("property", "name propertyId rentRange address city state")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
    }

    const bookingRecords = await bookingQuery
    const total = await Booking.countDocuments(query)

    const bookingsWithDetails = await Promise.all(
      bookingRecords.map(async (booking: any) => {
        let roomDetails = null
        let bedDetails = null

        if (booking.property && booking.room && booking.bed) {
          const property = await VendorProperty.findById(booking.property)
          if (property) {
            const room = property.rooms.id(booking.room)
            if (room) {
              roomDetails = {
                _id: room._id,
                roomNumber: room.roomNumber,
                name: room.name,
                roomType: room.roomType,
                rent: room.rent,
              }

              const bed = room.beds.id(booking.bed)
              if (bed) {
                bedDetails = {
                  _id: bed._id,
                  bedNumber: bed.bedNumber,
                  status: bed.status,
                }
              }
            }
          }
        }

        return {
          ...booking.toObject(),
          roomDetails,
          bedDetails,
        }
      }),
    )

    // Get statistics
    const stats = await Booking.aggregate([
      {
        $group: {
          _id: "$bookingStatus",
          count: { $sum: 1 },
        },
      },
    ])

    const paymentStats = await Booking.aggregate([
      {
        $group: {
          _id: "$paymentStatus",
          count: { $sum: 1 },
        },
      },
    ])

    const revenueStats = await Booking.aggregate([
      {
        $group: {
          _id: null,
          totalRevenue: { $sum: "$totalAmount" },
          totalAdvance: { $sum: "$advanceAmount" },
          totalPending: { $sum: "$remainingAmount" },
        },
      },
    ])

    const pendingCount =
      (paymentStats.find((s: any) => s._id === "Pending")?.count || 0) +
      (paymentStats.find((s: any) => s._id === "pending")?.count || 0)
    const partialCount =
      (paymentStats.find((s: any) => s._id === "Partially Paid")?.count || 0) +
      (paymentStats.find((s: any) => s._id === "Booking Amount Paid")?.count || 0) +
      (paymentStats.find((s: any) => s._id === "partial")?.count || 0)
    const completedCount =
      (paymentStats.find((s: any) => s._id === "Full Amount Paid")?.count || 0) +
      (paymentStats.find((s: any) => s._id === "completed")?.count || 0)

    const statistics = {
      total,
      confirmed: stats.find((s: any) => s._id === "confirmed")?.count || 0,
      pending: stats.find((s: any) => s._id === "pending")?.count || 0,
      cancelled: stats.find((s: any) => s._id === "cancelled")?.count || 0,
      completed: stats.find((s: any) => s._id === "completed")?.count || 0,
      paymentPending: pendingCount,
      paymentPartial: partialCount,
      paymentCompleted: completedCount,
      totalRevenue: revenueStats[0]?.totalRevenue || 0,
      totalAdvance: revenueStats[0]?.totalAdvance || 0,
      totalPending: revenueStats[0]?.totalPending || 0,
    }

    return NextResponse.json({
      success: true,
      data: bookingsWithDetails,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
      statistics,
    })
  } catch (error: any) {
    console.error("Error fetching booking records:", error)
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}

// POST - Create new booking record
export async function POST(request: NextRequest) {
  try {
    await connectDB()

    const body = await request.json()

    // Validate student exists
    const student = await Student.findById(body.student)
    if (!student) {
      return NextResponse.json({ success: false, error: "Student not found" }, { status: 400 })
    }

    // Validate property exists
    const property = await VendorProperty.findById(body.property)
    if (!property) {
      return NextResponse.json({ success: false, error: "Property not found" }, { status: 400 })
    }

    // Validate room exists
    const room = property.rooms.id(body.room)
    if (!room || !room.isActive) {
      return NextResponse.json({ success: false, error: "Room not found" }, { status: 400 })
    }

    // Validate bed exists and is available
    const bed = room.beds.id(body.bed)
    if (!bed) {
      return NextResponse.json({ success: false, error: "Bed not found" }, { status: 400 })
    }

    if (bed.status !== "available") {
      return NextResponse.json({ success: false, error: "Selected bed is not available for booking" }, { status: 400 })
    }

    // Create booking
    const booking = new Booking(body)
    await booking.save()

    bed.status = "occupied"
    bed.studentName = student.name
    bed.studentEmail = student.email
    bed.studentPhone = student.phone
    bed.joiningDate = body.checkInDate
    bed.rentDueDate = new Date(body.checkInDate)
    bed.rentDueDate.setMonth(bed.rentDueDate.getMonth() + 1)

    // Save property to trigger stats recalculation
    await property.save()

    // Update student booking count
    await Student.findByIdAndUpdate(body.student, {
      $inc: { totalBookings: 1 },
      currentBooking: property.name,
    })

    // Populate the created booking
    const populatedBooking = await Booking.findById(booking._id)
      .populate("student", "name email phone college course")
      .populate("property", "name propertyId rentRange address city state")

    return NextResponse.json(
      {
        success: true,
        data: populatedBooking,
        message: "Booking record created successfully",
      },
      { status: 201 },
    )
  } catch (error: any) {
    console.error("Error creating booking record:", error)

    if (error.name === "ValidationError") {
      const errors = Object.values(error.errors).map((err: any) => err.message)
      return NextResponse.json({ success: false, error: errors.join(", ") }, { status: 400 })
    }

    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}
