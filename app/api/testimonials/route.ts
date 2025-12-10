import { type NextRequest, NextResponse } from "next/server"
import { connectDB } from "@/lib/db"
import Testimonial from "@/lib/models/Testimonial"

// GET - Fetch all testimonials
export async function GET() {
  try {
    await connectDB()
    const testimonials = await Testimonial.find({ isActive: true }).sort({ createdAt: -1 })
    return NextResponse.json({ success: true, data: testimonials })
  } catch (error) {
    console.error("Error fetching testimonials:", error)
    return NextResponse.json({ success: false, error: "Failed to fetch testimonials" }, { status: 500 })
  }
}

// POST - Create new testimonial
export async function POST(request: NextRequest) {
  try {
    await connectDB()
    const body = await request.json()

    const testimonial = new Testimonial(body)
    await testimonial.save()

    return NextResponse.json({ success: true, data: testimonial }, { status: 201 })
  } catch (error) {
    console.error("Error creating testimonial:", error)
    return NextResponse.json({ success: false, error: "Failed to create testimonial" }, { status: 500 })
  }
}
