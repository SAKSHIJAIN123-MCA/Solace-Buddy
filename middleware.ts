import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

export function middleware(request: NextRequest) {
  // Example: Agar user logged in nahi hai to redirect karo
  const token = request.cookies.get("token")

  if (!token) {
    return NextResponse.redirect(new URL("/signin", request.url))
  }

  return NextResponse.next()
}

// Ye zaroori hai taaki middleware sirf /student/dashboard par chale
export const config = {
  matcher: ["/student/dashboard/:path*"],
}
