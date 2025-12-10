import { type NextRequest, NextResponse } from "next/server"
import { connectDB } from "@/lib/db"
import { SeoMeta } from "@/lib/models/SeoMeta"

type Params = { params: { id: string } }

export async function GET(_req: NextRequest, { params }: Params) {
  try {
    await connectDB()
    const doc = await SeoMeta.findById(params.id)
    if (!doc) {
      return NextResponse.json({ success: false, error: "Not found" }, { status: 404 })
    }
    const normalize = (k: any) =>
      Array.isArray(k)
        ? k
        : typeof k === "string"
          ? k
              .split(",")
              .map((x) => x.trim())
              .filter(Boolean)
          : []
    const data = { ...doc.toObject(), keywords: normalize(doc.keywords) }
    return NextResponse.json({ success: true, data })
  } catch (error) {
    console.error("[GET /api/admin/seo/:id] error:", error)
    return NextResponse.json({ success: false, error: "Failed to fetch SEO meta" }, { status: 500 })
  }
}

export async function PUT(req: NextRequest, { params }: Params) {
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

    const updated = await SeoMeta.findByIdAndUpdate(
      params.id,
      { pageType, title, description, keywords: keywordsArr },
      { new: true, runValidators: true },
    )

    if (!updated) {
      return NextResponse.json({ success: false, error: "Not found" }, { status: 404 })
    }

    return NextResponse.json({ success: true, data: updated })
  } catch (error: any) {
    if (error?.code === 11000) {
      return NextResponse.json({ success: false, error: "SEO meta for this pageType already exists." }, { status: 409 })
    }
    console.error("[PUT /api/admin/seo/:id] error:", error)
    return NextResponse.json({ success: false, error: "Failed to update SEO meta" }, { status: 500 })
  }
}

export async function DELETE(_req: NextRequest, { params }: Params) {
  try {
    await connectDB()
    const deleted = await SeoMeta.findByIdAndDelete(params.id)
    if (!deleted) {
      return NextResponse.json({ success: false, error: "Not found" }, { status: 404 })
    }
    return NextResponse.json({ success: true, data: deleted })
  } catch (error) {
    console.error("[DELETE /api/admin/seo/:id] error:", error)
    return NextResponse.json({ success: false, error: "Failed to delete SEO meta" }, { status: 500 })
  }
}
