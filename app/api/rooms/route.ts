import { type NextRequest, NextResponse } from "next/server"
import { connectDB } from "@/lib/db"
import VendorProperty from "@/lib/models/vendorproper"

// GET - Fetch rooms for a property (public endpoint, no authentication required)
export async function GET(request: NextRequest) {
  try {
    await connectDB()

    // Get propertyId from query parameters
    const { searchParams } = new URL(request.url)
    const propertyId = searchParams.get("propertyId")

    if (!propertyId) {
      return NextResponse.json({ success: false, error: "Property ID is required" }, { status: 400 })
    }

    const property = await VendorProperty.findOne({
      _id: propertyId,
      isActive: true,
    })

    if (!property) {
      return NextResponse.json({ success: false, error: "Property not found" }, { status: 404 })
    }

    // Filter active rooms only
    const activeRooms = property.rooms.filter((room: any) => room.isActive)

    return NextResponse.json({
      success: true,
      data: {
        property: {
          _id: property._id,
          name: property.name,
          propertyId: property.propertyId,
        },
        rooms: activeRooms,
      },
    })
  } catch (error: any) {
    console.error("Error fetching rooms:", error)
    return NextResponse.json({ success: false, error: "Failed to fetch rooms" }, { status: 500 })
  }
}
