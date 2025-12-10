import { type NextRequest, NextResponse } from "next/server"
import { connectDB } from "@/lib/db"
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

// GET - Fetch all rooms for a property
export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    await connectDB()

    const vendorId = await getVendorFromToken(request)
    if (!vendorId) {
      return NextResponse.json({ success: false, error: "Authentication required" }, { status: 401 })
    }

    const property = await VendorProperty.findOne({
      _id: params.id,
      vendorId,
      isActive: true,
    })

    if (!property) {
      return NextResponse.json({ success: false, error: "Property not found" }, { status: 404 })
    }

    // Filter active rooms
    const activeRooms = property.rooms.filter((room) => room.isActive)

    return NextResponse.json({
      success: true,
      data: {
        property: {
          _id: property._id,
          name: property.name,
          propertyId: property.propertyId,
          type: property.type,
        },
        rooms: activeRooms,
      },
    })
  } catch (error: any) {
    console.error("Error fetching rooms:", error)
    return NextResponse.json({ success: false, error: "Failed to fetch rooms" }, { status: 500 })
  }
}

// POST - Add new room to property
export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    await connectDB()

    const vendorId = await getVendorFromToken(request)
    if (!vendorId) {
      return NextResponse.json({ success: false, error: "Authentication required" }, { status: 401 })
    }

    const body = await request.json()
    console.log("Received room data:", body)

    if (!body.noOfSharing || ![1, 2, 3, 4, 5, 6, 7].includes(Number.parseInt(body.noOfSharing))) {
      return NextResponse.json(
        { success: false, error: "Number of sharing is required and must be between 1-7" },
        { status: 400 },
      )
    }

    if (!body.acType || !["AC", "Non AC"].includes(body.acType)) {
      return NextResponse.json({ success: false, error: "AC type is required (AC or Non AC)" }, { status: 400 })
    }

    if (!body.bedSize || !["Single", "Double", "Other"].includes(body.bedSize)) {
      return NextResponse.json(
        { success: false, error: "Bed size is required (Single, Double, or Other)" },
        { status: 400 },
      )
    }

    if (!body.totalBeds || body.totalBeds < 1) {
      return NextResponse.json({ success: false, error: "Total beds must be at least 1" }, { status: 400 })
    }

    if (!body.rent || body.rent <= 0) {
      return NextResponse.json(
        { success: false, error: "Monthly rent is required and must be greater than 0" },
        { status: 400 },
      )
    }

    const property = await VendorProperty.findOne({
      _id: params.id,
      vendorId,
      isActive: true,
    })

    if (!property) {
      return NextResponse.json({ success: false, error: "Property not found" }, { status: 404 })
    }

    // Check if room number already exists (only among active rooms) - only if roomNumber is provided
    if (body.roomNumber && body.roomNumber.trim()) {
      const existingRoom = property.rooms.find(
        (room) => room.roomNumber && room.roomNumber.toLowerCase() === body.roomNumber.toLowerCase() && room.isActive,
      )

      if (existingRoom) {
        return NextResponse.json(
          {
            success: false,
            error: `Room number "${body.roomNumber}" already exists. Please use a different room number.`,
          },
          { status: 400 },
        )
      }
    }

    // Create beds array
    const beds = []
    for (let i = 1; i <= body.totalBeds; i++) {
      beds.push({
        bedNumber: `bed-${i}`,
        status: "available",
      })
    }

    const displayName = `${body.noOfSharing}-Sharing-${body.acType}`

    const newRoom = {
      roomNumber: body.roomNumber?.trim() || "",
      name: body.name?.trim() || "",
      noOfSharing: Number.parseInt(body.noOfSharing),
      acType: body.acType,
      bedSize: body.bedSize,
      displayName,
      totalBeds: Number.parseInt(body.totalBeds),
      occupiedBeds: 0,
      availableBeds: Number.parseInt(body.totalBeds),
      onNoticeBeds: 0,
      onBookBeds: 0,
      rent: Number.parseFloat(body.rent),
      bathroomType: body.bathroomType || "common",
      amenities: [], // Removed from room level
      description: body.description || "",
      balcony: body.balcony || false,
      isActive: true,
      beds,
    }

    console.log("Creating room with data:", newRoom)

    property.rooms.push(newRoom)

    // Save the property - this will trigger the pre-save hook to recalculate stats
    await property.save()

    return NextResponse.json({
      success: true,
      data: newRoom,
      message: "Room added successfully",
    })
  } catch (error: any) {
    console.error("Error adding room:", error)

    // Handle validation errors specifically
    if (error.name === "ValidationError") {
      const validationErrors = Object.values(error.errors).map((err: any) => err.message)
      return NextResponse.json(
        { success: false, error: `Validation failed: ${validationErrors.join(", ")}` },
        { status: 400 },
      )
    }

    return NextResponse.json({ success: false, error: error.message || "Failed to add room" }, { status: 500 })
  }
}
