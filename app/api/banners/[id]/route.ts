import { type NextRequest, NextResponse } from "next/server"
import { connectDB } from "@/lib/db"
import { Banner } from "@/lib/models/banner"
import mongoose from "mongoose"

// GET /api/banners/[id] - Get single banner
export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    await connectDB()

    if (!mongoose.Types.ObjectId.isValid(params.id)) {
      return NextResponse.json({ success: false, error: "Invalid banner ID" }, { status: 400 })
    }

    const banner = await Banner.findById(params.id)

    if (!banner) {
      return NextResponse.json({ success: false, error: "Banner not found" }, { status: 404 })
    }

    return NextResponse.json({
      success: true,
      data: banner,
    })
  } catch (error) {
    console.error("Error fetching banner:", error)
    return NextResponse.json({ success: false, error: "Failed to fetch banner" }, { status: 500 })
  }
}

// PUT /api/banners/[id] - Update banner
export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    await connectDB()

    if (!mongoose.Types.ObjectId.isValid(params.id)) {
      return NextResponse.json({ success: false, error: "Invalid banner ID" }, { status: 400 })
    }

    const body = await request.json()

    const updatedBanner = await Banner.findByIdAndUpdate(
      params.id,
      {
        title: body.title,
        subtitle: body.subtitle,
        description: body.description,
        buttonText: body.buttonText,
        buttonLink: body.buttonLink,
        backgroundImage: body.backgroundImage,
        isActive: body.isActive,
      },
      { new: true, runValidators: true },
    )

    if (!updatedBanner) {
      return NextResponse.json({ success: false, error: "Banner not found" }, { status: 404 })
    }

    return NextResponse.json({
      success: true,
      data: updatedBanner,
      message: "Banner updated successfully",
    })
  } catch (error) {
    console.error("Error updating banner:", error)
    return NextResponse.json({ success: false, error: "Failed to update banner" }, { status: 500 })
  }
}

// DELETE /api/banners/[id] - Delete banner
export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    await connectDB()

    if (!mongoose.Types.ObjectId.isValid(params.id)) {
      return NextResponse.json({ success: false, error: "Invalid banner ID" }, { status: 400 })
    }

    const deletedBanner = await Banner.findByIdAndDelete(params.id)

    if (!deletedBanner) {
      return NextResponse.json({ success: false, error: "Banner not found" }, { status: 404 })
    }

    return NextResponse.json({
      success: true,
      message: "Banner deleted successfully",
    })
  } catch (error) {
    console.error("Error deleting banner:", error)
    return NextResponse.json({ success: false, error: "Failed to delete banner" }, { status: 500 })
  }
}
