import { type NextRequest, NextResponse } from "next/server"
import connectDB from "@/lib/mongodb"
import Faq from "@/lib/models/Faq"

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await connectDB()
    const { id } = await params
    const faq = await Faq.findById(id)

    if (!faq) {
      return NextResponse.json({ error: "FAQ not found" }, { status: 404 })
    }

    return NextResponse.json(faq)
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch FAQ" }, { status: 500 })
  }
}

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await connectDB()
    const { id } = await params
    const data = await request.json()
    const updatedFaq = await Faq.findByIdAndUpdate(id, data, { new: true })

    if (!updatedFaq) {
      return NextResponse.json({ error: "FAQ not found" }, { status: 404 })
    }

    return NextResponse.json(updatedFaq)
  } catch (error) {
    return NextResponse.json({ error: "Failed to update FAQ" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await connectDB()
    const { id } = await params
    const deletedFaq = await Faq.findByIdAndDelete(id)

    if (!deletedFaq) {
      return NextResponse.json({ error: "FAQ not found" }, { status: 404 })
    }

    return NextResponse.json({ message: "FAQ deleted successfully" })
  } catch (error) {
    return NextResponse.json({ error: "Failed to delete FAQ" }, { status: 500 })
  }
}
