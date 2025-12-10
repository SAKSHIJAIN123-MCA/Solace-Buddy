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

// PUT - Update room
export async function PUT(request: NextRequest, { params }: { params: { id: string; roomId: string } }) {
  try {
    await connectDB()

    const vendorId = await getVendorFromToken(request)
    if (!vendorId) {
      return NextResponse.json({ success: false, error: "Authentication required" }, { status: 401 })
    }

    const body = await request.json()
    console.log("Received room update data:", body)

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

    const room = property.rooms.id(params.roomId)
    if (!room) {
      return NextResponse.json({ success: false, error: "Room not found" }, { status: 404 })
    }

    // Check if room number already exists (excluding current room) - only if roomNumber is provided
    if (body.roomNumber && body.roomNumber.trim()) {
      const existingRoom = property.rooms.find(
        (r) =>
          r.roomNumber &&
          r.roomNumber.toLowerCase() === body.roomNumber.toLowerCase() &&
          r.isActive &&
          r._id.toString() !== params.roomId,
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

    const displayName = `${body.noOfSharing}-Sharing-${body.acType}`

    // Update room details
    room.roomNumber = body.roomNumber?.trim() || ""
    room.name = body.name?.trim() || ""
    room.noOfSharing = Number.parseInt(body.noOfSharing)
    room.acType = body.acType
    room.bedSize = body.bedSize
    room.displayName = displayName
    room.rent = Number.parseFloat(body.rent)
    room.bathroomType = body.bathroomType || "common"
    room.amenities = [] // Removed amenities from room level
    room.description = body.description || ""
    room.balcony = body.balcony || false

    // If total beds changed, update beds array
    if (body.totalBeds !== room.totalBeds) {
      const currentOccupiedBeds = room.beds.filter((bed) => bed.status === "occupied").length

      if (body.totalBeds < currentOccupiedBeds) {
        return NextResponse.json({ success: false, error: "Cannot reduce beds below occupied count" }, { status: 400 })
      }

      // Preserve existing beds and add/remove as needed
      const existingBeds = room.beds.slice(0, Math.min(body.totalBeds, room.beds.length))

      // Add new beds if increasing
      for (let i = room.beds.length + 1; i <= body.totalBeds; i++) {
        existingBeds.push({
          bedNumber: `bed-${i}`,
          status: "available",
        })
      }

      room.beds = existingBeds
      room.totalBeds = body.totalBeds
    }

    await property.save()

    return NextResponse.json({
      success: true,
      data: room,
      message: "Room updated successfully",
    })
  } catch (error: any) {
    console.error("Error updating room:", error)

    // Handle validation errors specifically
    if (error.name === "ValidationError") {
      const validationErrors = Object.values(error.errors).map((err: any) => err.message)
      return NextResponse.json(
        { success: false, error: `Validation failed: ${validationErrors.join(", ")}` },
        { status: 400 },
      )
    }

    return NextResponse.json({ success: false, error: error.message || "Failed to update room" }, { status: 500 })
  }
}

// DELETE - Delete room
export async function DELETE(request: NextRequest, { params }: { params: { id: string; roomId: string } }) {
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

    const room = property.rooms.id(params.roomId)
    if (!room) {
      return NextResponse.json({ success: false, error: "Room not found" }, { status: 404 })
    }

    // Check if room has occupied beds
    const occupiedBeds = room.beds.filter((bed) => bed.status === "occupied").length
    if (occupiedBeds > 0) {
      return NextResponse.json({ success: false, error: "Cannot delete room with occupied beds" }, { status: 400 })
    }

    // Soft delete room
    room.isActive = false

    // Save the property - this will trigger the pre-save hook to recalculate stats
    await property.save()

    return NextResponse.json({
      success: true,
      message: "Room deleted successfully",
    })
  } catch (error: any) {
    console.error("Error deleting room:", error)
    return NextResponse.json({ success: false, error: "Failed to delete room" }, { status: 500 })
  }
}
