import { NextResponse } from "next/server"
import { connectDB } from "@/lib/db"
import Referral from "@/lib/models/referral"

function startOfToday(d = new Date()) {
  const x = new Date(d)
  x.setHours(0, 0, 0, 0)
  return x
}

function startOfWeek(d = new Date()) {
  const x = new Date(d)
  const day = x.getDay() // 0=Sun
  x.setDate(x.getDate() - day)
  x.setHours(0, 0, 0, 0)
  return x
}

function startOfMonth(d = new Date()) {
  return new Date(d.getFullYear(), d.getMonth(), 1, 0, 0, 0, 0)
}

export async function GET() {
  try {
    await connectDB()
    const now = new Date()
    const todayStart = startOfToday(now)
    const weekStart = startOfWeek(now)
    const monthStart = startOfMonth(now)

    const [today, week, month, total] = await Promise.all([
      Referral.countDocuments({ createdAt: { $gte: todayStart, $lte: now } }),
      Referral.countDocuments({ createdAt: { $gte: weekStart, $lte: now } }),
      Referral.countDocuments({ createdAt: { $gte: monthStart, $lte: now } }),
      Referral.countDocuments({}),
    ])

    return NextResponse.json({
      success: true,
      data: {
        referrals: { today, week, month, total },
      },
    })
  } catch (e: any) {
    console.error("[referrals-stats][GET]", e)
    return NextResponse.json({ success: false, error: e.message || "Failed to load referral stats" }, { status: 500 })
  }
}
