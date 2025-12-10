import { type NextRequest, NextResponse } from "next/server"
import { connectDB } from "@/lib/db"
import VendorProperty from "@/lib/models/vendorproper"
import jwt from "jsonwebtoken"
import mongoose from "mongoose"

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key"
const DISABLE_VENDOR_AUTH = process.env.DISABLE_VENDOR_AUTH === "true"

async function getVendorFromToken(request: NextRequest) {
  try {
    if (DISABLE_VENDOR_AUTH) {
      return "dev-vendor"
    }
    const token = request.cookies.get("vendor-token")?.value
    if (!token) return null
    const decoded = jwt.verify(token, JWT_SECRET) as any
    return decoded.vendorId
  } catch (error) {
    return null
  }
}

export async function GET(request: NextRequest) {
  try {
    await connectDB()

    const vendorId = await getVendorFromToken(request)
    if (!vendorId) {
      return NextResponse.json({ success: false, error: "Vendor authentication required" }, { status: 401 })
    }

    const vendorObjectId = mongoose.Types.ObjectId.isValid(vendorId) ? new mongoose.Types.ObjectId(vendorId) : vendorId

    const properties = await VendorProperty.find({
      vendorId: vendorObjectId,
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

    const vendorId = await getVendorFromToken(request)
    if (!vendorId) {
      return NextResponse.json({ success: false, error: "Vendor authentication required" }, { status: 401 })
    }

    const body = await request.json()

    console.log("[v0][api][POST /vendor-properties][body]", body)

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
      ? body.amenities.filter((id: any) => typeof id === "string" && mongoose.Types.ObjectId.isValid(id))
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

    const count = await VendorProperty.countDocuments()
    const propertyId = `PG-${(count + 1741).toString()}`

    const vendorObjectId = mongoose.Types.ObjectId.isValid(vendorId) ? new mongoose.Types.ObjectId(vendorId) : vendorId

    const propertyData = {
      ...body,
      vendorId: vendorObjectId,
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
      totalRooms: 0,
      totalBeds: 0,
      occupiedBeds: 0,
      availableBeds: 0,
      bedsOnNotice: 0,
      bedsOnBook: 0,
      monthlyRevenue: 0,
      rooms: [],
    }

    console.log("[v0][api][POST /vendor-properties][normalized]", {
      vendorId: propertyData.vendorId,
      pgNickName: propertyData.pgNickName,
      ownerName: propertyData.ownerName,
      ownerMobile: propertyData.ownerMobile,
      caretakerName: propertyData.caretakerName,
      caretakerMobile: propertyData.caretakerMobile,
      depositType: propertyData.depositType,
      depositAmount: propertyData.depositAmount,
      package: propertyData.package,
      mainImage: propertyData.mainImage,
      commonPhotos: propertyData.commonPhotos,
      isFeatured: propertyData.isFeatured,
      area: propertyData.area,
      withFood: propertyData.withFood,
      withoutFood: propertyData.withoutFood,
    })

    const property = new VendorProperty(propertyData)
    await property.save()

    console.log("[v0][api][POST /vendor-properties][saved]", {
      _id: property._id,
      vendorId: property.vendorId,
      pgNickName: property.pgNickName,
      ownerName: property.ownerName,
      ownerMobile: property.ownerMobile,
      caretakerName: property.caretakerName,
      caretakerMobile: property.caretakerMobile,
      depositType: property.depositType,
      depositAmount: property.depositAmount,
      package: property.package,
      mainImage: property.mainImage,
      commonPhotos: property.commonPhotos,
      isFeatured: property.isFeatured,
      area: property.area,
      withFood: property.withFood,
      withoutFood: property.withoutFood,
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
