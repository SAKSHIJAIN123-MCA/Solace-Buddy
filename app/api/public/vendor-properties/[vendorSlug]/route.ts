import { NextResponse } from "next/server"
import { connectDB } from "@/lib/db"
import VendorProperty from "@/lib/models/vendorproper"

export async function GET(
  _req: Request,
  { params }: { params: { vendorSlug: string } }
) {
  try {
    await connectDB()

    const properties = await (VendorProperty as any).find({
      vendorSlug: params.vendorSlug,
      isActive: true,
    }).lean()

    if (!properties || properties.length === 0) {
      return NextResponse.json(
        { success: false, message: "No properties found" },
        { status: 404 }
      )
    }

    return NextResponse.json({ success: true, data: properties })
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error?.message || "Internal error" },
      { status: 500 }
    )
  }
}
