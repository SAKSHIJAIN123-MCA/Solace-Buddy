import { type NextRequest, NextResponse } from "next/server"
import { connectDB } from "@/lib/db"
import ContactSubmission from "@/lib/models/ContactSubmission"

export async function GET() {
  try {
    await connectDB()
    const submissions = await ContactSubmission.find({}).sort({ createdAt: -1 })
    return NextResponse.json(submissions)
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch contact submissions" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    await connectDB()
    const data = await request.json()
    const newSubmission = await ContactSubmission.create(data)
    return NextResponse.json(newSubmission, { status: 201 })
  } catch (error) {
    console.error("[v0] Error creating contact submission:", error)
    return NextResponse.json({ error: "Failed to create contact submission" }, { status: 500 })
  }
}
