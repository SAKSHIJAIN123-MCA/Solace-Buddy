import { NextResponse } from "next/server"
import { connectDB } from "@/lib/db"
import Wishlist from "@/lib/models/wishlist"

// GET - Check if property is in user's wishlist
export async function GET(request: Request) {
  try {
    await connectDB()
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get("userId")
    const propertyId = searchParams.get("propertyId")

    if (!userId || !propertyId) {
      return NextResponse.json({ success: false, message: "User ID and Property ID are required" }, { status: 400 })
    }

    const wishlistItem = await Wishlist.findOne({ userId, propertyId })

    return NextResponse.json({
      success: true,
      isInWishlist: !!wishlistItem,
    })
  } catch (err: any) {
    console.error("Wishlist Check Error:", err)
    return NextResponse.json({ success: false, message: err.message || "Failed to check wishlist" }, { status: 500 })
  }
}
