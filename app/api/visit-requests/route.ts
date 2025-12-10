import { NextResponse } from "next/server"
import { connectDB } from "@/lib/db"
import VisitRequest from "@/lib/models/visit-request"

export async function POST(request: Request) {
  try {
    await connectDB()

    const body = await request.json()
    const { propertyId, propertyName, fullName, mobile, email, visitDate, visitTime } = body

    // Basic validation
    if (!propertyId || !propertyName || !fullName || !mobile || !email || !visitDate || !visitTime) {
      return NextResponse.json({ success: false, message: "All fields are required" }, { status: 400 })
    }

    // Create visit request
    const visitRequest = new VisitRequest({
      propertyId,
      propertyName,
      fullName,
      mobile,
      email,
      visitDate: new Date(visitDate),
      visitTime,
    })

    await visitRequest.save()

    return NextResponse.json({
      success: true,
      message: "Visit request submitted successfully",
      data: visitRequest,
    })
  } catch (error: any) {
    console.error("Visit request error:", error)
    return NextResponse.json({ success: false, message: error?.message || "Internal server error" }, { status: 500 })
  }
}

export async function GET(request: Request) {
  try {
    await connectDB()

    const { searchParams } = new URL(request.url)
    const page = Number.parseInt(searchParams.get("page") || "1", 10)
    const limit = Number.parseInt(searchParams.get("limit") || "10", 10)
    const status = searchParams.get("status")

    const filter: any = {}
    if (status && status !== "all") {
      filter.status = status
    }

    const skip = (page - 1) * limit

    const [requests, total] = await Promise.all([
      VisitRequest.find(filter)
        .populate("propertyId", "name address city")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      VisitRequest.countDocuments(filter),
    ])

    return NextResponse.json({
      success: true,
      data: requests,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    })
  } catch (error: any) {
    console.error("Get visit requests error:", error)
    return NextResponse.json({ success: false, message: error?.message || "Internal server error" }, { status: 500 })
  }
}
