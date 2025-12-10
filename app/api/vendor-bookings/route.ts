import { type NextRequest, NextResponse } from "next/server"
import { connectDB } from "@/lib/db"
import Booking from "@/lib/models/booking"
import Student from "@/lib/models/student"
import VendorProperty from "@/lib/models/vendorproper"
import jwt from "jsonwebtoken"

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key"

// Helper function to get vendor from token
async function getVendorFromToken(request: NextRequest) {
  try {
    const token = request.cookies.get("vendor-token")?.value
    if (!token) {
      return null
    }

    const decoded = jwt.verify(token, JWT_SECRET) as any
    return decoded.vendorId
  } catch (error) {
    return null
  }
}

// GET - Fetch bookings for vendor's properties only
export async function GET(request: NextRequest) {
  try {
    await connectDB()

    const vendorId = await getVendorFromToken(request)
    if (!vendorId) {
      return NextResponse.json({ success: false, error: "Vendor authentication required" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const search = searchParams.get("search") || ""
    const status = searchParams.get("status") || "all"
    const paymentStatus = searchParams.get("paymentStatus") || "all"
    const startDate = searchParams.get("startDate")
    const endDate = searchParams.get("endDate")
    const page = Number.parseInt(searchParams.get("page") || "1")
    const limit = Number.parseInt(searchParams.get("limit") || "10")
    const skip = (page - 1) * limit

    // Get all properties owned by this vendor
    const vendorProperties = await VendorProperty.find({ vendorId }).select("_id")
    const propertyIds = vendorProperties.map((p) => p._id)

    if (propertyIds.length === 0) {
      return NextResponse.json({
        success: true,
        data: [],
        pagination: { page, limit, total: 0, pages: 0 },
        statistics: {
          total: 0,
          confirmed: 0,
          pending: 0,
          cancelled: 0,
          completed: 0,
          paymentPending: 0,
          paymentPartial: 0,
          paymentCompleted: 0,
          totalRevenue: 0,
          totalAdvance: 0,
          totalPending: 0,
        },
      })
    }

    // Build query - only include bookings for vendor's properties
    const query: any = {
      property: { $in: propertyIds },
    }

    if (status !== "all") {
      query.bookingStatus = status
    }

    if (paymentStatus !== "all") {
      query.paymentStatus = paymentStatus
    }

    // Date filter
    if (startDate || endDate) {
      query.checkInDate = {}
      if (startDate) {
        query.checkInDate.$gte = new Date(startDate)
      }
      if (endDate) {
        query.checkInDate.$lte = new Date(endDate)
      }
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
        _id: { $in: propertyIds },
        name: { $regex: search, $options: "i" },
      }).select("_id")

      const studentIds = students.map((s) => s._id)
      const searchPropertyIds = properties.map((p) => p._id)

      query.$or = [
        { bookingId: { $regex: search, $options: "i" } },
        { student: { $in: studentIds } },
        { property: { $in: searchPropertyIds } },
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
                displayName: room.displayName,
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

    // Get statistics for vendor's properties only
    const stats = await Booking.aggregate([
      { $match: { property: { $in: propertyIds } } },
      {
        $group: {
          _id: "$bookingStatus",
          count: { $sum: 1 },
        },
      },
    ])

    const paymentStats = await Booking.aggregate([
      { $match: { property: { $in: propertyIds } } },
      {
        $group: {
          _id: "$paymentStatus",
          count: { $sum: 1 },
        },
      },
    ])

    const revenueStats = await Booking.aggregate([
      { $match: { property: { $in: propertyIds } } },
      {
        $group: {
          _id: null,
          totalRevenue: { $sum: "$totalAmount" },
          totalAdvance: { $sum: "$advanceAmount" },
          totalPending: { $sum: "$remainingAmount" },
        },
      },
    ])

    const statistics = {
      total,
      confirmed: stats.find((s) => s._id === "confirmed")?.count || 0,
      pending: stats.find((s) => s._id === "pending")?.count || 0,
      cancelled: stats.find((s) => s._id === "cancelled")?.count || 0,
      completed: stats.find((s) => s._id === "completed")?.count || 0,
      paymentPending: paymentStats.find((s) => s._id === "pending")?.count || 0,
      paymentPartial: paymentStats.find((s) => s._id === "partial")?.count || 0,
      paymentCompleted: paymentStats.find((s) => s._id === "completed")?.count || 0,
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
    console.error("Error fetching vendor booking records:", error)
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}

export async function PATCH(request: NextRequest) {
  try {
    await connectDB()

    const vendorId = await getVendorFromToken(request)
    if (!vendorId) {
      return NextResponse.json({ success: false, error: "Vendor authentication required" }, { status: 401 })
    }

    const body = await request.json()
    const { bookingId, bookingStatus } = body

    if (!bookingId || !bookingStatus) {
      return NextResponse.json({ success: false, error: "Booking ID and status are required" }, { status: 400 })
    }

    // Validate booking status
    const validStatuses = ["pending", "confirmed", "cancelled", "completed"]
    if (!validStatuses.includes(bookingStatus)) {
      return NextResponse.json({ success: false, error: "Invalid booking status" }, { status: 400 })
    }

    // Get vendor's properties
    const vendorProperties = await VendorProperty.find({ vendorId }).select("_id")
    const propertyIds = vendorProperties.map((p) => p._id)

    // Find booking and verify it belongs to vendor
    const booking = await Booking.findById(bookingId)

    if (!booking) {
      return NextResponse.json({ success: false, error: "Booking not found" }, { status: 404 })
    }

    if (!propertyIds.some((id) => id.equals(booking.property))) {
      return NextResponse.json(
        { success: false, error: "Unauthorized: This booking does not belong to your properties" },
        { status: 403 },
      )
    }

    // Update booking status
    booking.bookingStatus = bookingStatus
    await booking.save()

    return NextResponse.json({
      success: true,
      message: "Booking status updated successfully",
      data: booking,
    })
  } catch (error: any) {
    console.error("Error updating booking status:", error)
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}
