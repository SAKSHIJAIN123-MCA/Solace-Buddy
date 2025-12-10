import { type NextRequest, NextResponse } from "next/server"
import { connectDB } from "@/lib/db"
import VendorProperty from "@/lib/models/vendorproper"
import jwt from "jsonwebtoken"
import mongoose from "mongoose"

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key"
const DISABLE_ADMIN_AUTH = process.env.DISABLE_ADMIN_AUTH === "true"

async function getAdminFromToken(request: NextRequest) {
  try {
    if (DISABLE_ADMIN_AUTH) {
      return "dev-admin"
    }
    const token = request.cookies.get("admin-token")?.value
    if (!token) return null
    const decoded = jwt.verify(token, JWT_SECRET) as any
    return decoded.adminId
  } catch (error) {
    return null
  }
}

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    await connectDB()

    const adminId = await getAdminFromToken(request)
    if (!adminId) {
      return NextResponse.json({ success: false, error: "Admin authentication required" }, { status: 401 })
    }

    const vendorId = params.id
    if (!mongoose.Types.ObjectId.isValid(vendorId)) {
      return NextResponse.json({ success: false, error: "Invalid vendor ID" }, { status: 400 })
    }

    const vendorObjectId = new mongoose.Types.ObjectId(vendorId)

    const properties = await VendorProperty.find({
      vendorId: vendorObjectId,
      isActive: true,
    })
      .select("name pgNickName propertyId type city state totalBeds occupiedBeds availableBeds")
      .sort({ createdAt: -1 })

    return NextResponse.json({
      success: true,
      data: properties,
    })
  } catch (error: any) {
    console.error("Error fetching vendor properties:", error)
    return NextResponse.json({ success: false, error: "Failed to fetch vendor properties" }, { status: 500 })
  }
}
