import { type NextRequest, NextResponse } from "next/server"
import { connectDB } from "@/lib/db"
import { getCurrentStudentFromCookie } from "@/lib/auth"
import Booking from "@/lib/models/booking"
import VendorProperty from "@/lib/models/vendorproper"
import Student from "@/lib/models/student"
import mongoose from "mongoose"

// GET - Fetch single booking for current student
export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const student = await getCurrentStudentFromCookie()
    if (!student) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 })
    }

    await connectDB()

    const { id } = await params

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json({ success: false, error: "Invalid booking ID" }, { status: 400 })
    }

    // Find booking that belongs to current student
    const booking = await Booking.findOne({ _id: id, student: student._id })
      .populate("student", "name email phone college course year address parentContact")
      .populate("property", "name propertyId address city state rentRange")

    if (!booking) {
      return NextResponse.json({ success: false, error: "Booking not found" }, { status: 404 })
    }

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

    const bookingWithDetails = {
      ...booking.toObject(),
      roomDetails,
      bedDetails,
    }

    return NextResponse.json({
      success: true,
      data: bookingWithDetails,
    })
  } catch (error: any) {
    console.error("Error fetching student booking:", error)
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}

// DELETE - Cancel booking (student can only cancel pending bookings)
export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const student = await getCurrentStudentFromCookie()
    if (!student) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 })
    }

    await connectDB()

    const { id } = await params

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json({ success: false, error: "Invalid booking ID" }, { status: 400 })
    }

    // Find booking that belongs to current student
    const booking = await Booking.findOne({ _id: id, student: student._id })
    if (!booking) {
      return NextResponse.json({ success: false, error: "Booking not found" }, { status: 404 })
    }

    // Only allow cancellation of pending bookings
    if (booking.bookingStatus !== "pending") {
      return NextResponse.json(
        {
          success: false,
          error: "Only pending bookings can be cancelled",
        },
        { status: 400 },
      )
    }

    // Update booking status to cancelled
    booking.bookingStatus = "cancelled"
    await booking.save()

    // Restore bed availability if it was on hold
    if (booking.property && booking.room && booking.bed) {
      const property = await VendorProperty.findById(booking.property)
      if (property) {
        const room = property.rooms.id(booking.room)
        if (room) {
          const bed = room.beds.id(booking.bed)
          if (bed && bed.status === "onbook") {
            bed.status = "available"
            bed.studentName = ""
            bed.studentEmail = ""
            bed.studentPhone = ""
            bed.joiningDate = null
            await property.save()
          }
        }
      }
    }

    // Update student booking count
    await Student.findByIdAndUpdate(student._id, {
      $inc: { totalBookings: -1 },
      $unset: { currentBooking: 1 },
    })

    return NextResponse.json({
      success: true,
      message: "Booking cancelled successfully",
    })
  } catch (error: any) {
    console.error("Error cancelling student booking:", error)
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}
