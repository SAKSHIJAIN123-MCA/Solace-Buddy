import { type NextRequest, NextResponse } from "next/server"
import jwt from "jsonwebtoken"
import { connectDB } from "@/lib/db"
import Vendor from "@/lib/models/vendor"

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key"

export async function GET(request: NextRequest) {
  try {
    // Get token from cookie
    const token = request.cookies.get("vendor-token")?.value

    if (!token) {
      return NextResponse.json({ success: false, error: "No token found" }, { status: 401 })
    }

    // Verify token
    const decoded = jwt.verify(token, JWT_SECRET) as any

    if (!decoded.vendorId || decoded.type !== "vendor") {
      return NextResponse.json({ success: false, error: "Invalid token" }, { status: 401 })
    }

    // Connect to database and fetch vendor data
    await connectDB()
    const vendor = await Vendor.findById(decoded.vendorId)

    if (!vendor || vendor.status !== "active") {
      return NextResponse.json({ success: false, error: "Vendor not found or inactive" }, { status: 401 })
    }

    return NextResponse.json({
      success: true,
      data: {
        vendor: {
          id: vendor._id,
          name: vendor.name,
          ownerName: vendor.ownerName,
          email: vendor.email,
          phone: vendor.phone,
          businessType: vendor.businessType,
          status: vendor.status,
          verificationStatus: vendor.verificationStatus,
        },
      },
    })
  } catch (error: any) {
    console.error("Session check error:", error)
    return NextResponse.json({ success: false, error: "Session check failed" }, { status: 401 })
  }
}
