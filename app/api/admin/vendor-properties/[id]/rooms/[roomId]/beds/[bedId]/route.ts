import { type NextRequest, NextResponse } from "next/server"
import { connectDB } from "@/lib/db"
import VendorProperty from "@/lib/models/vendorproper"
import jwt from "jsonwebtoken"

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key"

// Helper function to get admin from token
async function getAdminFromToken(request: NextRequest) {
  try {
    const token = request.cookies.get("admin-token")?.value
    if (!token) {
      return null
    }

    const decoded = jwt.verify(token, JWT_SECRET) as any
    return decoded.adminId
  } catch (error) {
    return null
  }
}

// PUT - Update bed status (admin can update any bed)
export async function PUT(request: NextRequest, { params }: { params: { id: string; roomId: string; bedId: string } }) {
  try {
    await connectDB()

    const adminId = await getAdminFromToken(request)
    if (!adminId) {
      return NextResponse.json({ success: false, error: "Admin authentication required" }, { status: 401 })
    }

    const body = await request.json()
    console.log("Received bed update data:", body)

    const property = await VendorProperty.findOne({
      _id: params.id,
      isActive: true,
    })

    if (!property) {
      return NextResponse.json({ success: false, error: "Property not found" }, { status: 404 })
    }

    const room = property.rooms.id(params.roomId)
    if (!room || !room.isActive) {
      return NextResponse.json({ success: false, error: "Room not found" }, { status: 404 })
    }

    const bed = room.beds.id(params.bedId)
    if (!bed) {
      return NextResponse.json({ success: false, error: "Bed not found" }, { status: 404 })
    }

    // Validate status
    const validStatuses = ["available", "occupied", "onbook", "notice", "maintenance"]
    if (!validStatuses.includes(body.status)) {
      return NextResponse.json({ success: false, error: "Invalid bed status" }, { status: 400 })
    }

    // Update bed details
    bed.status = body.status
    bed.studentName = body.studentName || ""
    bed.studentPhone = body.studentPhone || ""
    bed.studentEmail = body.studentEmail || ""
    bed.joiningDate = body.joiningDate || null
    bed.rentDueDate = body.rentDueDate || null
    bed.securityDeposit = body.securityDeposit || 0
    bed.advanceRent = body.advanceRent || 0
    bed.noticeDate = body.noticeDate || null
    bed.vacatingDate = body.vacatingDate || null
    bed.notes = body.notes || ""

    // Save the property - this will trigger the pre-save hook to recalculate stats
    await property.save()

    return NextResponse.json({
      success: true,
      data: bed,
      message: "Bed status updated successfully",
    })
  } catch (error: any) {
    console.error("Error updating bed:", error)
    return NextResponse.json({ success: false, error: error.message || "Failed to update bed" }, { status: 500 })
  }
}
