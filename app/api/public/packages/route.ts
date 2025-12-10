import { type NextRequest, NextResponse } from "next/server"
import PackageModel from "@/lib/models/package"
import { connectDB } from "@/lib/db"

export async function GET(req: NextRequest) {
  try {
    await connectDB()
    const { searchParams } = new URL(req.url)
    const name = (searchParams.get("name") || "").toLowerCase().trim()
    const q: any = { active: true }
    if (name) q.name = name
    const data = await PackageModel.find(q, {
      name: 1,
      advanceRule: 1,
      active: 1,
      _id: 1,
    })
      .sort({ name: 1 })
      .lean()
    return NextResponse.json({ success: true, data })
  } catch (err: any) {
    return NextResponse.json({ success: false, message: err.message || "Failed to fetch packages" }, { status: 500 })
  }
}
