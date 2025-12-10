import { NextResponse } from "next/server"
import { connectDB } from "@/lib/db"
import VendorProperty from "@/lib/models/vendorproper"

export async function GET(_req: Request, { params }: { params: { slug: string } }) {
  try {
    await connectDB()
    const { slug } = params
    let doc: any = await VendorProperty.findOne({ slug }).lean()
    if (!doc && slug.match(/^[0-9a-fA-F]{24}$/)) {
      doc = await VendorProperty.findById(slug).lean()
    }
    if (!doc) return NextResponse.json({ success: false, message: "Not found" }, { status: 404 })

    return NextResponse.json({
      success: true,
      data: {
        _id: String(doc._id),
        slug: doc.slug || null,
        propertyId: doc.propertyId,
        name: doc.name,
        type: doc.type || "PG",
        address: doc.address,
        city: doc.city,
        state: doc.state,
        pincode: doc.pincode,
        contactNumber: doc.contactNumber,
        email: doc.email || "",
        gender: doc.gender,
        nearbyLandmark: doc.nearbyLandmark || "",
        totalRooms: doc.totalRooms || 0,
        totalBeds: doc.totalBeds || 0,
        availableBeds: doc.availableBeds || 0,
        rentRange: doc.rentRange || { min: 0, max: 0 },
        monthlyRevenue: doc.monthlyRevenue || 0,
        amenities: Array.isArray(doc.amenities) ? doc.amenities : [],
        rules: Array.isArray(doc.rules) ? doc.rules : [],
        description: doc.description || "",
        nearbyPlaces: doc.nearbyPlaces || "",
        images: Array.isArray(doc.images) && doc.images.length ? doc.images : ["/diverse-property-showcase.png"],
        rooms: Array.isArray(doc.rooms) ? doc.rooms : [],
        isActive: !!doc.isActive,
        createdAt: doc.createdAt,
        updatedAt: doc.updatedAt,
      },
    })
  } catch (err: any) {
    return NextResponse.json({ success: false, message: err.message || "Failed to load property" }, { status: 500 })
  }
}
