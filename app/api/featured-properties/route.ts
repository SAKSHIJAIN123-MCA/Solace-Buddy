import { NextResponse } from "next/server"
import { connectDB } from "@/lib/db"
import VendorProperty from "@/lib/models/vendorproper"

export async function GET() {
  try {
    console.log("[v0] Featured Properties API: Starting request")

    console.log("[v0] Connecting to database...")
    await connectDB()
    console.log("[v0] Database connected successfully")

    console.log("[v0] Querying for featured public properties...")
    const featuredProperties = await VendorProperty.find({
      isActive: true,
      isFeatured: true,
      $and: [
        { status: { $exists: true } },
        { status: "public" },
      ],
    })
      .sort({ createdAt: -1 })
      .limit(8)
      .lean()

    console.log("[v0] Found", featuredProperties.length, "featured public properties")

    // If no featured properties, get latest public properties
    let properties = featuredProperties
    if (properties.length === 0) {
      console.log("[v0] No featured public properties found, getting latest public properties...")
      properties = await VendorProperty.find({
        isActive: true,
        $and: [
          { status: { $exists: true } },
          { status: "public" },
        ],
      })
        .sort({ createdAt: -1 })
        .limit(8)
        .lean()

      console.log("[v0] Found", properties.length, "latest public properties")
    }

    console.log("[v0] Formatting properties...")
    const formattedProperties = properties.map((p: any) => {
      const formatted = {
        _id: String(p._id),
        slug: p.slug || null,
        propertyId: p.propertyId,
        name: p.pgNickName || p.name,
        type: p.type || "PG",
        address: p.address,
        city: p.city,
        area: p.area,
        state: p.state,
        gender: p.gender,
        rentRange: p.rentRange || { min: 0, max: 0 },
        totalBeds: p.totalBeds || 0,
        availableBeds: p.availableBeds || 0,
        amenities: Array.isArray(p.amenities) ? p.amenities : [],
        images: p.mainImage
          ? [p.mainImage, ...(Array.isArray(p.commonPhotos) ? p.commonPhotos : [])]
          : Array.isArray(p.images) && p.images.length
            ? p.images
            : ["/diverse-property-showcase.png"],
        nearbyLandmark: p.nearbyLandmark || "",
      }
      return formatted
    })

    console.log("[v0] Successfully formatted", formattedProperties.length, "properties")

    return NextResponse.json({
      success: true,
      data: formattedProperties,
    })
  } catch (err: any) {
    console.error("[v0] Featured Properties API Error:", err)
    console.error("[v0] Error stack:", err.stack)

    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch featured properties",
        message: err.message,
        details: process.env.NODE_ENV === "development" ? err.stack : undefined,
      },
      { status: 500 },
    )
  }
}
