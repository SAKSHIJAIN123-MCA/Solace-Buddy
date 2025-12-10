import { type NextRequest, NextResponse } from "next/server"
import { connectDB } from "@/lib/db"
import Vendor from "@/lib/models/vendor"
import VendorAuth from "@/lib/models/vendor-auth"
import jwt from "jsonwebtoken"

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key"

export async function GET(request: NextRequest) {
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

    // Find vendor
    const vendor = await Vendor.findById(decoded.vendorId)
    if (!vendor) {
      return NextResponse.json({ success: false, error: "Vendor not found" }, { status: 404 })
    }

    return NextResponse.json({
      success: true,
      data: {
        name: vendor.name,
        ownerName: vendor.ownerName,
        email: vendor.email,
        phone: vendor.phone,
      },
    })
  } catch (error: any) {
    console.error("Error getting vendor profile:", error)

    if (error.name === "JsonWebTokenError" || error.name === "TokenExpiredError") {
      return NextResponse.json({ success: false, error: "Invalid or expired token" }, { status: 401 })
    }

    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 })
  }
}

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
    const { name, ownerName, email, phone } = body

    // Validate required fields
    const errors: { [key: string]: string } = {}

    if (!name?.trim()) errors.name = "Business name is required"
    if (!ownerName?.trim()) errors.ownerName = "Owner name is required"
    if (!email?.trim()) errors.email = "Email is required"
    if (!phone?.trim()) errors.phone = "Phone number is required"

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (email && !emailRegex.test(email)) {
      errors.email = "Please enter a valid email address"
    }

    // Validate phone format (10 digits)
    const phoneRegex = /^\d{10}$/
    if (phone && !phoneRegex.test(phone.replace(/\D/g, ""))) {
      errors.phone = "Please enter a valid 10-digit phone number"
    }

    if (Object.keys(errors).length > 0) {
      return NextResponse.json({ success: false, message: "Please correct the errors", errors }, { status: 400 })
    }

    // Find current vendor
    const currentVendor = await Vendor.findById(decoded.vendorId)
    if (!currentVendor) {
      return NextResponse.json({ success: false, error: "Vendor not found" }, { status: 404 })
    }

    // Check if email is being changed and if new email already exists
    if (email !== currentVendor.email) {
      const existingVendor = await Vendor.findOne({
        email: email.toLowerCase(),
        _id: { $ne: decoded.vendorId },
      })

      if (existingVendor) {
        return NextResponse.json(
          { success: false, message: "Email already exists", errors: { email: "This email is already registered" } },
          { status: 400 },
        )
      }

      const existingVendorAuth = await VendorAuth.findOne({
        email: email.toLowerCase(),
        vendorId: { $ne: decoded.vendorId },
      })

      if (existingVendorAuth) {
        return NextResponse.json(
          { success: false, message: "Email already exists", errors: { email: "This email is already registered" } },
          { status: 400 },
        )
      }
    }

    // Update vendor profile
    const updatedVendor = await Vendor.findByIdAndUpdate(
      decoded.vendorId,
      {
        name: name.trim(),
        ownerName: ownerName.trim(),
        email: email.toLowerCase().trim(),
        phone: phone.trim(),
      },
      { new: true, runValidators: true },
    )

    if (email !== currentVendor.email) {
      await VendorAuth.findOneAndUpdate({ vendorId: decoded.vendorId }, { email: email.toLowerCase().trim() })
    }

    return NextResponse.json({
      success: true,
      message: "Profile updated successfully",
      data: {
        name: updatedVendor.name,
        ownerName: updatedVendor.ownerName,
        email: updatedVendor.email,
        phone: updatedVendor.phone,
      },
    })
  } catch (error: any) {
    console.error("Error updating vendor profile:", error)

    if (error.name === "JsonWebTokenError" || error.name === "TokenExpiredError") {
      return NextResponse.json({ success: false, error: "Invalid or expired token" }, { status: 401 })
    }

    if (error.name === "ValidationError") {
      const validationErrors: { [key: string]: string } = {}
      for (const field in error.errors) {
        validationErrors[field] = error.errors[field].message
      }
      return NextResponse.json(
        { success: false, message: "Validation failed", errors: validationErrors },
        { status: 400 },
      )
    }

    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 })
  }
}
