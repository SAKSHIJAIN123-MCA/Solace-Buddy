import { type NextRequest, NextResponse } from "next/server"
import { connectDB } from "@/lib/db"
import StudentEnquiry from "@/lib/student-enquiry"
import mongoose from "mongoose"

// GET - Fetch single student enquiry
export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    await connectDB()

    if (!mongoose.Types.ObjectId.isValid(params.id)) {
      return NextResponse.json({ success: false, error: "Invalid enquiry ID" }, { status: 400 })
    }

    const enquiry = await StudentEnquiry.findById(params.id)

    if (!enquiry) {
      return NextResponse.json({ success: false, error: "Enquiry not found" }, { status: 404 })
    }

    return NextResponse.json({
      success: true,
      data: enquiry,
    })
  } catch (error: any) {
    console.error("Error fetching student enquiry:", error)
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}

// PUT - Update student enquiry (for responses, status changes, etc.)
export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    await connectDB()

    if (!mongoose.Types.ObjectId.isValid(params.id)) {
      return NextResponse.json({ success: false, error: "Invalid enquiry ID" }, { status: 400 })
    }

    const body = await request.json()

    // If responding to enquiry, set respondedAt and update status
    if (body.response && !body.respondedAt) {
      body.respondedAt = new Date()
      if (body.status === "pending") {
        body.status = "responded"
      }
    }

    const enquiry = await StudentEnquiry.findByIdAndUpdate(
      params.id,
      { ...body, updatedAt: new Date() },
      { new: true, runValidators: true },
    )

    if (!enquiry) {
      return NextResponse.json({ success: false, error: "Enquiry not found" }, { status: 404 })
    }

    return NextResponse.json({
      success: true,
      data: enquiry,
      message: "Enquiry updated successfully",
    })
  } catch (error: any) {
    console.error("Error updating student enquiry:", error)

    if (error.name === "ValidationError") {
      const errors = Object.values(error.errors).map((err: any) => err.message)
      return NextResponse.json({ success: false, error: errors.join(", ") }, { status: 400 })
    }

    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}

// DELETE - Delete student enquiry
export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    await connectDB()

    if (!mongoose.Types.ObjectId.isValid(params.id)) {
      return NextResponse.json({ success: false, error: "Invalid enquiry ID" }, { status: 400 })
    }

    const enquiry = await StudentEnquiry.findByIdAndDelete(params.id)

    if (!enquiry) {
      return NextResponse.json({ success: false, error: "Enquiry not found" }, { status: 404 })
    }

    return NextResponse.json({
      success: true,
      message: "Enquiry deleted successfully",
    })
  } catch (error: any) {
    console.error("Error deleting student enquiry:", error)
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}
