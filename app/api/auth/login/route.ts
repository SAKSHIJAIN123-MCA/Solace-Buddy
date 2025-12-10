import { type NextRequest, NextResponse } from "next/server"
import { cookies } from "next/headers"
import jwt from "jsonwebtoken"

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key"

// Mock admin credentials - in production, use proper database and hashing
const ADMIN_CREDENTIALS = {
  email: "admin@hosteldashboard.com",
  password: "admin123",
}

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json()

    // Validate credentials
    if (email === ADMIN_CREDENTIALS.email && password === ADMIN_CREDENTIALS.password) {
      const adminToken = jwt.sign(
        {
          adminId: "admin-001",
          email: email,
          role: "admin",
        },
        JWT_SECRET,
        { expiresIn: "7d" },
      )

      // Create session token (in production, use JWT or proper session management)
      const sessionToken = "admin-session-" + Date.now()

      // Set cookies
      const cookieStore = await cookies()
      cookieStore.set("admin-session", sessionToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 60 * 60 * 24 * 7, // 7 days
      })

      cookieStore.set("admin-token", adminToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 60 * 60 * 24 * 7, // 7 days
      })

      return NextResponse.json({
        success: true,
        message: "Login successful",
        user: { email: email, role: "admin" },
      })
    } else {
      return NextResponse.json({ success: false, message: "Invalid credentials" }, { status: 401 })
    }
  } catch (error) {
    return NextResponse.json({ success: false, message: "Server error" }, { status: 500 })
  }
}
