import { type NextRequest, NextResponse } from "next/server"
import  connectDB  from "@/lib/mongodb"
import ContactInfo from "@/lib/models/ContactInfo"

export async function GET() {
  try {
    await connectDB()
    const contactInfo = await ContactInfo.find({}).sort({ order: 1 })
    return NextResponse.json(contactInfo)
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch contact information" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    await connectDB()
    const data = await request.json()
    const newContactInfo = await ContactInfo.create(data)
    return NextResponse.json(newContactInfo, { status: 201 })
  } catch (error) {
    console.error("Error creating contact information:", error)
    return NextResponse.json({ error: "Failed to create contact information" }, { status: 500 })
  }
}
