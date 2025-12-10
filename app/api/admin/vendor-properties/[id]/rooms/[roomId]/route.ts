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

// PUT - Update room (admin can update any room)
export async function PUT(request: NextRequest, { params }: { params: { id: string; roomId: string } }) {
  try {
    await connectDB()

    const adminId = await getAdminFromToken(request)
    if (!adminId) {
      return NextResponse.json({ success: false, error: "Admin authentication required" }, { status: 401 })
    }

    const body = await request.json()
    console.log("Received room update data:", JSON.stringify(body, null, 2))

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

    const room = property.rooms.id(params.roomId)
    if (!room) {
      return NextResponse.json({ success: false, error: "Room not found" }, { status: 404 })
    }

    const displayName = `${validatedData.noOfSharing}-Sharing-${validatedData.acType}`

    room.roomNumber = body.roomNumber?.trim() || ""
    room.name = body.name?.trim() || ""
    room.noOfSharing = validatedData.noOfSharing
    room.acType = validatedData.acType
    room.bedSize = validatedData.bedSize
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

    console.log(
      "Updating room with new data structure:",
      JSON.stringify(
        {
          noOfSharing: room.noOfSharing,
          acType: room.acType,
          bedSize: room.bedSize,
          displayName: room.displayName,
          roomNumber: room.roomNumber,
          name: room.name,
        },
        null,
        2,
      ),
    )

    await property.save()

    return NextResponse.json({
      success: true,
      data: room,
      message: "Room updated successfully",
    })
  } catch (error: any) {
    console.error("Error updating room:", error)

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

    return NextResponse.json({ success: false, error: error.message || "Failed to update room" }, { status: 500 })
  }
}

// DELETE - Delete room (admin can delete any room)
export async function DELETE(request: NextRequest, { params }: { params: { id: string; roomId: string } }) {
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
