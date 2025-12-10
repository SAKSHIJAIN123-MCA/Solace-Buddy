import { type NextRequest, NextResponse } from "next/server"
import { connectDB } from "@/lib/db"
import HeroSlide from "@/lib/models/hero"

// GET a hero slide by ID
export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await connectDB()
    const { id } = await params

    const slide = await HeroSlide.findById(id)
    if (!slide) {
      return NextResponse.json({ error: "Hero slide not found" }, { status: 404 })
    }
    return NextResponse.json(slide)
  } catch (error) {
    console.error("GET hero slide error:", error)
    return NextResponse.json({ error: "Failed to fetch hero slide" }, { status: 500 })
  }
}

// UPDATE a hero slide by ID
export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await connectDB()
    const { id } = await params
    const body = await req.json()
    const { title, subtitle, description, image, link, buttonText, isActive, order } = body

    if (!title || !image) {
      return NextResponse.json({ error: "Title and image are required" }, { status: 400 })
    }

    const updated = await HeroSlide.findByIdAndUpdate(
      id,
      {
        title,
        subtitle: subtitle || "",
        description: description || "",
        image,
        link: link || "",
        buttonText: buttonText || "Learn More",
        isActive: isActive !== undefined ? isActive : true,
        order: order || 0,
      },
      { new: true },
    )

    if (!updated) {
      return NextResponse.json({ error: "Hero slide not found" }, { status: 404 })
    }

    return NextResponse.json(updated)
  } catch (error) {
    console.error("PUT hero slide error:", error)
    return NextResponse.json({ error: "Failed to update hero slide" }, { status: 500 })
  }
}

// DELETE a hero slide by ID
export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await connectDB()
    const { id } = await params

    const deleted = await HeroSlide.findByIdAndDelete(id)
    if (!deleted) {
      return NextResponse.json({ error: "Hero slide not found" }, { status: 404 })
    }

    return NextResponse.json({ message: "Hero slide deleted successfully" })
  } catch (error) {
    console.error("DELETE hero slide error:", error)
    return NextResponse.json({ error: "Failed to delete hero slide" }, { status: 500 })
  }
}
