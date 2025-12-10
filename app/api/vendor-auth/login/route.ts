import { type NextRequest, NextResponse } from "next/server"
import { connectDB } from "@/lib/db"
import VendorAuth from "@/lib/models/vendor-auth"
import jwt from "jsonwebtoken"

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key"

export async function POST(request: NextRequest) {
  try {
    await connectDB()

    const body = await request.json()
    const { email, password } = body

    // Validate required fields
    if (!email || !password) {
      return NextResponse.json({ success: false, error: "Email and password are required" }, { status: 400 })
    }

    // Find vendor auth record
    const vendorAuth = await VendorAuth.findOne({ email }).populate("vendorId")
    if (!vendorAuth) {
      console.log("Vendor auth not found for email:", email)
      return NextResponse.json({ success: false, error: "Invalid email or password" }, { status: 401 })
    }

    console.log("Found vendor auth:", {
      email: vendorAuth.email,
      isVerified: vendorAuth.isVerified,
      isLocked: vendorAuth.isLocked,
    })

    // Check if account is locked
    if (vendorAuth.isLocked) {
      console.log("Account is locked for email:", email)
      return NextResponse.json(
        {
          success: false,
          error: "Account is temporarily locked due to too many failed login attempts. Please try again later.",
        },
        { status: 423 },
      )
    }

    // Check password
    const isPasswordValid = await vendorAuth.comparePassword(password)
    if (!isPasswordValid) {
      console.log("Invalid password for email:", email)
      // Increment login attempts
      await vendorAuth.incLoginAttempts()
      return NextResponse.json({ success: false, error: "Invalid email or password" }, { status: 401 })
    }

    // This prevents login from failing if isVerified flag wasn't set during registration
    const vendor = vendorAuth.vendorId as any
    if (vendor.status !== "active") {
      console.log("Vendor account not active:", vendor.status)
      return NextResponse.json(
        { success: false, error: "Your account is not active. Please contact support." },
        { status: 401 },
      )
    }

    console.log("Login successful for vendor:", vendor.email)

    // Reset login attempts on successful login
    await vendorAuth.resetLoginAttempts()

    // Update last login
    vendorAuth.lastLogin = new Date()
    await vendorAuth.save()

    // Generate JWT token
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
    const response = NextResponse.json({
      success: true,
      message: "Login successful",
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
    })

    // Set HTTP-only cookie
    response.cookies.set("vendor-token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    })

    return response
  } catch (error: any) {
    console.error("Error logging in vendor:", error)
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}
