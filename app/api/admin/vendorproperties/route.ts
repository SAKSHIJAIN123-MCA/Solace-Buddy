import { type NextRequest, NextResponse } from "next/server"
import { connectDB } from "@/lib/db"
import VendorProperty from "@/lib/models/vendorproper"

export async function GET(request: NextRequest) {
  try {
    await connectDB()

    const properties = await VendorProperty.find({
      isActive: true,
    })
      .sort({ createdAt: -1 })
      .populate("amenities", "name icon status")

    return NextResponse.json({
      success: true,
      data: properties,
    })
  } catch (error: any) {
    console.error("Error fetching vendor properties:", error)
    return NextResponse.json({ success: false, error: "Failed to fetch vendor properties" }, { status: 500 })
  }
}
