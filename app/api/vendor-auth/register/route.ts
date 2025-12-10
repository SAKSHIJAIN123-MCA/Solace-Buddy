import { type NextRequest, NextResponse } from "next/server"
import { connectDB } from "@/lib/db"
import Vendor from "@/lib/models/vendor"
import VendorAuth from "@/lib/models/vendor-auth"
import jwt from "jsonwebtoken"
import crypto from "crypto"

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key"

export async function POST(request: NextRequest) {
  try {
    await connectDB()

    const body = await request.json()
    const { name, ownerName, email, phone, password, confirmPassword, businessType } = body

    const errors: { [key: string]: string } = {}

    // Basic client-side validation for required fields (can be redundant with Mongoose, but good for early feedback)
    if (!name) errors.name = "Business name is required"
    if (!ownerName) errors.ownerName = "Owner name is required"
    if (!email) errors.email = "Email is required"
    if (!phone) errors.phone = "Phone number is required"
    if (!password) errors.password = "Password is required"
    if (!confirmPassword) errors.confirmPassword = "Confirm password is required"

    // Check if passwords match
    if (password !== confirmPassword) {
      errors.confirmPassword = "Passwords do not match"
    }

    // If basic checks fail, return early with collected errors
    if (Object.keys(errors).length > 0) {
      return NextResponse.json(
        { success: false, message: "Please correct the errors in the form.", errors },
        { status: 400 },
      )
    }

    // Check if vendor already exists (email uniqueness)
    const existingVendor = await Vendor.findOne({ email })
    if (existingVendor) {
      errors.email = "Vendor with this email already exists"
    }

    // Check if auth record already exists (email uniqueness)
    const existingAuth = await VendorAuth.findOne({ email })
    if (existingAuth) {
      errors.email = "Account with this email already exists"
    }

    if (Object.keys(errors).length > 0) {
      return NextResponse.json({ success: false, message: "Email already in use.", errors }, { status: 400 })
    }

    // Create vendor record
    const vendor = new Vendor({
      name,
      ownerName,
      email,
      phone,
      businessType: businessType || "PG",
      status: "active",
      verificationStatus: "verified",
    })

    await vendor.save()

    // Generate verification token (for future use/email verification if needed)
    const verificationToken = crypto.randomBytes(32).toString("hex")

    // This ensures login works immediately after registration
    const vendorAuth = new VendorAuth({
      email,
      password,
      vendorId: vendor._id,
      verificationToken,
      isVerified: true, // Auto-verify for all environments now
    })

    await vendorAuth.save()

    const token = jwt.sign(
      {
        vendorId: vendor._id,
        email: vendor.email,
        type: "vendor",
      },
      JWT_SECRET,
      { expiresIn: "7d" },
    )

    // Create response
    const response = NextResponse.json(
      {
        success: true,
        message: "Vendor registered successfully. Logging you in...",
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
          token,
        },
      },
      { status: 201 },
    )

    response.cookies.set("vendor-token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    })

    return response
  } catch (error: any) {
    console.error("Error registering vendor:", error)

    if (error.name === "ValidationError") {
      const validationErrors: { [key: string]: string } = {}
      for (const field in error.errors) {
        validationErrors[field] = error.errors[field].message
      }
      return NextResponse.json(
        { success: false, message: "Validation failed. Please check your input.", errors: validationErrors },
        { status: 400 },
      )
    }

    return NextResponse.json(
      { success: false, message: error.message || "An unexpected error occurred." },
      { status: 500 },
    )
  }
}
