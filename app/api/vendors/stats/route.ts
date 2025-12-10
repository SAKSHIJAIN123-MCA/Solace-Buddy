import { NextResponse } from "next/server"
import { connectDB } from "@/lib/db"
import Vendor from "@/lib/models/vendor"

function startOfToday() {
  const d = new Date()
  d.setHours(0, 0, 0, 0)
  return d
}

function startOfWeekMonday() {
  // Week starts on Monday
  const d = new Date()
  const day = d.getDay() // 0..6 (Sun..Sat)
  const diff = (day + 6) % 7 // days since Monday
  d.setHours(0, 0, 0, 0)
  d.setDate(d.getDate() - diff)
  return d
}

function startOfMonth() {
  const d = new Date()
  d.setDate(1)
  d.setHours(0, 0, 0, 0)
  return d
}

export async function GET() {
  try {
    await connectDB()

    const now = new Date()
    const today = startOfToday()
    const week = startOfWeekMonday()
    const month = startOfMonth()

    const [todayCount, weekCount, monthCount, total] = await Promise.all([
      Vendor.countDocuments({ registrationDate: { $gte: today, $lte: now } }),
      Vendor.countDocuments({ registrationDate: { $gte: week, $lte: now } }),
      Vendor.countDocuments({ registrationDate: { $gte: month, $lte: now } }),
      Vendor.countDocuments({}),
    ])

    return NextResponse.json({
      success: true,
      data: {
        vendors: {
          today: todayCount,
          week: weekCount,
          month: monthCount,
          total,
        },
      },
    })
  } catch (error: any) {
    console.error("[vendors/stats] GET error:", error)
    return NextResponse.json({ success: false, error: error.message || "Failed to load vendor stats" }, { status: 500 })
  }
}
