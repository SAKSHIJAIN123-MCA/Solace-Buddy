import { type NextRequest, NextResponse } from "next/server"
import { connectDB } from "@/lib/db"
import StudentEnquiry from "@/lib/student-enquiry"

// GET - Fetch all student enquiries
export async function GET(request: NextRequest) {
  try {
    await connectDB()

    const { searchParams } = new URL(request.url)
    const search = searchParams.get("search") || ""
    const status = searchParams.get("status") || "all"
    const priority = searchParams.get("priority") || "all"
    const accommodationType = searchParams.get("accommodationType") || "all"
    const page = Number.parseInt(searchParams.get("page") || "1")
    const limit = Number.parseInt(searchParams.get("limit") || "10")
    const skip = (page - 1) * limit

    // Build query
    const query: any = {}

    if (search) {
      query.$or = [
        { studentName: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
        { subject: { $regex: search, $options: "i" } },
        { preferredLocation: { $regex: search, $options: "i" } },
        { college: { $regex: search, $options: "i" } },
      ]
    }

    if (status !== "all") {
      query.status = status
    }

    if (priority !== "all") {
      query.priority = priority
    }

    if (accommodationType !== "all") {
      query.accommodationType = accommodationType
    }

    const enquiries = await StudentEnquiry.find(query).sort({ createdAt: -1 }).skip(skip).limit(limit)

    const total = await StudentEnquiry.countDocuments(query)

    // Get statistics
    const stats = await StudentEnquiry.aggregate([
      {
        $group: {
          _id: "$status",
          count: { $sum: 1 },
        },
      },
    ])

    const priorityStats = await StudentEnquiry.aggregate([
      {
        $group: {
          _id: "$priority",
          count: { $sum: 1 },
        },
      },
    ])

    const accommodationStats = await StudentEnquiry.aggregate([
      {
        $group: {
          _id: "$accommodationType",
          count: { $sum: 1 },
        },
      },
    ])

    const statistics = {
      total,
      pending: stats.find((s) => s._id === "pending")?.count || 0,
      responded: stats.find((s) => s._id === "responded")?.count || 0,
      closed: stats.find((s) => s._id === "closed")?.count || 0,
      spam: stats.find((s) => s._id === "spam")?.count || 0,
      high: priorityStats.find((s) => s._id === "high")?.count || 0,
      medium: priorityStats.find((s) => s._id === "medium")?.count || 0,
      low: priorityStats.find((s) => s._id === "low")?.count || 0,
      hostel: accommodationStats.find((s) => s._id === "Hostel")?.count || 0,
      pg: accommodationStats.find((s) => s._id === "PG")?.count || 0,
      both: accommodationStats.find((s) => s._id === "Both")?.count || 0,
    }

    return NextResponse.json({
      success: true,
      data: enquiries,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
      statistics,
    })
  } catch (error: any) {
    console.error("Error fetching student enquiries:", error)
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}

// POST - Create new student enquiry (for frontend form submissions)
export async function POST(request: NextRequest) {
  try {
    await connectDB()

    const body = await request.json()

    const enquiry = new StudentEnquiry(body)
    await enquiry.save()

    return NextResponse.json(
      {
        success: true,
        data: enquiry,
        message: "Student enquiry submitted successfully",
      },
      { status: 201 },
    )
  } catch (error: any) {
    console.error("Error creating student enquiry:", error)

    if (error.name === "ValidationError") {
      const errors = Object.values(error.errors).map((err: any) => err.message)
      return NextResponse.json({ success: false, error: errors.join(", ") }, { status: 400 })
    }

    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}
