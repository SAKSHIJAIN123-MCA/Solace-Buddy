import { NextResponse } from "next/server"
import { connectDB } from "@/lib/db"
import { Area, type IArea } from "@/lib/models/location"

export async function GET() {
  try {
    await connectDB()
    const areas: IArea[] = await Area.find({}).populate({
      path: "city",
      populate: {
        path: "state",
        populate: {
          path: "country",
        },
      },
    })
    return NextResponse.json({ success: true, data: areas })
  } catch (error) {
    console.error("Error fetching areas:", error)
    return NextResponse.json({ success: false, error: "Failed to fetch areas" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    await connectDB()
    const body = await request.json()
    const { name, cityId } = body

    if (!name || !cityId) {
      return NextResponse.json({ success: false, error: "Missing required fields: name, cityId" }, { status: 400 })
    }

    const newArea: IArea = await Area.create({ name, city: cityId })
    await newArea.populate({
      path: "city",
      populate: {
        path: "state",
        populate: {
          path: "country",
        },
      },
    })
    return NextResponse.json({ success: true, data: newArea }, { status: 201 })
  } catch (error: any) {
    console.error("Error creating area:", error)
    if (error.code === 11000) {
      return NextResponse.json(
        { success: false, error: "Area with this name already exists in this city." },
        { status: 409 },
      )
    }
    return NextResponse.json({ success: false, error: "Failed to create area" }, { status: 500 })
  }
}
