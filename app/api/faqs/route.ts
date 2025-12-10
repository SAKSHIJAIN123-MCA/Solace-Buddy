import { type NextRequest, NextResponse } from "next/server"
import connectDB from "@/lib/mongodb"
import Faq from "@/lib/models/Faq"

export async function GET() {
  try {
    await connectDB()
    const faqs = await Faq.find({}).sort({ category: 1 })
    return NextResponse.json(faqs)
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch FAQs" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    await connectDB()
    const data = await request.json()
    const newFaq = await Faq.create(data)
    return NextResponse.json(newFaq, { status: 201 })
  } catch (error) {
    console.error("Error creating FAQ:", error)
    return NextResponse.json({ error: "Failed to create FAQ" }, { status: 500 })
  }
}
