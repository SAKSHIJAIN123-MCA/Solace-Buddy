import { type NextRequest, NextResponse } from "next/server"
import { connectDB } from "@/lib/db"
import VendorProperty from "@/lib/models/vendorproper"
import jwt from "jsonwebtoken"

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key"
const DISABLE_ADMIN_AUTH = process.env.DISABLE_ADMIN_AUTH === "true"

async function getAdminFromToken(request: NextRequest) {
  try {
    if (DISABLE_ADMIN_AUTH) {
      return "dev-admin"
    }
    const token = request.cookies.get("admin-token")?.value
    if (!token) return null
    const decoded = jwt.verify(token, JWT_SECRET) as any
    return decoded.adminId
  } catch (error) {
    return null
  }
}

const cleaned = (v: unknown) => (typeof v === "string" && v.trim() ? v.trim() : undefined)

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    await connectDB()

    const adminId = await getAdminFromToken(request)
    if (!adminId) {
      return NextResponse.json({ success: false, error: "Admin authentication required" }, { status: 401 })
    }

    const property = await VendorProperty.findOne({
      _id: params.id,
      isActive: true,
    }).populate("amenities", "name icon status _id")

    if (!property) {
      return NextResponse.json({ success: false, error: "Property not found" }, { status: 404 })
    }

    await property.save()

    return NextResponse.json({
      success: true,
      data: property,
    })
  } catch (error: any) {
    console.error("Error fetching property:", error)
    return NextResponse.json({ success: false, error: "Failed to fetch property" }, { status: 500 })
  }
}

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    await connectDB()

    const adminId = await getAdminFromToken(request)
    if (!adminId) {
      return NextResponse.json({ success: false, error: "Admin authentication required" }, { status: 401 })
    }

    const body = await request.json()
    console.log("Received property update data:", body)

    const property = await VendorProperty.findOne({
      _id: params.id,
      isActive: true,
    })

    if (!property) {
      return NextResponse.json({ success: false, error: "Property not found" }, { status: 404 })
    }

    const requiredFields = ["name", "type", "city", "state", "area", "pincode", "contactNumber", "gender"]
    for (const field of requiredFields) {
      if (!body[field] || !body[field].toString().trim()) {
        return NextResponse.json({ success: false, error: `${field} is required` }, { status: 400 })
      }
    }

    const amenityIds = Array.isArray(body.amenities)
      ? body.amenities
          .map((id: any) => {
            if (typeof id === "string" && id && id.trim() && id.length <= 48) return id
            if (typeof id === "object" && id._id) return id._id
            return null
          })
          .filter(Boolean)
      : []
    property.amenities = amenityIds

    property.pgNickName = cleaned(body.pgNickName) ?? property.pgNickName
    property.ownerName = cleaned(body.ownerName) ?? property.ownerName
    property.ownerMobile = cleaned(body.ownerMobile)
    property.caretakerName = cleaned(body.caretakerName) ?? property.caretakerName
    property.caretakerMobile = cleaned(body.caretakerMobile)

    const depositType = body.depositType === "custom" ? "custom" : "one_rent"
    property.depositType = depositType
    property.depositAmount = depositType === "custom" ? Number.parseFloat(String(body.depositAmount ?? 0)) : 0
    property.package = cleaned(body.package) ?? property.package

    property.isFeatured = Boolean(body.isFeatured)

    property.name = body.name.toString().trim()
    property.type = body.type
    property.city = body.city.toString().trim()
    property.state = body.state.toString().trim()
    property.area = body.area.toString().trim()
    property.pincode = body.pincode.toString().trim()
    property.contactNumber = body.contactNumber.toString().trim()
    property.alternateNumber = cleaned(body.alternateNumber) ?? ""
    property.email = cleaned(body.email) ?? ""
    property.gender = body.gender
    property.nearbyLandmark = cleaned(body.nearbyLandmark) ?? ""
    property.rules = Array.isArray(body.rules) ? body.rules : []
    property.description = cleaned(body.description) ?? ""
    property.nearbyPlaces = cleaned(body.nearbyPlaces) ?? ""

    const mainImage = cleaned(body.mainImage) ?? property.mainImage
    const commonPhotos = Array.isArray(body.commonPhotos)
      ? body.commonPhotos
          .map((u: string) => (u || "").trim())
          .filter(Boolean)
          .slice(0, 8)
      : property.commonPhotos
    property.mainImage = mainImage
    property.commonPhotos = commonPhotos
    const images = Array.from(
      new Set([mainImage, ...(Array.isArray(commonPhotos) ? commonPhotos : [])].filter(Boolean)),
    )
    property.images = images as string[]

    const mapLink = cleaned(body.mapLink)
    if (mapLink !== undefined) property.mapLink = mapLink
    property.withFood = Boolean(body.withFood)
    property.withoutFood = Boolean(body.withoutFood)

    property.status = body.status === "draft" ? "draft" : "public"

    console.log("[v0][api][PUT /vendor-properties/:id][normalized]", {
      id: params.id,
      status: property.status,
    })

    await property.save()

    console.log("[v0][api][PUT /vendor-properties/:id][saved]", {
      id: params.id,
      status: property.status,
    })

    return NextResponse.json({
      success: true,
      data: property,
      message: "Property updated successfully",
    })
  } catch (error: any) {
    console.error("Error updating property:", error)

    if (error.name === "ValidationError") {
      const validationErrors = Object.values(error.errors).map((err: any) => err.message)
      return NextResponse.json(
        { success: false, error: `Validation failed: ${validationErrors.join(", ")}` },
        { status: 400 },
      )
    }

    return NextResponse.json({ success: false, error: error.message || "Failed to update property" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    await connectDB()

    const adminId = await getAdminFromToken(request)
    if (!adminId) {
      return NextResponse.json({ success: false, error: "Admin authentication required" }, { status: 401 })
    }

    const property = await VendorProperty.findOne({
      _id: params.id,
      isActive: true,
    })

    if (!property) {
      return NextResponse.json({ success: false, error: "Property not found" }, { status: 404 })
    }

    if (property.occupiedBeds > 0) {
      return NextResponse.json({ success: false, error: "Cannot delete property with occupied beds" }, { status: 400 })
    }

    property.isActive = false
    await property.save()

    return NextResponse.json({
      success: true,
      message: "Property deleted successfully",
    })
  } catch (error: any) {
    console.error("Error deleting property:", error)
    return NextResponse.json({ success: false, error: "Failed to delete property" }, { status: 500 })
  }
}
