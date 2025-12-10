import { type NextRequest, NextResponse } from "next/server"
import { connectDB } from "@/lib/db"
import VendorProperty from "@/lib/models/vendorproper"
import mongoose from "mongoose"

// 🧠 Authentication removed completely

export async function GET(request: NextRequest) {
  try {
    await connectDB()

    // Optional vendorId filter
    const { searchParams } = new URL(request.url)
    const vendorId = searchParams.get("vendorId")

    const filter: any = { isActive: true }
    if (vendorId && mongoose.Types.ObjectId.isValid(vendorId)) {
      filter.vendorId = new mongoose.Types.ObjectId(vendorId)
    }

    const properties = await VendorProperty.find(filter)
      .sort({ createdAt: -1 })
      .populate("amenities", "name icon status")

    return NextResponse.json({
      success: true,
      data: properties,
    })
  } catch (error: any) {
    console.error("Error fetching properties:", error)
    return NextResponse.json(
      { success: false, error: "Failed to fetch properties" },
      { status: 500 }
    )
  }
}


