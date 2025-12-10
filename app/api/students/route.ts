import { type NextRequest, NextResponse } from "next/server"
import { connectDB } from "@/lib/db"
import Student from "@/lib/models/student"
import StudentAuth from "@/lib/models/student-auth"
import { sendEmail } from "@/lib/mailer"
import bcrypt from "bcryptjs"

// Helper function to generate random password
function generatePassword(length = 12): string {
  const uppercase = "ABCDEFGHIJKLMNOPQRSTUVWXYZ"
  const lowercase = "abcdefghijklmnopqrstuvwxyz"
  const numbers = "0123456789"
  const special = "!@#$%^&*"

  const allChars = uppercase + lowercase + numbers + special
  let password = ""

  // Ensure at least one character from each category
  password += uppercase[Math.floor(Math.random() * uppercase.length)]
  password += lowercase[Math.floor(Math.random() * lowercase.length)]
  password += numbers[Math.floor(Math.random() * numbers.length)]
  password += special[Math.floor(Math.random() * special.length)]

  // Fill the rest randomly
  for (let i = password.length; i < length; i++) {
    password += allChars[Math.floor(Math.random() * allChars.length)]
  }

  // Shuffle the password
  return password
    .split("")
    .sort(() => Math.random() - 0.5)
    .join("")
}

export async function GET(request: NextRequest) {
  try {
    await connectDB()
    const { searchParams } = new URL(request.url)
    const search = searchParams.get("search") || ""
    const limit = Number.parseInt(searchParams.get("limit") || "50")
    const page = Number.parseInt(searchParams.get("page") || "1")

    const query: any = {}
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
        { city: { $regex: search, $options: "i" } },
      ]
    }

    const students = await Student.find(query, { name: 1, email: 1, city: 1, phone: 1, createdAt: 1 })
      .sort({ createdAt: -1 })
      .limit(limit)
      .skip((page - 1) * limit)

    const total = await Student.countDocuments(query)

    return NextResponse.json({
      success: true,
      data: students,
      pagination: { page, limit, total },
    })
  } catch (error: any) {
    console.error("[students] GET error:", error)
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    await connectDB()
    const body = await request.json()
    const { name, email, city, phone } = body || {}

    if (!name || !email || !city || !phone) {
      return NextResponse.json({ success: false, error: "name, email, city, and phone are required" }, { status: 400 })
    }

    const exists = await Student.findOne({ email })
    if (exists) {
      return NextResponse.json({ success: false, error: "Student with this email already exists" }, { status: 400 })
    }

    const autoPassword = generatePassword()

    const student = await Student.create({ name, email, city, phone })

    const salt = await bcrypt.genSalt(10)
    const passwordHash = await bcrypt.hash(autoPassword, salt)

    await StudentAuth.create({
      studentId: student._id,
      email,
      passwordHash,
    })

    try {
      await sendEmail({
        to: email,
        subject: "Your Student Account Login Credentials",
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
            <h2 style="color: #333;">Welcome to Our Platform!</h2>
            <p>Dear ${name},</p>
            <p>Your student account has been successfully created. Here are your login credentials:</p>
            
            <div style="background-color: #f5f5f5; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <h3 style="color: #333; margin-top: 0;">User login credentials:</h3>
              <p><strong>Email Address:</strong> ${email}</p>
              <p><strong>Password:</strong> ${autoPassword}</p>
            </div>
            
            <p style="color: #666;">Please keep these credentials safe. We recommend changing your password after your first login.</p>
            <p style="color: #666;">If you have any questions, please contact our support team.</p>
            
            <p>Best regards,<br>The Platform Team</p>
          </div>
        `,
      })
    } catch (emailError) {
      console.error("[students] Email send error:", emailError)
      // Continue even if email fails - student is still created
    }

    return NextResponse.json(
      { success: true, data: student, message: "Student created successfully and login credentials sent to email" },
      { status: 201 },
    )
  } catch (error: any) {
    console.error("[students] POST error:", error)
    if (error.name === "ValidationError") {
      const errors = Object.values(error.errors).map((err: any) => err.message)
      return NextResponse.json({ success: false, error: errors.join(", ") }, { status: 400 })
    }
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}
