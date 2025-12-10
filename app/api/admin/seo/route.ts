import { type NextRequest, NextResponse } from "next/server"
import { connectDB } from "@/lib/db"
import { SeoMeta } from "@/lib/models/SeoMeta"

export async function POST(req: NextRequest) {
  try {
    await connectDB()
    const body = await req.json()

    const { pageType, title, description } = body || {}
    const { keywords } = body || {}

    const normalizeKeywords = (val: unknown): string[] => {
      if (Array.isArray(val)) {
        return [...new Set(val.map((k) => String(k).trim()).filter(Boolean))]
      }
      if (typeof val === "string") {
        return [
          ...new Set(
            val
              .split(",")
              .map((k) => k.trim())
              .filter(Boolean),
          ),
        ]
      }
      return []
    }

    const keywordsArr = normalizeKeywords(keywords)

    if (!pageType || !title || !description || keywordsArr.length === 0) {
      return NextResponse.json(
        { success: false, error: "All fields (pageType, title, description, keywords) are required." },
        { status: 400 },
      )
    }

    const created = await SeoMeta.create({ pageType, title, description, keywords: keywordsArr })
    return NextResponse.json({ success: true, data: created }, { status: 201 })
  } catch (error: any) {
    if (error?.code === 11000) {
      return NextResponse.json({ success: false, error: "SEO meta for this pageType already exists." }, { status: 409 })
    }
    console.error("[POST /api/admin/seo] error:", error)
    return NextResponse.json({ success: false, error: "Failed to save SEO meta" }, { status: 500 })
  }
}

export async function GET() {
  try {
    await connectDB()
    const metas = await SeoMeta.find().sort({ createdAt: -1 })

    const normalize = (k: any) =>
      Array.isArray(k)
        ? k
        : typeof k === "string"
          ? k
              .split(",")
              .map((x) => x.trim())
              .filter(Boolean)
          : []

    const data = metas.map((m: any) => ({
      ...m.toObject(),
      keywords: normalize(m.keywords),
    }))

    return NextResponse.json({ success: true, data })
  } catch (error) {
    console.error("[GET /api/admin/seo] error:", error)
    return NextResponse.json({ success: false, error: "Failed to fetch SEO meta" }, { status: 500 })
  }
}
