import { NextResponse, type NextRequest } from "next/server"
import { connectDB } from "@/lib/db"
import VendorProperty from "@/lib/models/vendorproper"
import jwt from "jsonwebtoken"

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key"
const DISABLE_ADMIN_AUTH = process.env.DISABLE_ADMIN_AUTH === "true"

async function getAdminFromToken(request: NextRequest) {
  try {
    if (DISABLE_ADMIN_AUTH) return "dev-admin"
    const token = request.cookies.get("admin-token")?.value
    if (!token) return null
    const decoded = jwt.verify(token, JWT_SECRET) as any
    return decoded.adminId
  } catch {
    return null
  }
}

function startOfToday() {
  const d = new Date()
  d.setHours(0, 0, 0, 0)
  return d
}

function startOfWeek() {
  const d = new Date()
  const day = d.getDay() // 0=Sun
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

function endOfToday() {
  const d = new Date()
  d.setHours(23, 59, 59, 999)
  return d
}

export async function GET(request: NextRequest) {
  try {
    await connectDB()

    const adminId = await getAdminFromToken(request)
    if (!adminId) {
      return NextResponse.json({ success: false, error: "Admin authentication required" }, { status: 401 })
    }

    const todayStart = startOfToday()
    const todayEnd = endOfToday()
    const weekStart = startOfWeek()
    const monthStart = startOfMonth()

    const [today, week, month, total] = await Promise.all([
      VendorProperty.countDocuments({ isActive: true, createdAt: { $gte: todayStart, $lte: todayEnd } }),
      VendorProperty.countDocuments({ isActive: true, createdAt: { $gte: weekStart } }),
      VendorProperty.countDocuments({ isActive: true, createdAt: { $gte: monthStart } }),
      VendorProperty.countDocuments({ isActive: true }),
    ])

    return NextResponse.json({
      success: true,
      data: {
        properties: { today, week, month, total },
      },
    })
  } catch (error: any) {
    console.error("[v0] /api/admin/vendor-properties/stats error:", error)
    return NextResponse.json({ success: false, error: "Failed to fetch property stats" }, { status: 500 })
  }
}
