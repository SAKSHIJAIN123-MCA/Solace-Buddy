import { type NextRequest, NextResponse } from "next/server"
import { connectDB } from "@/lib/db"

let VendorProperty: any
try {
  VendorProperty = require("@/lib/models/vendorproper").default
} catch (error) {
  console.warn("Could not import VendorProperty model:", error)
  VendorProperty = null
}

export async function PUT(request: NextRequest, { params }: { params: { id: string; roomId: string; bedId: string } }) {
  try {
    await connectDB()
    const bedData = await request.json()

    console.log("Received bed update data:", bedData)
    console.log("Params:", params)

    if (VendorProperty) {
      try {
        const vendorProperty = await VendorProperty.findById(params.id)

        if (vendorProperty) {
          const room = vendorProperty.rooms.id(params.roomId)
          if (room) {
            const bed = room.beds.id(params.bedId)
            if (bed) {
              bed.status = bedData.status

              // Only set dates if provided
              if (bedData.bookingDate) {
                bed.bookingDate = new Date(bedData.bookingDate)
              } else {
                bed.bookingDate = null
              }

              if (bedData.noticeDate) {
                bed.noticeDate = new Date(bedData.noticeDate)
              } else {
                bed.noticeDate = null
              }

              bed.studentId = null
              bed.studentName = null
              bed.rentDueDate = null

              await vendorProperty.save()

              console.log("Bed updated successfully:", bed)

              return NextResponse.json({
                success: true,
                message: "Bed updated successfully",
                data: bed,
              })
            }
          }
        }
      } catch (vendorError) {
        console.error("Error updating vendor bed:", vendorError)
      }
    }

    return NextResponse.json(
      {
        success: false,
        error: "Bed not found or could not be updated",
      },
      { status: 404 },
    )
  } catch (error) {
    console.error("Error updating bed:", error)
    return NextResponse.json(
      {
        success: false,
        error: "Failed to update bed",
      },
      { status: 500 },
    )
  }
}
