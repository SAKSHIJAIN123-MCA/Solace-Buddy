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

// GET - Fetch rooms for a property for booking
export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await connectDB()

    const { id } = await params

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

    // Filter active rooms and only include rooms with available beds
    const availableRooms = property.rooms
      .filter((room) => room.isActive && room.availableBeds > 0)
      .map((room) => ({
        _id: room._id,
        roomNumber: room.roomNumber,
        name: room.name,
        roomType: room.roomType,
        rent: room.rent,
        totalBeds: room.totalBeds,
        availableBeds: room.availableBeds,
        occupiedBeds: room.occupiedBeds,
        onBookBeds: room.onBookBeds,
        onNoticeBeds: room.onNoticeBeds,
      }))

    return NextResponse.json({
      success: true,
      data: availableRooms,
    })
  } catch (error: any) {
    console.error("Error fetching rooms for booking:", error)
    return NextResponse.json({ success: false, error: "Failed to fetch rooms" }, { status: 500 })
  }
}
