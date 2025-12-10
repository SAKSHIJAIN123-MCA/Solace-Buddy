import { type NextRequest, NextResponse } from "next/server"
import { connectDB } from "@/lib/db"
import Vendor from "@/lib/models/vendor"
import VendorAuth from "@/lib/models/vendor-auth"
import { sendEmail } from "@/lib/mailer"

function generateRandomPassword(length = 12): string {
  const charset = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*"
  let password = ""
  for (let i = 0; i < length; i++) {
    password += charset.charAt(Math.floor(Math.random() * charset.length))
  }
  return password
}

// GET - Fetch all vendors
export async function GET(request: NextRequest) {
  try {
    await connectDB()

    const { searchParams } = new URL(request.url)
    const search = searchParams.get("search") || ""
    const status = searchParams.get("status") || "all"
    const businessType = searchParams.get("businessType") || "all"
    const page = Number.parseInt(searchParams.get("page") || "1")
    const limit = Number.parseInt(searchParams.get("limit") || "10")
    const skip = (page - 1) * limit

    // Build query
    const query: any = {}

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: "i" } },
        { ownerName: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
      ]
    }

    if (status !== "all") {
      query.status = status
    }

    if (businessType !== "all") {
      query.businessType = businessType
    }

    const vendors = await Vendor.find(query).sort({ registrationDate: -1 }).skip(skip).limit(limit)

    const total = await Vendor.countDocuments(query)

    // Get statistics
    const stats = await Vendor.aggregate([
      {
        $group: {
          _id: "$status",
          count: { $sum: 1 },
        },
      },
    ])

    const statistics = {
      total,
      active: stats.find((s) => s._id === "active")?.count || 0,
      pending: stats.find((s) => s._id === "pending")?.count || 0,
      suspended: stats.find((s) => s._id === "suspended")?.count || 0,
      rejected: stats.find((s) => s._id === "rejected")?.count || 0,
    }

    return NextResponse.json({
      success: true,
      data: vendors,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
      statistics,
    })
  } catch (error: any) {
    console.error("Error fetching vendors:", error)
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}

// POST - Create new vendor
export async function POST(request: NextRequest) {
  try {
    await connectDB()

    const body = await request.json()

    // Check if email already exists
    const existingVendorEmail = await Vendor.findOne({ email: body.email })
    if (existingVendorEmail) {
      return NextResponse.json({ success: false, error: "Vendor with this email already exists" }, { status: 400 })
    }

    const vendor = new Vendor(body)
    await vendor.save()

    const generatedPassword = generateRandomPassword()
    const vendorAuth = new VendorAuth({
      email: body.email,
      password: generatedPassword,
      vendorId: vendor._id,
      isVerified: false,
    })
    await vendorAuth.save()

    try {
      const emailHtml = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #333; border-bottom: 2px solid #007bff; padding-bottom: 10px;">Welcome to Our Platform</h2>
          
          <p>Dear ${body.ownerName},</p>
          
          <p>Your vendor account has been created successfully! Here are your login credentials:</p>
          
          <div style="background-color: #f5f5f5; padding: 20px; border-radius: 5px; margin: 20px 0;">
            <p style="margin: 10px 0;"><strong>Email Address:</strong> ${body.email}</p>
            <p style="margin: 10px 0;"><strong>Password:</strong> ${generatedPassword}</p>
          </div>
          
          <p style="color: #666; font-size: 14px;">
            <strong>Important:</strong> Please log in with these credentials.
          </p>
          
          <p>If you have any questions, please contact our support team.</p>
          
          <p>Best regards,<br>The Support Team</p>
        </div>
      `

      await sendEmail({
        to: body.email,
        subject: "Vendor Account Created - Login Credentials",
        html: emailHtml,
        text: `Welcome to Our Platform\n\nDear ${body.ownerName},\n\nYour vendor account has been created successfully!\n\nLogin Credentials:\nEmail Address: ${body.email}\nPassword: ${generatedPassword}\n\nPlease log in and change your password immediately for security purposes.\n\nBest regards,\nThe Support Team`,
      })
    } catch (emailError) {
      console.error("Error sending welcome email:", emailError)
      // Don't fail the vendor creation if email fails, just log the error
    }

    return NextResponse.json(
      {
        success: true,
        data: vendor,
        message: "Vendor created successfully and credentials sent to email",
      },
      { status: 201 },
    )
  } catch (error: any) {
    console.error("Error creating vendor:", error)

    if (error.name === "ValidationError") {
      const errors = Object.values(error.errors).map((err: any) => err.message)
      return NextResponse.json({ success: false, error: errors.join(", ") }, { status: 400 })
    }

    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}
