import { type NextRequest, NextResponse } from "next/server"
import { connectDB } from "@/lib/db"
import { Inquiry } from "@/lib/models/inquiry"

export async function POST(request: NextRequest) {
  try {
    await connectDB()

    const body = await request.json()

    const requiredFields = ["name", "mobile", "email", "gender", "neededFrom", "city", "areas"]
    const missingFields = requiredFields.filter(
      (field) => !body[field] || (Array.isArray(body[field]) && body[field].length === 0),
    )

    if (missingFields.length > 0) {
      return NextResponse.json({ error: `Missing required fields: ${missingFields.join(", ")}` }, { status: 400 })
    }

  if (!/^[6-9]\d{9}$/.test(body.mobile)) {
  return NextResponse.json(
    { error: "Mobile number must be 10 digits and start with 6, 7, 8, or 9" },
    { status: 400 }
  )
}

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(body.email)) {
      return NextResponse.json({ error: "Please provide a valid email address" }, { status: 400 })
    }

    const inquiry = new Inquiry({
      ...body,
      submittedAt: new Date(),
    })

    const savedInquiry = await inquiry.save()

    return NextResponse.json({ success: true, id: savedInquiry._id })
  } catch (error) {
    console.error("Error saving inquiry:", error)
    return NextResponse.json({ error: "Failed to save inquiry" }, { status: 500 })
  }
}

export async function GET() {
  try {
    await connectDB()
    const inquiries = await Inquiry.find({}).sort({ createdAt: -1 }).lean()

    const formattedInquiries = inquiries.map((inquiry) => ({
      ...inquiry,
      id: inquiry._id.toString(),
      _id: undefined,
    }))

    return NextResponse.json(formattedInquiries)
  } catch (error) {
    console.error("Error reading inquiries:", error)
    return NextResponse.json({ error: "Failed to read inquiries" }, { status: 500 })
  }
}
