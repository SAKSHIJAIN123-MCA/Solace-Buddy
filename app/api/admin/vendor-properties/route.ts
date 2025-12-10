import { type NextRequest, NextResponse } from "next/server"
import { connectDB } from "@/lib/db"
import VendorProperty from "@/lib/models/vendorproper"
import jwt from "jsonwebtoken"
import mongoose from "mongoose"

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key"
const DISABLE_ADMIN_AUTH = process.env.DISABLE_ADMIN_AUTH === "true"

const ADMIN_VENDOR_ID = new mongoose.Types.ObjectId("507f1f77bcf86cd799439011")

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

export async function GET(request: NextRequest) {
  try {
    await connectDB()

    const adminId = await getAdminFromToken(request)
    if (!adminId) {
      return NextResponse.json({ success: false, error: "Admin authentication required" }, { status: 401 })
    }

    const properties = await VendorProperty.find({
      isActive: true,
    })
      .sort({ createdAt: -1 })
      .populate("amenities", "name icon status")

    return NextResponse.json({
      success: true,
      data: properties,
    })
  } catch (error: any) {
    console.error("Error fetching properties:", error)
    return NextResponse.json({ success: false, error: "Failed to fetch properties" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    await connectDB()

    const adminId = await getAdminFromToken(request)
    if (!adminId) {
      return NextResponse.json({ success: false, error: "Admin authentication required" }, { status: 401 })
    }

    const body = await request.json()

    console.log("[v0][api][POST /admin/vendor-properties][body]", body)

    const cleaned = (v: unknown) => (typeof v === "string" && v.trim() ? v.trim() : undefined)

    const pgNickName = cleaned(body.pgNickName)
    const ownerName = cleaned(body.ownerName)
    const ownerMobile = cleaned(body.ownerMobile)
    const caretakerName = cleaned(body.caretakerName)
    const caretakerMobile = cleaned(body.caretakerMobile)

    const depositType = body.depositType === "custom" ? "custom" : "one_rent"
    const depositAmount = depositType === "custom" ? Number.parseFloat(String(body.depositAmount ?? 0)) : 0

    const packageType = cleaned(body.package) || "standard"

    const amenities = Array.isArray(body.amenities)
      ? body.amenities
          .map((id: any) => {
            if (typeof id === "string" && id && id.trim() && mongoose.Types.ObjectId.isValid(id)) return id
            if (typeof id === "object" && id._id) return id._id
            return null
          })
          .filter(Boolean)
      : []

    const rules = Array.isArray(body.rules) ? body.rules : body.rules?.split?.("\n")?.filter(Boolean) || []

    const mainImage = cleaned(body.mainImage)
    const commonPhotos = Array.isArray(body.commonPhotos)
      ? body.commonPhotos
          .map((u: string) => (u || "").trim())
          .filter(Boolean)
          .slice(0, 8)
      : []
    const images = Array.from(new Set([mainImage, ...commonPhotos].filter(Boolean))) as string[]

    const area = cleaned(body.area)
    const mapLink = cleaned(body.mapLink)
    const withFood = Boolean(body.withFood)
    const withoutFood = Boolean(body.withoutFood)

    const status = body.status === "draft" ? "draft" : "public"

    const count = await VendorProperty.countDocuments()
    const propertyId = `PG-${(count + 1741).toString()}`

    const vendorId =
      body.vendor && mongoose.Types.ObjectId.isValid(body.vendor)
        ? new mongoose.Types.ObjectId(body.vendor)
        : ADMIN_VENDOR_ID

    const propertyData = {
      ...body,
      vendorId,
      propertyId,
      amenities,
      rules,
      images,
      mainImage,
      commonPhotos,
      depositType,
      depositAmount,
      package: packageType,
      ...(pgNickName ? { pgNickName } : {}),
      ...(ownerName ? { ownerName } : {}),
      ...(ownerMobile ? { ownerMobile } : {}),
      ...(caretakerName ? { caretakerName } : {}),
      ...(caretakerMobile ? { caretakerMobile } : {}),
      isFeatured: Boolean(body.isFeatured),
      ...(area ? { area } : {}),
      ...(mapLink ? { mapLink } : {}),
      withFood,
      withoutFood,
      status,
      totalRooms: 0,
      totalBeds: 0,
      occupiedBeds: 0,
      availableBeds: 0,
      bedsOnNotice: 0,
      bedsOnBook: 0,
      monthlyRevenue: 0,
      rooms: [],
    }

    console.log("[v0][api][POST /admin/vendor-properties][normalized]", {
      vendorId: propertyData.vendorId,
      pgNickName: propertyData.pgNickName,
      ownerName: propertyData.ownerName,
      status: propertyData.status,
      amenitiesCount: propertyData.amenities.length,
    })

    const property = new VendorProperty(propertyData)
    await property.save()

    console.log("[v0][api][POST /admin/vendor-properties][saved]", {
      _id: property._id,
      status: property.status,
      amenitiesCount: property.amenities.length,
    })

    return NextResponse.json({
      success: true,
      data: property,
      message: "Property created successfully",
    })
  } catch (error: any) {
    console.error("Error creating property:", error)
    return NextResponse.json({ success: false, error: error.message || "Failed to create property" }, { status: 500 })
  }
}
