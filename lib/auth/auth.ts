import type { NextRequest } from "next/server"
import jwt from "jsonwebtoken"

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key"

export default async function getVendorFromToken(request: NextRequest): Promise<string | null> {
  try {
    const authHeader = request.headers.get("authorization")
    const token = authHeader?.replace("Bearer ", "") || request.cookies.get("token")?.value

    if (!token) {
      return null
    }

    const decoded = jwt.verify(token, JWT_SECRET) as any
    return decoded.vendorId || decoded.id || null
  } catch (error) {
    console.error("Auth error:", error)
    return null
  }
}
