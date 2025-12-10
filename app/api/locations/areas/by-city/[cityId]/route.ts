import { NextResponse } from "next/server"
import { connectDB } from "@/lib/db"
import { Area, type IArea } from "@/lib/models/location"

export async function GET(request: Request, { params }: { params: { cityId: string } }) {
  try {
    await connectDB()
    const { cityId } = params

    const areas: IArea[] = await Area.find({ city: cityId }).populate({
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
    console.error("Error fetching areas by city:", error)
    return NextResponse.json({ success: false, error: "Failed to fetch areas" }, { status: 500 })
  }
}
