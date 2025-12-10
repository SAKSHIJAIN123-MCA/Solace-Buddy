import { NextResponse } from "next/server"
import { connectDB } from "@/lib/db"
import { Inquiry } from "@/lib/models/inquiry"

function startOfToday() {
  const d = new Date()
  d.setHours(0, 0, 0, 0)
  return d
}

function startOfWeek() {
  const d = new Date()
  const day = d.getDay() // 0=Sun .. 6=Sat
  d.setDate(d.getDate() - day)
  d.setHours(0, 0, 0, 0)
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

    const [today, week, month, total] = await Promise.all([
      Inquiry.countDocuments({ createdAt: { $gte: startOfToday() } }),
      Inquiry.countDocuments({ createdAt: { $gte: startOfWeek() } }),
      Inquiry.countDocuments({ createdAt: { $gte: startOfMonth() } }),
      Inquiry.countDocuments({}),
    ])

    return NextResponse.json({
      success: true,
      data: {
        inquiries: { today, week, month, total },
      },
    })
  } catch (error) {
    console.error("[inquiries/stats] error:", error)
    return NextResponse.json({ success: false, error: "Failed to compute inquiries stats" }, { status: 500 })
  }
}
