import { type NextRequest, NextResponse } from "next/server"
import { connectDB } from "@/lib/db"
import Booking from "@/lib/models/booking"
import Student from "@/lib/models/student"
import VendorProperty from "@/lib/models/vendorproper"

// POST - Create new booking record from frontend form
export async function POST(request: NextRequest) {
  try {
    await connectDB()

    const body = await request.json()
    console.log("Frontend booking request:", body)

    if (!body.name || !body.email || !body.mobileNumber) {
      const errors = []
      if (!body.name) errors.push("Name is required")
      if (!body.email) errors.push("Email is required")
      if (!body.mobileNumber) errors.push("Mobile number is required")

      return NextResponse.json({ success: false, error: errors.join(", ") }, { status: 400 })
    }

    const phoneRegex = /^[0-9]{10}$/
    if (!phoneRegex.test(body.mobileNumber)) {
      return NextResponse.json({ success: false, error: "Please enter a valid 10-digit phone number" }, { status: 400 })
    }

    // For now, we create/find student but only if proper credentials are provided
    const student = await Student.findOne({
      $or: [{ email: body.email }, { phone: body.mobileNumber }],
    })

    if (!student) {
      return NextResponse.json({ success: false, error: "Please login" }, { status: 401 })
    }

    // Validate property exists
    const property = await VendorProperty.findById(body.propertyId)
    if (!property) {
      return NextResponse.json({ success: false, error: "Property not found" }, { status: 400 })
    }

    // Validate room exists
    const room = property.rooms.id(body.roomId)
    if (!room || !room.isActive) {
      return NextResponse.json({ success: false, error: "Room not found" }, { status: 400 })
    }

    // Validate bed exists
    const bed = room.beds.id(body.bedId)
    if (!bed) {
      return NextResponse.json({ success: false, error: "Bed not found" }, { status: 400 })
    }

    const checkInDate = new Date(body.checkInDate)
    const checkOutDate = new Date(checkInDate)
    checkOutDate.setMonth(checkOutDate.getMonth() + 1)

    const bookingData = {
      student: student._id,
      property: body.propertyId,
      room: body.roomId,
      bed: body.bedId,
      checkInDate: checkInDate,
      totalAmount: body.totalAmount,
      advanceAmount: body.advanceAmount,
      remainingAmount: body.totalAmount - body.advanceAmount,
      paymentMethod: "Online",
      paymentStatus: "pending",
      bookingStatus: "pending",
      bookingSource: "frontend",
      specialRequests: body.specialRequests || "",
      notes: `Frontend booking from ${body.name} - ${body.email}`,
    }

    const booking = new Booking(bookingData)
    await booking.save()

    if (bed.status === "available") {
      bed.status = "onbook"
      bed.studentName = student.name
      bed.bookingDate = checkInDate
      bed.rentDueDate = new Date(checkInDate)
      bed.rentDueDate.setMonth(bed.rentDueDate.getMonth() + 1)
    }

    await property.save()

    await Student.findByIdAndUpdate(student._id, {
      $inc: { totalBookings: 1 },
      currentBooking: property.name,
    })

    const populatedBooking = await Booking.findById(booking._id)
      .populate("student", "name email phone college course")
      .populate("property", "name propertyId city state")

    return NextResponse.json(
      {
        success: true,
        data: populatedBooking,
        message:
          "Your booking request is submitted. One of our executives will contact you for further process. In case of Urgent Booking, call us on +91-9662347192",
      },
      { status: 201 },
    )
  } catch (error: any) {
    console.error("Error creating frontend booking:", error)

    if (error.name === "ValidationError") {
      const errors = Object.values(error.errors).map((err: any) => err.message)
      return NextResponse.json({ success: false, error: errors.join(", ") }, { status: 400 })
    }

    return NextResponse.json({ success: false, error: error.message || "An error occurred" }, { status: 500 })
  }
}
