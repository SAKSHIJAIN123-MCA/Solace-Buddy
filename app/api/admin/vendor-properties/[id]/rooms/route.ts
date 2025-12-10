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

// GET - Fetch rooms for a property (admin can access any property's rooms)
export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    await connectDB()

    const adminId = await getAdminFromToken(request)
    if (!adminId) {
      return NextResponse.json({ success: false, error: "Admin authentication required" }, { status: 401 })
    }

    const property = await VendorProperty.findOne({
      _id: params.id,
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
        },
        rooms: activeRooms,
      },
    })
  } catch (error: any) {
    console.error("Error fetching rooms:", error)
    return NextResponse.json({ success: false, error: "Failed to fetch rooms" }, { status: 500 })
  }
}

// POST - Add new room (admin can add rooms to any property)
export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    await connectDB()

    const adminId = await getAdminFromToken(request)
    if (!adminId) {
      return NextResponse.json({ success: false, error: "Admin authentication required" }, { status: 401 })
    }

    const body = await request.json()
    console.log("Received room data:", JSON.stringify(body, null, 2))

    const validatedData = validateRoomData(body)
    if (!validatedData) {
      return NextResponse.json(
        {
          success: false,
          error:
            "Invalid room data. Please check number of sharing (1-7), AC type (AC/Non AC), and bed size (Single/Double/Other)",
        },
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
      isActive: true,
    })

    if (!property) {
      return NextResponse.json({ success: false, error: "Property not found" }, { status: 404 })
    }

    // Create beds array
    const beds = []
    for (let i = 1; i <= body.totalBeds; i++) {
      beds.push({
        bedNumber: `bed-${i}`,
        status: "available",
      })
    }

    const displayName = `${validatedData.noOfSharing}-Sharing-${validatedData.acType}`

    const newRoom = {
      roomNumber: body.roomNumber?.trim() || "",
      name: body.name?.trim() || "",
      noOfSharing: validatedData.noOfSharing,
      acType: validatedData.acType,
      bedSize: validatedData.bedSize,
      displayName: displayName,
      totalBeds: Number.parseInt(body.totalBeds),
      rent: Number.parseFloat(body.rent),
      bathroomType: body.bathroomType || "common",
      description: body.description || "",
      balcony: body.balcony || false,
      beds: beds,
      occupiedBeds: 0,
      availableBeds: Number.parseInt(body.totalBeds),
      onBookBeds: 0,
      onNoticeBeds: 0,
      isActive: true,
    }

    console.log("Creating room with new data structure:", JSON.stringify(newRoom, null, 2))

    property.rooms.push(newRoom)
    await property.save()

    return NextResponse.json({
      success: true,
      data: newRoom,
      message: "Room added successfully",
    })
  } catch (error: any) {
    console.error("Error adding room:", error)

    if (error.name === "ValidationError") {
      console.error("Validation error details:", error.errors)
      const validationErrors = Object.values(error.errors).map((err: any) => err.message)
      return NextResponse.json(
        {
          success: false,
          error: `Validation failed: ${validationErrors.join(", ")}`,
          validationDetails: error.errors,
        },
        { status: 400 },
      )
    }

    return NextResponse.json({ success: false, error: error.message || "Failed to add room" }, { status: 500 })
  }
}

function validateRoomData(roomData: any): { noOfSharing: number; acType: string; bedSize: string } | null {
  if (!roomData || typeof roomData !== "object") {
    return null
  }

  // Validate noOfSharing
  const noOfSharing = Number.parseInt(roomData.noOfSharing)
  if (!noOfSharing || ![1, 2, 3, 4, 5, 6, 7].includes(noOfSharing)) {
    return null
  }

  // Validate acType
  if (!roomData.acType || !["AC", "Non AC"].includes(roomData.acType)) {
    return null
  }

  // Validate bedSize
  if (!roomData.bedSize || !["Single", "Double", "Other"].includes(roomData.bedSize)) {
    return null
  }

  return {
    noOfSharing,
    acType: roomData.acType,
    bedSize: roomData.bedSize,
  }
}
