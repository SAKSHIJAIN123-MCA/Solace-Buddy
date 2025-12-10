import { type NextRequest, NextResponse } from "next/server"
import { connectDB } from "@/lib/db"
import { SeoMeta } from "@/lib/models/SeoMeta"

export async function GET(req: NextRequest) {
  try {
    await connectDB()

    const { searchParams } = new URL(req.url)
    const pageType = searchParams.get("pageType")

    let data
    if (pageType) {
      // Fetch a single SEO meta by pageType
      data = await SeoMeta.findOne({ pageType })
    } else {
      // Fetch all if no pageType provided
      data = await SeoMeta.find().sort({ createdAt: -1 })
    }

    return NextResponse.json({ success: true, data })
  } catch (error) {
    console.error("Error fetching SEO meta:", error)
    return NextResponse.json({ success: false, message: "Error fetching SEO meta" }, { status: 500 })
  }
}
