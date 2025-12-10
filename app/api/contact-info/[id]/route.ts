import { type NextRequest, NextResponse } from "next/server"
import connectDB from "@/lib/mongodb"
import ContactInfo from "@/lib/models/ContactInfo"

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await connectDB()
    const { id } = await params
    const contactInfo = await ContactInfo.findById(id)

    if (!contactInfo) {
      return NextResponse.json({ error: "Contact information not found" }, { status: 404 })
    }

    return NextResponse.json(contactInfo)
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch contact information" }, { status: 500 })
  }
}

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await connectDB()
    const { id } = await params
    const data = await request.json()
    const updatedContactInfo = await ContactInfo.findByIdAndUpdate(id, data, { new: true })

    if (!updatedContactInfo) {
      return NextResponse.json({ error: "Contact information not found" }, { status: 404 })
    }

    return NextResponse.json(updatedContactInfo)
  } catch (error) {
    return NextResponse.json({ error: "Failed to update contact information" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await connectDB()
    const { id } = await params
    const deletedContactInfo = await ContactInfo.findByIdAndDelete(id)

    if (!deletedContactInfo) {
      return NextResponse.json({ error: "Contact information not found" }, { status: 404 })
    }

    return NextResponse.json({ message: "Contact information deleted successfully" })
  } catch (error) {
    return NextResponse.json({ error: "Failed to delete contact information" }, { status: 500 })
  }
}
