import { type NextRequest, NextResponse } from "next/server"
import { cookies } from "next/headers"

export async function GET(request: NextRequest) {
  try {
    const cookieStore = await cookies()
    const session = cookieStore.get("admin-session")

    if (session && session.value.startsWith("admin-session-")) {
      return NextResponse.json({
        success: true,
        user: { email: "admin@hosteldashboard.com", role: "admin" },
      })
    } else {
      return NextResponse.json({ success: false, message: "Not authenticated" }, { status: 401 })
    }
  } catch (error) {
    return NextResponse.json({ success: false, message: "Server error" }, { status: 500 })
  }
}
