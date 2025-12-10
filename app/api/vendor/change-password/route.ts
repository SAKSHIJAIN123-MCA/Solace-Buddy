import { type NextRequest, NextResponse } from "next/server"
import { connectDB } from "@/lib/db"
import VendorAuth from "@/lib/models/vendor-auth"
import jwt from "jsonwebtoken"

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key"

export async function PUT(request: NextRequest) {
  try {
    await connectDB()

    // Get token from cookie or Authorization header
    const token =
      request.cookies.get("vendor-token")?.value || request.headers.get("Authorization")?.replace("Bearer ", "")

    if (!token) {
      return NextResponse.json({ success: false, error: "No authentication token provided" }, { status: 401 })
    }

    // Verify token
    const decoded = jwt.verify(token, JWT_SECRET) as any

    const body = await request.json()
    const { currentPassword, newPassword, confirmPassword } = body

    // Validate required fields
    const errors: { [key: string]: string } = {}

    if (!currentPassword) errors.currentPassword = "Current password is required"
    if (!newPassword) errors.newPassword = "New password is required"
    if (!confirmPassword) errors.confirmPassword = "Confirm password is required"

    // Check if new passwords match
    if (newPassword && confirmPassword && newPassword !== confirmPassword) {
      errors.confirmPassword = "New passwords do not match"
    }

    // Validate password strength
    if (newPassword && newPassword.length < 6) {
      errors.newPassword = "Password must be at least 6 characters long"
    }

    if (Object.keys(errors).length > 0) {
      return NextResponse.json({ success: false, message: "Please correct the errors", errors }, { status: 400 })
    }

    // Find vendor auth record
    const vendorAuth = await VendorAuth.findOne({ vendorId: decoded.vendorId })
    if (!vendorAuth) {
      return NextResponse.json({ success: false, error: "Vendor authentication record not found" }, { status: 404 })
    }

    // Verify current password
    const isCurrentPasswordValid = await vendorAuth.comparePassword(currentPassword)
    if (!isCurrentPasswordValid) {
      return NextResponse.json(
        {
          success: false,
          message: "Current password is incorrect",
          errors: { currentPassword: "Current password is incorrect" },
        },
        { status: 400 },
      )
    }

    // Update password
    vendorAuth.password = newPassword
    await vendorAuth.save()

    return NextResponse.json({
      success: true,
      message: "Password changed successfully",
    })
  } catch (error: any) {
    console.error("Error changing vendor password:", error)

    if (error.name === "JsonWebTokenError" || error.name === "TokenExpiredError") {
      return NextResponse.json({ success: false, error: "Invalid or expired token" }, { status: 401 })
    }

    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 })
  }
}
