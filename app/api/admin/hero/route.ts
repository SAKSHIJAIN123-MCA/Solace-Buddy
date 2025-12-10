import { type NextRequest, NextResponse } from "next/server"
import { connectDB } from "@/lib/db"
import HeroSlide from "@/lib/models/hero"

// GET all hero slides for admin
export async function GET() {
  try {
    await connectDB()
    const slides = await HeroSlide.find({}).sort({ order: 1, createdAt: -1 })
    return NextResponse.json({ slides }, { status: 200 })
  } catch (error) {
    console.error("GET hero slides error:", error)
    return NextResponse.json({ error: "Failed to fetch hero slides" }, { status: 500 })
  }
}

// POST: Create a new hero slide
export async function POST(req: NextRequest) {
  try {
    await connectDB()
    const body = await req.json()
    const { title, subtitle, description, image, link, buttonText, isActive, order } = body

    // Validate required fields
    if (!title || !image) {
      return NextResponse.json({ error: "Title and image are required" }, { status: 400 })
    }

    const newSlide = new HeroSlide({
      title,
      subtitle: subtitle || "",
      description: description || "",
      image,
      link: link || "",
      buttonText: buttonText || "Learn More",
      isActive: isActive !== undefined ? isActive : true,
      order: order || 0,
    })

    const savedSlide = await newSlide.save()
    return NextResponse.json(savedSlide, { status: 201 })
  } catch (error: any) {
    console.error("POST hero slide error:", error)
    return NextResponse.json({ error: error?.message || "Failed to create hero slide" }, { status: 500 })
  }
}
