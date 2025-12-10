import { NextResponse } from "next/server"
import { connectDB } from "@/lib/db"
import VendorProperty from "@/lib/models/vendorproper"

export async function GET() {
  try {
    await connectDB()

    // Aggregate properties by city and count them
    const popularCities = await VendorProperty.aggregate([
      {
        $match: { isActive: true },
      },
      {
        $group: {
          _id: "$city",
          count: { $sum: 1 },
          sampleImage: { $first: "$mainImage" },
          sampleImages: { $first: "$images" },
        },
      },
      {
        $project: {
          city: "$_id",
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
      data: popularCities.map((city) => ({
        name: city.city,
        properties: city.count,
        image: city.image || "/placeholder.svg",
      })),
    })
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error?.message || "Failed to fetch popular cities" },
      { status: 500 },
    )
  }
}
