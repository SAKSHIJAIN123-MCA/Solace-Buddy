import { type NextRequest, NextResponse } from "next/server"
import { connectDB } from "@/lib/db"
import { Banner } from "@/lib/models/banner"

// GET /api/banners - Get all banners or active banners only
export async function GET(request: NextRequest) {
  try {
    await connectDB()

    const { searchParams } = new URL(request.url)
    const activeOnly = searchParams.get("active") === "true"

    const query = activeOnly ? { isActive: true } : {}
    const banners = await Banner.find(query).sort({ createdAt: -1 })

    const transformedBanners = banners.map((banner) => ({
      ...banner.toObject(),
      id: banner._id.toString(),
      image: banner.backgroundImage,
      cta: banner.buttonText,
      order: 1,
    }))

    return NextResponse.json({
      success: true,
      data: transformedBanners,
      count: transformedBanners.length,
    })
  } catch (error) {
    console.error("Error fetching banners:", error)
    return NextResponse.json({ success: false, error: "Failed to fetch banners" }, { status: 500 })
  }
}

// POST /api/banners - Create new banner
export async function POST(request: NextRequest) {
  try {
    await connectDB()

    const body = await request.json()

    // Basic validation
    if (!body.title || !body.subtitle || !body.buttonText) {
      return NextResponse.json(
        {
          success: false,
          error: "Title, subtitle, and button text are required",
        },
        { status: 400 },
      )
    }

    const newBanner = new Banner({
      title: body.title,
      subtitle: body.subtitle,
      description: body.description || "",
      buttonText: body.buttonText,
      buttonLink: body.buttonLink || "#",
      backgroundImage: body.backgroundImage || "/abstract-hero-banner.png",
      isActive: body.isActive ?? true,
    })

    await newBanner.save()

    return NextResponse.json(
      {
        success: true,
        data: newBanner,
        message: "Banner created successfully",
      },
      { status: 201 },
    )
  } catch (error) {
    console.error("Error creating banner:", error)
    return NextResponse.json({ success: false, error: "Failed to create banner" }, { status: 500 })
  }
}
