import { type NextRequest, NextResponse } from "next/server"
import { connectDB } from "@/lib/db"
import Testimonial from "@/lib/models/Testimonial"

// GET - Fetch single testimonial
export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    await connectDB()
    const testimonial = await Testimonial.findById(params.id)

    if (!testimonial) {
      return NextResponse.json({ success: false, error: "Testimonial not found" }, { status: 404 })
    }

    return NextResponse.json({ success: true, data: testimonial })
  } catch (error) {
    console.error("Error fetching testimonial:", error)
    return NextResponse.json({ success: false, error: "Failed to fetch testimonial" }, { status: 500 })
  }
}

// PUT - Update testimonial
export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    await connectDB()
    const body = await request.json()

    const testimonial = await Testimonial.findByIdAndUpdate(params.id, body, { new: true, runValidators: true })

    if (!testimonial) {
      return NextResponse.json({ success: false, error: "Testimonial not found" }, { status: 404 })
    }

    return NextResponse.json({ success: true, data: testimonial })
  } catch (error) {
    console.error("Error updating testimonial:", error)
    return NextResponse.json({ success: false, error: "Failed to update testimonial" }, { status: 500 })
  }
}

// DELETE - Delete testimonial
export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    await connectDB()

    const testimonial = await Testimonial.findByIdAndUpdate(params.id, { isActive: false }, { new: true })

    if (!testimonial) {
      return NextResponse.json({ success: false, error: "Testimonial not found" }, { status: 404 })
    }

    return NextResponse.json({ success: true, message: "Testimonial deleted successfully" })
  } catch (error) {
    console.error("Error deleting testimonial:", error)
    return NextResponse.json({ success: false, error: "Failed to delete testimonial" }, { status: 500 })
  }
}
