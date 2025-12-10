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

// GET - Fetch properties with room and bed counts for booking
export async function GET(request: NextRequest) {
  try {
    await connectDB()

    const adminId = await getAdminFromToken(request)
    if (!adminId) {
      return NextResponse.json({ success: false, error: "Admin authentication required" }, { status: 401 })
    }

    const properties = await VendorProperty.find({
      isActive: true,
    }).select("name propertyId rentRange totalRooms totalBeds availableBeds occupiedBeds")

    // Format properties for booking dropdown
    const formattedProperties = properties.map((property) => ({
      _id: property._id,
      name: property.name,
      propertyId: property.propertyId,
      rentRange: property.rentRange,
      totalRooms: property.totalRooms,
      totalBeds: property.totalBeds,
      availableBeds: property.availableBeds,
      occupiedBeds: property.occupiedBeds,
      price: property.rentRange?.min || 0,
      roomsCount: property.totalRooms,
    }))

    return NextResponse.json({
      success: true,
      data: formattedProperties,
    })
  } catch (error: any) {
    console.error("Error fetching properties for booking:", error)
    return NextResponse.json({ success: false, error: "Failed to fetch properties" }, { status: 500 })
  }
}
