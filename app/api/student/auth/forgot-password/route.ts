import { NextResponse } from "next/server"
import { connectDB } from "@/lib/db"
import Student from "@/lib/models/student"
import StudentAuth from "@/lib/models/student-auth"
import PasswordReset from "@/lib/models/password-reset"
import { sendPasswordResetEmail, testEmailConnection } from "@/lib/email"
import crypto from "crypto"

export async function POST(req: Request) {
  try {
    const { email } = await req.json()

    if (!email) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 })
    }

    console.log("[v0] Forgot password request for email:", email)

    await connectDB()

    // Check if student exists
    const studentAuth = await StudentAuth.findOne({ email: email.toLowerCase() })
    if (!studentAuth) {
      console.log("[v0] Student not found for email:", email)
      // Don't reveal if email exists or not for security
      return NextResponse.json({
        message: "If an account with this email exists, you will receive a password reset link.",
      })
    }

    const student = await Student.findById(studentAuth.studentId)
    if (!student) {
      console.log("[v0] Student profile not found for studentId:", studentAuth.studentId)
      return NextResponse.json({
        message: "If an account with this email exists, you will receive a password reset link.",
      })
    }

    console.log("[v0] Student found, generating reset token")

    // Generate reset token
    const resetToken = crypto.randomBytes(32).toString("hex")
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000) // 15 minutes

    // Delete any existing reset tokens for this email
    await PasswordReset.deleteMany({ email: email.toLowerCase() })

    // Create new reset token
    await PasswordReset.create({
      email: email.toLowerCase(),
      token: resetToken,
      expiresAt,
      used: false,
    })

    console.log("[v0] Reset token created, attempting to send email")

    const connectionTest = await testEmailConnection()
    if (!connectionTest) {
      console.error("[v0] SMTP connection test failed")
      return NextResponse.json({ error: "Email service is currently unavailable" }, { status: 500 })
    }

    try {
      const result = await sendPasswordResetEmail(email, resetToken)
      console.log("[v0] Email sent successfully:", result)
    } catch (emailError) {
      console.error("[v0] Failed to send password reset email:", emailError)
      return NextResponse.json(
        {
          error: "Failed to send email. Please check your email configuration.",
          details: emailError instanceof Error ? emailError.message : "Unknown error",
        },
        { status: 500 },
      )
    }

    return NextResponse.json({
      message: "Password reset link has been sent to your email address.",
    })
  } catch (error) {
    console.error("[v0] [forgot-password]", error)
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 })
  }
}
