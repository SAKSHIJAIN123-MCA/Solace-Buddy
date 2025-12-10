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

export async function GET(req: NextRequest) {
  try {
    await connectDB()
    ensureAdmin(req)
    const { searchParams } = new URL(req.url)
    const active = searchParams.get("active")
    const q = active === "true" ? { active: true } : {}
    const data = await PackageModel.find(q).sort({ name: 1 }).lean()
    return NextResponse.json({ success: true, data })
  } catch (err: any) {
    if (err instanceof NextResponse) return err
    return NextResponse.json({ success: false, message: err.message || "Failed to fetch packages" }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    await connectDB()
    ensureAdmin(req)
    const body = await req.json()
    const raw = String(body?.name ?? "")
    const name = raw.toLowerCase().trim()
    if (!name) {
      return NextResponse.json({ success: false, message: "Package name is required" }, { status: 400 })
    }
    if (!/^[a-z0-9][a-z0-9\- ]{0,98}[a-z0-9]$/.test(name)) {
      return NextResponse.json(
        { success: false, message: "Name can contain letters, numbers, spaces and hyphens (2-100 chars)" },
        { status: 400 },
      )
    }

    const features = {
      freeListingOnWebsite: !!body?.features?.freeListingOnWebsite,
      freeSocialMediaPromotion: !!body?.features?.freeSocialMediaPromotion,
      top5SearchResult: !!body?.features?.top5SearchResult,
      bannerOnHomePageRecommendedBadge: !!body?.features?.bannerOnHomePageRecommendedBadge,
      pricePerTenantPlacement: !!body?.features?.pricePerTenantPlacement,
    }
    const active = body?.active === false ? false : true

    const advanceRule = {
      percent: Number(body?.advanceRule?.percent ?? body?.percent ?? 30),
      minRupees: Number(body?.advanceRule?.minRupees ?? body?.minRupees ?? 3000),
    }
    if (!isFinite(advanceRule.percent) || advanceRule.percent < 0) advanceRule.percent = 0
    if (!isFinite(advanceRule.minRupees) || advanceRule.minRupees < 0) advanceRule.minRupees = 0

    const doc = await PackageModel.findOneAndUpdate(
      { name },
      { $set: { name, features, active, advanceRule } },
      { new: true, upsert: true },
    )
    return NextResponse.json({ success: true, data: doc })
  } catch (err: any) {
    if (err instanceof NextResponse) return err
    return NextResponse.json({ success: false, message: err.message || "Failed to create package" }, { status: 500 })
  }
}
