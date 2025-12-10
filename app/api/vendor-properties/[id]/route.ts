import { type NextRequest, NextResponse } from "next/server"
import { connectDB } from "@/lib/db"
import VendorProperty from "@/lib/models/vendorproper"
import jwt from "jsonwebtoken"

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key"

async function getVendorFromToken(request: NextRequest) {
  try {
    const token = request.cookies.get("vendor-token")?.value
    if (!token) return null
    const decoded = jwt.verify(token, JWT_SECRET) as any
    return decoded.vendorId
  } catch {
    return null
  }
}

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    await connectDB()
    const vendorId = await getVendorFromToken(request)
    if (!vendorId) return NextResponse.json({ success: false, error: "Authentication required" }, { status: 401 })

    const property = await VendorProperty.findOne({ _id: params.id, vendorId, isActive: true })
    if (!property) return NextResponse.json({ success: false, error: "Property not found" }, { status: 404 })

    await property.save()
    return NextResponse.json({ success: true, data: property })
  } catch {
    return NextResponse.json({ success: false, error: "Failed to fetch property" }, { status: 500 })
  }
}

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    await connectDB()
    const vendorId = await getVendorFromToken(request)
    if (!vendorId) return NextResponse.json({ success: false, error: "Authentication required" }, { status: 401 })

    const body = await request.json()

    const property = await VendorProperty.findOne({ _id: params.id, vendorId })
    if (!property) return NextResponse.json({ success: false, error: "Property not found" }, { status: 404 })

    // Updated required fields set (no address, no rentRange)
    const requiredFields = ["name", "type", "city", "state", "area", "pincode", "contactNumber", "gender"]
    for (const f of requiredFields) {
      if (!body[f] || !String(body[f]).trim()) {
        return NextResponse.json({ success: false, error: `${f} is required` }, { status: 400 })
      }
    }

    // Update fields
    property.name = String(body.name).trim()
    property.type = body.type
    property.city = String(body.city).trim()
    property.state = String(body.state).trim()
    property.area = String(body.area).trim()
    property.pincode = String(body.pincode).trim()
    property.contactNumber = String(body.contactNumber).trim()
    property.alternateNumber = body.alternateNumber?.trim() || ""
    property.email = body.email?.trim() || ""
    property.gender = body.gender
    property.nearbyLandmark = body.nearbyLandmark?.trim() || ""
    property.amenities = Array.isArray(body.amenities) ? body.amenities : []
    property.rules = Array.isArray(body.rules) ? body.rules : []
    property.description = body.description?.trim() || ""
    property.nearbyPlaces = body.nearbyPlaces?.trim() || ""
    // Images (main + common) and sync via model hook
    property.mainImage = body.mainImage?.trim() || ""
    property.commonPhotos = Array.isArray(body.commonPhotos) ? body.commonPhotos.filter(Boolean).slice(0, 8) : []

    // Optional PG meta
    property.pgNickName = body.pgNickName?.trim() || ""
    property.ownerName = body.ownerName?.trim() || ""
    property.ownerMobile = body.ownerMobile?.trim() || ""
    property.caretakerName = body.caretakerName?.trim() || ""
    property.caretakerMobile = body.caretakerMobile?.trim() || ""
    property.depositType = body.depositType || "one_rent"
    property.depositAmount = body.depositAmount || 0
    property.package = body.package?.trim() || "standard"

    // New optional fields
    property.mapLink = body.mapLink?.trim() || ""
    property.withFood = !!body.withFood
    property.withoutFood = !!body.withoutFood

    await property.save()
    return NextResponse.json({ success: true, data: property, message: "Property updated successfully" })
  } catch (error: any) {
    if (error?.name === "ValidationError") {
      const msgs = Object.values(error.errors).map((e: any) => e.message)
      return NextResponse.json({ success: false, error: `Validation failed: ${msgs.join(", ")}` }, { status: 400 })
    }
    return NextResponse.json({ success: false, error: error?.message || "Failed to update property" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    await connectDB()
    const vendorId = await getVendorFromToken(request)
    if (!vendorId) return NextResponse.json({ success: false, error: "Authentication required" }, { status: 401 })

    const property = await VendorProperty.findOne({ _id: params.id, vendorId })
    if (!property) return NextResponse.json({ success: false, error: "Property not found" }, { status: 404 })

    if (property.occupiedBeds > 0) {
      return NextResponse.json({ success: false, error: "Cannot delete property with occupied beds" }, { status: 400 })
    }

    property.isActive = false
    await property.save()
    return NextResponse.json({ success: true, message: "Property deleted successfully" })
  } catch {
    return NextResponse.json({ success: false, error: "Failed to delete property" }, { status: 500 })
  }
}
