import { type NextRequest, NextResponse } from "next/server"
import { connectDB } from "@/lib/db"
import Vendor from "@/lib/models/vendor"
import mongoose from "mongoose"

// GET - Fetch single vendor
export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    await connectDB()

    if (!mongoose.Types.ObjectId.isValid(params.id)) {
      return NextResponse.json({ success: false, error: "Invalid vendor ID" }, { status: 400 })
    }

    const vendor = await Vendor.findById(params.id)

    if (!vendor) {
      return NextResponse.json({ success: false, error: "Vendor not found" }, { status: 404 })
    }

    return NextResponse.json({
      success: true,
      data: vendor,
    })
  } catch (error: any) {
    console.error("Error fetching vendor:", error)
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}

// PUT - Update vendor
export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    await connectDB()

    if (!mongoose.Types.ObjectId.isValid(params.id)) {
      return NextResponse.json({ success: false, error: "Invalid vendor ID" }, { status: 400 })
    }

    const body = await request.json()

    // Check if email already exists for other vendors
    if (body.email) {
      const existingVendor = await Vendor.findOne({
        email: body.email,
        _id: { $ne: params.id },
      })
      if (existingVendor) {
        return NextResponse.json({ success: false, error: "Vendor with this email already exists" }, { status: 400 })
      }
    }

    const vendor = await Vendor.findByIdAndUpdate(
      params.id,
      { ...body, updatedAt: new Date() },
      { new: true, runValidators: true },
    )

    if (!vendor) {
      return NextResponse.json({ success: false, error: "Vendor not found" }, { status: 404 })
    }

    return NextResponse.json({
      success: true,
      data: vendor,
      message: "Vendor updated successfully",
    })
  } catch (error: any) {
    console.error("Error updating vendor:", error)

    if (error.name === "ValidationError") {
      const errors = Object.values(error.errors).map((err: any) => err.message)
      return NextResponse.json({ success: false, error: errors.join(", ") }, { status: 400 })
    }

    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}

// DELETE - Delete vendor
export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    await connectDB()

    if (!mongoose.Types.ObjectId.isValid(params.id)) {
      return NextResponse.json({ success: false, error: "Invalid vendor ID" }, { status: 400 })
    }

    const vendor = await Vendor.findByIdAndDelete(params.id)

    if (!vendor) {
      return NextResponse.json({ success: false, error: "Vendor not found" }, { status: 404 })
    }

    return NextResponse.json({
      success: true,
      message: "Vendor deleted successfully",
    })
  } catch (error: any) {
    console.error("Error deleting vendor:", error)
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}
