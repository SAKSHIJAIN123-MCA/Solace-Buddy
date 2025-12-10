import { NextResponse } from "next/server"
import { connectDB } from "@/lib/db"
import VisitRequest from "@/lib/models/visit-request"

export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    await connectDB()

    const visitRequest = await VisitRequest.findById(params.id)
      .populate("propertyId", "name address city contactNumber email")
      .lean()

    if (!visitRequest) {
      return NextResponse.json({ success: false, message: "Visit request not found" }, { status: 404 })
    }

    return NextResponse.json({
      success: true,
      data: visitRequest,
    })
  } catch (error: any) {
    console.error("Get visit request error:", error)
    return NextResponse.json({ success: false, message: error?.message || "Internal server error" }, { status: 500 })
  }
}

export async function PATCH(request: Request, { params }: { params: { id: string } }) {
  try {
    await connectDB()

    const body = await request.json()
    const { status, notes } = body

    const visitRequest = await VisitRequest.findByIdAndUpdate(
      params.id,
      { status, notes },
      { new: true, runValidators: true },
    )

    if (!visitRequest) {
      return NextResponse.json({ success: false, message: "Visit request not found" }, { status: 404 })
    }

    return NextResponse.json({
      success: true,
      message: "Visit request updated successfully",
      data: visitRequest,
    })
  } catch (error: any) {
    console.error("Update visit request error:", error)
    return NextResponse.json({ success: false, message: error?.message || "Internal server error" }, { status: 500 })
  }
}
