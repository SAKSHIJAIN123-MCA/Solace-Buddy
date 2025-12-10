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

// GET - Fetch beds for a room for booking
export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string; roomId: string }> }) {
  try {
    await connectDB()

    const { id, roomId } = await params

    const adminId = await getAdminFromToken(request)
    if (!adminId) {
      return NextResponse.json({ success: false, error: "Admin authentication required" }, { status: 401 })
    }

    const property = await VendorProperty.findOne({
      _id: id,
      isActive: true,
    })

    if (!property) {
      return NextResponse.json({ success: false, error: "Property not found" }, { status: 404 })
    }

    const room = property.rooms.id(roomId)
    if (!room || !room.isActive) {
      return NextResponse.json({ success: false, error: "Room not found" }, { status: 404 })
    }

    // Format beds with their status for booking dropdown
    const bedsWithStatus = room.beds.map((bed) => ({
      _id: bed._id,
      bedNumber: bed.bedNumber,
      status: bed.status,
      studentName: bed.studentName || null,
      isBookable: bed.status === "available",
    }))

    return NextResponse.json({
      success: true,
      data: {
        room: {
          _id: room._id,
          roomNumber: room.roomNumber,
          name: room.name,
          roomType: room.roomType,
          rent: room.rent,
        },
        beds: bedsWithStatus,
      },
    })
  } catch (error: any) {
    console.error("Error fetching beds for booking:", error)
    return NextResponse.json({ success: false, error: "Failed to fetch beds" }, { status: 500 })
  }
}
