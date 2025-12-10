import { NextResponse } from "next/server"
import { connectDB } from "@/lib/db"
import { Country, type ICountry } from "@/lib/models/location"

export async function GET() {
  try {
    await connectDB()
    const countries: ICountry[] = await Country.find({})
    return NextResponse.json({ success: true, data: countries })
  } catch (error) {
    console.error("Error fetching countries:", error)
    return NextResponse.json({ success: false, error: "Failed to fetch countries" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    await connectDB()
    const body = await request.json()
    const { name, code } = body

    if (!name || !code) {
      return NextResponse.json({ success: false, error: "Missing required fields: name, code" }, { status: 400 })
    }

    const newCountry: ICountry = await Country.create({ name, code })
    return NextResponse.json({ success: true, data: newCountry }, { status: 201 })
  } catch (error: any) {
    console.error("Error creating country:", error)
    if (error.code === 11000) {
      // Duplicate key error
      return NextResponse.json(
        { success: false, error: "Country with this name or code already exists." },
        { status: 409 },
      )
    }
    return NextResponse.json({ success: false, error: "Failed to create country" }, { status: 500 })
  }
}
