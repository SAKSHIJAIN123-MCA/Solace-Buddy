import { NextResponse } from "next/server"
import { connectDB } from "@/lib/db"
import Wishlist from "@/lib/models/wishlist"
import VendorProperty from "@/lib/models/vendorproper"

// GET - Fetch user's wishlist
export async function GET(request: Request) {
  try {
    await connectDB()
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get("userId")

    if (!userId) {
      return NextResponse.json({ success: false, message: "User ID is required" }, { status: 400 })
    }

    // Get wishlist items with populated property data
    const wishlistItems = await Wishlist.find({ userId })
      .populate({
        path: "propertyId",
        model: VendorProperty,
        select:
          "propertyId name type address city state gender rentRange totalBeds availableBeds amenities images nearbyLandmark slug pgNickName mainImage commonPhotos",
      })
      .sort({ createdAt: -1 })
      .lean()

    // Transform the data to match the expected format
    const transformedItems = wishlistItems
      .filter((item) => item.propertyId) // Filter out items where property was deleted
      .map((item: any) => {
        const property = item.propertyId
        return {
          _id: item._id,
          userId: item.userId,
          propertyId: property._id,
          property: {
            _id: String(property._id),
            propertyId: property.propertyId,
            name: property.pgNickName || property.name,
            type: property.type || "PG",
            address: property.address,
            city: property.city,
            state: property.state,
            gender: property.gender,
            rentRange: property.rentRange || { min: 0, max: 0 },
            totalBeds: property.totalBeds || 0,
            availableBeds: property.availableBeds || 0,
            amenities: Array.isArray(property.amenities) ? property.amenities : [],
            images: property.mainImage
              ? [property.mainImage, ...(Array.isArray(property.commonPhotos) ? property.commonPhotos : [])]
              : Array.isArray(property.images) && property.images.length
                ? property.images
                : ["/diverse-property-showcase.png"],
            nearbyLandmark: property.nearbyLandmark || "",
            slug: property.slug,
          },
          createdAt: item.createdAt,
          updatedAt: item.updatedAt,
        }
      })

    return NextResponse.json({
      success: true,
      data: transformedItems,
      total: transformedItems.length,
    })
  } catch (err: any) {
    console.error("Wishlist GET Error:", err)
    return NextResponse.json({ success: false, message: err.message || "Failed to fetch wishlist" }, { status: 500 })
  }
}

// POST - Add property to wishlist
export async function POST(request: Request) {
  try {
    await connectDB()
    const body = await request.json()
    const { userId, propertyId } = body

    if (!userId || !propertyId) {
      return NextResponse.json({ success: false, message: "User ID and Property ID are required" }, { status: 400 })
    }

    // Check if property exists
    const property = await VendorProperty.findById(propertyId)
    if (!property) {
      return NextResponse.json({ success: false, message: "Property not found" }, { status: 404 })
    }

    // Check if already in wishlist
    const existingItem = await Wishlist.findOne({ userId, propertyId })
    if (existingItem) {
      return NextResponse.json({ success: false, message: "Property already in wishlist" }, { status: 409 })
    }

    // Add to wishlist
    const wishlistItem = new Wishlist({
      userId,
      propertyId,
    })

    await wishlistItem.save()

    return NextResponse.json({
      success: true,
      message: "Property added to wishlist",
      data: wishlistItem,
    })
  } catch (err: any) {
    console.error("Wishlist POST Error:", err)
    return NextResponse.json({ success: false, message: err.message || "Failed to add to wishlist" }, { status: 500 })
  }
}

// DELETE - Remove property from wishlist
export async function DELETE(request: Request) {
  try {
    await connectDB()
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get("userId")
    const propertyId = searchParams.get("propertyId")

    if (!userId || !propertyId) {
      return NextResponse.json({ success: false, message: "User ID and Property ID are required" }, { status: 400 })
    }

    const deletedItem = await Wishlist.findOneAndDelete({ userId, propertyId })

    if (!deletedItem) {
      return NextResponse.json({ success: false, message: "Item not found in wishlist" }, { status: 404 })
    }

    return NextResponse.json({
      success: true,
      message: "Property removed from wishlist",
    })
  } catch (err: any) {
    console.error("Wishlist DELETE Error:", err)
    return NextResponse.json(
      { success: false, message: err.message || "Failed to remove from wishlist" },
      { status: 500 },
    )
  }
}
