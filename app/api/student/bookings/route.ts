import { type NextRequest, NextResponse } from "next/server"
import { connectDB } from "@/lib/db"
import { getCurrentStudentFromCookie } from "@/lib/auth"
import Booking from "@/lib/models/booking"
import VendorProperty from "@/lib/models/vendorproper"

// GET - Fetch bookings for current student
export async function GET(request: NextRequest) {
  try {
    const student = await getCurrentStudentFromCookie()
    if (!student) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 })
    }

    await connectDB()

    const { searchParams } = new URL(request.url)
    const page = Number.parseInt(searchParams.get("page") || "1")
    const limit = Number.parseInt(searchParams.get("limit") || "10")
    const skip = (page - 1) * limit

    // Get bookings for current student only
    const bookings = await Booking.find({ student: student._id })
      .populate("property", "name propertyId address city state rentRange")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)

    const total = await Booking.countDocuments({ student: student._id })

    // Get room and bed details for each booking
    const bookingsWithDetails = await Promise.all(
      bookings.map(async (booking: any) => {
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

    // Get statistics for current student
    const stats = await Booking.aggregate([
      { $match: { student: student._id } },
      {
        $group: {
          _id: "$bookingStatus",
          count: { $sum: 1 },
        },
      },
    ])

    const statistics = {
      total,
      confirmed: stats.find((s) => s._id === "confirmed")?.count || 0,
      pending: stats.find((s) => s._id === "pending")?.count || 0,
      cancelled: stats.find((s) => s._id === "cancelled")?.count || 0,
      completed: stats.find((s) => s._id === "completed")?.count || 0,
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
    console.error("Error fetching student bookings:", error)
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}
