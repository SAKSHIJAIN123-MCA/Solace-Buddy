import { NextResponse } from "next/server"
import { connectDB } from "@/lib/db"
import Student from "@/lib/models/student"
import StudentOTP from "@/lib/models/student-otp"
import bcrypt from "bcryptjs"
import { sendEmail } from "@/lib/mailer"

function genOTP() {
  return String(Math.floor(100000 + Math.random() * 900000))
}

export async function POST(req: Request) {
  try {
    const { email, purpose = "register" } = await req.json()
    if (!email) return NextResponse.json({ error: "Email is required" }, { status: 400 })

    await connectDB()

    const student = await Student.findOne({ email })
    if (purpose === "register" && student) {
      return NextResponse.json({ error: "Email already registered" }, { status: 409 })
    }
    if (purpose === "login" && !student) {
      return NextResponse.json({ error: "Account not found" }, { status: 404 })
    }

    const code = genOTP()
    const codeHash = await bcrypt.hash(code, 10)
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000) // 10 minutes

    await StudentOTP.create({ email: email.toLowerCase(), codeHash, purpose, expiresAt })

    await sendEmail({
      to: email,
      subject: "Your verification code",
      text: `Your verification code is ${code}. It is valid for 10 minutes.`,
      html: `<p>Your verification code is <strong>${code}</strong>. It is valid for 10 minutes.</p>`,
    })

    return NextResponse.json({ message: "OTP sent" })
  } catch (e) {
    console.error("[otp/send]", e)
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 })
  }
}
