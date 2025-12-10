import { type NextRequest, NextResponse } from "next/server"
import PackageModel from "@/lib/models/package"
import { connectDB } from "@/lib/db"

function ensureAdmin(req: NextRequest) {
  if (process.env.DISABLE_ADMIN_AUTH === "true") return
  const token = req.cookies.get("admin-token")?.value
  if (!token) {
    throw NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 })
  }
}

export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  try {
    await connectDB()
    const doc = await PackageModel.findById(params.id).lean()
    if (!doc) return NextResponse.json({ success: false, message: "Not found" }, { status: 404 })
    return NextResponse.json({ success: true, data: doc })
  } catch (err: any) {
    if (err instanceof NextResponse) return err
    return NextResponse.json({ success: false, message: err.message || "Failed to fetch package" }, { status: 500 })
  }
}

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    await connectDB()
    ensureAdmin(req)
    const body = await req.json()
    const updates: any = {}
    if (typeof body.name === "string") {
      const name = body.name.toLowerCase().trim()
      if (!name) {
        return NextResponse.json({ success: false, message: "Package name is required" }, { status: 400 })
      }
      if (!/^[a-z0-9][a-z0-9\- ]{0,98}[a-z0-9]$/.test(name)) {
        return NextResponse.json(
          { success: false, message: "Name can contain letters, numbers, spaces and hyphens (2-100 chars)" },
          { status: 400 },
        )
      }
      updates.name = name
    }
    if (body.features && typeof body.features === "object") {
      updates["features"] = {
        freeListingOnWebsite: !!body.features.freeListingOnWebsite,
        freeSocialMediaPromotion: !!body.features.freeSocialMediaPromotion,
        top5SearchResult: !!body.features.top5SearchResult,
        bannerOnHomePageRecommendedBadge: !!body.features.bannerOnHomePageRecommendedBadge,
        pricePerTenantPlacement: !!body.features.pricePerTenantPlacement,
      }
    }
    if (typeof body.active === "boolean") updates.active = body.active

    if (body.advanceRule || typeof body.percent !== "undefined" || typeof body.minRupees !== "undefined") {
      const percent = Number(body?.advanceRule?.percent ?? body?.percent)
      const minRupees = Number(body?.advanceRule?.minRupees ?? body?.minRupees)
      updates.advanceRule = {
        ...(typeof percent === "number" && isFinite(percent) ? { percent: Math.max(0, percent) } : {}),
        ...(typeof minRupees === "number" && isFinite(minRupees) ? { minRupees: Math.max(0, minRupees) } : {}),
      }
    }

    const doc = await PackageModel.findByIdAndUpdate(params.id, { $set: updates }, { new: true })
    if (!doc) return NextResponse.json({ success: false, message: "Not found" }, { status: 404 })
    return NextResponse.json({ success: true, data: doc })
  } catch (err: any) {
    if (err instanceof NextResponse) return err
    return NextResponse.json({ success: false, message: err.message || "Failed to update package" }, { status: 500 })
  }
}

export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  try {
    await connectDB()
    await PackageModel.findByIdAndDelete(params.id)
    return NextResponse.json({ success: true })
  } catch (err: any) {
    if (err instanceof NextResponse) return err
    return NextResponse.json({ success: false, message: err.message || "Failed to delete package" }, { status: 500 })
  }
}
