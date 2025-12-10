import { NextResponse } from "next/server"
import { connectDB } from "@/lib/db"
import VendorProperty from "@/lib/models/vendorproper"

export async function GET() {
  try {
    await connectDB()

    const popularAreas = await VendorProperty.aggregate([
      {
        $match: { isActive: true },
      },
      {
        $group: {
          _id: "$area", // Changed from $city to $area
          count: { $sum: 1 },
          sampleImage: { $first: "$mainImage" },
          sampleImages: { $first: "$images" },
        },
      },
      {
        $project: {
          area: "$_id", // Changed from city to area
          count: 1,
          image: {
            $cond: {
              if: { $ne: ["$sampleImage", null] },
              then: "$sampleImage",
              else: { $arrayElemAt: ["$sampleImages", 0] },
            },
          },
        },
      },
      {
        $sort: { count: -1 },
      },
      {
        $limit: 12,
      },
    ])

    return NextResponse.json({
      success: true,
      data: popularAreas.map((area) => ({
        name: area.area, // Changed from area.city to area.area
        properties: area.count,
        image: area.image || "/placeholder.svg",
      })),
    })
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error?.message || "Failed to fetch popular areas" }, // Updated error message
      { status: 500 },
    )
  }
}
