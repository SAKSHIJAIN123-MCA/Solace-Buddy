import { type NextRequest, NextResponse } from "next/server"
import { connectDB } from "@/lib/db"
import Booking from "@/lib/models/booking"
import Student from "@/lib/models/student"
import VendorProperty from "@/lib/models/vendorproper"
import mongoose from "mongoose"
import { normalizePaymentStatus } from "@/lib/models/booking"

// GET - Fetch single booking record
export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    await connectDB()

    const { id } = params

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json({ success: false, error: "Invalid booking ID" }, { status: 400 })
    }

    const booking = await Booking.findById(id)
      .populate("student", "name email phone college course year address parentContact")
      .populate("property", "name propertyId address city state rentRange")

    if (!booking) {
      return NextResponse.json({ success: false, error: "Booking record not found" }, { status: 404 })
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
    console.error("Error fetching booking record:", error)
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}

// PUT - Update booking record
export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    await connectDB()

    const { id } = params

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json({ success: false, error: "Invalid booking ID" }, { status: 400 })
    }

    const body = await request.json()
    console.log("Update booking record request body:", body)

    // Get the existing booking
    const existingBooking = await Booking.findById(id)
    if (!existingBooking) {
      return NextResponse.json({ success: false, error: "Booking record not found" }, { status: 404 })
    }

    if (body.property && body.property !== existingBooking.property.toString()) {
      console.log("Property changed, updating bed availability")

      // Restore old bed to available
      if (existingBooking.property && existingBooking.room && existingBooking.bed) {
        const oldProperty = await VendorProperty.findById(existingBooking.property)
        if (oldProperty) {
          const oldRoom = oldProperty.rooms.id(existingBooking.room)
          if (oldRoom) {
            const oldBed = oldRoom.beds.id(existingBooking.bed)
            if (oldBed) {
              oldBed.status = "available"
              oldBed.studentName = ""
              oldBed.studentEmail = ""
              oldBed.studentPhone = ""
              oldBed.joiningDate = null
              oldBed.rentDueDate = null
              await oldProperty.save()
            }
          }
        }
      }

      // Update new bed to occupied
      if (body.room && body.bed) {
        const newProperty = await VendorProperty.findById(body.property)
        if (!newProperty) {
          return NextResponse.json({ success: false, error: "New property not found" }, { status: 400 })
        }

        const newRoom = newProperty.rooms.id(body.room)
        if (!newRoom) {
          return NextResponse.json({ success: false, error: "New room not found" }, { status: 400 })
        }

        const newBed = newRoom.beds.id(body.bed)
        if (!newBed) {
          return NextResponse.json({ success: false, error: "New bed not found" }, { status: 400 })
        }

        if (newBed.status !== "available") {
          return NextResponse.json({ success: false, error: "Selected bed is not available" }, { status: 400 })
        }

        const student = await Student.findById(body.student || existingBooking.student)
        newBed.status = "occupied"
        newBed.studentName = student?.name || ""
        newBed.studentEmail = student?.email || ""
        newBed.studentPhone = student?.phone || ""
        newBed.joiningDate = body.checkInDate || existingBooking.checkInDate
        const checkInForRent = new Date(body.checkInDate || existingBooking.checkInDate)
        newBed.rentDueDate = new Date(checkInForRent)
        newBed.rentDueDate.setMonth(newBed.rentDueDate.getMonth() + 1)

        await newProperty.save()
      }
    }

    // Calculate remaining amount
    const totalAmount = body.totalAmount || existingBooking.totalAmount
    const advanceAmount = body.advanceAmount || existingBooking.advanceAmount
    const remainingAmount = totalAmount - advanceAmount

    // Update the booking record
    const updatedData = {
      ...body,
      ...(body?.paymentStatus ? { paymentStatus: normalizePaymentStatus(body.paymentStatus) } : {}),
      remainingAmount,
      updatedAt: new Date(),
    }

    console.log("Updating booking record with data:", updatedData)

    const booking = await Booking.findByIdAndUpdate(id, updatedData, { new: true, runValidators: true })
      .populate("student", "name email phone college course")
      .populate("property", "name propertyId rentRange address city state")

    console.log("Booking record updated successfully:", booking)

    return NextResponse.json({
      success: true,
      data: booking,
      message: "Booking record updated successfully",
    })
  } catch (error: any) {
    console.error("Error updating booking record:", error)

    if (error.name === "ValidationError") {
      const errors = Object.values(error.errors).map((err: any) => err.message)
      return NextResponse.json({ success: false, error: errors.join(", ") }, { status: 400 })
    }

    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}

// DELETE - Delete booking record
export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    await connectDB()

    const { id } = params

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json({ success: false, error: "Invalid booking ID" }, { status: 400 })
    }

    const booking = await Booking.findById(id)
    if (!booking) {
      return NextResponse.json({ success: false, error: "Booking record not found" }, { status: 404 })
    }

    if (booking.property && booking.room && booking.bed) {
      const property = await VendorProperty.findById(booking.property)
      if (property) {
        const room = property.rooms.id(booking.room)
        if (room) {
          const bed = room.beds.id(booking.bed)
          if (bed) {
            bed.status = "available"
            bed.studentName = ""
            bed.studentEmail = ""
            bed.studentPhone = ""
            bed.joiningDate = null
            bed.rentDueDate = null
            await property.save()
          }
        }
      }
    }

    // Update student booking count
    await Student.findByIdAndUpdate(booking.student, {
      $inc: { totalBookings: -1 },
      $unset: { currentBooking: 1 },
    })

    await Booking.findByIdAndDelete(id)

    return NextResponse.json({
      success: true,
      message: "Booking record deleted successfully",
    })
  } catch (error: any) {
    console.error("Error deleting booking record:", error)
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}
