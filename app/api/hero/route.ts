import { NextResponse } from "next/server"
import { connectDB } from "@/lib/db"
import HeroSlide from "@/lib/models/hero"

// GET all active hero slides for frontend
export async function GET() {
  try {
    await connectDB()
    const slides = await HeroSlide.find({ isActive: true }).sort({ order: 1, createdAt: -1 }).limit(10)
    return NextResponse.json({ slides }, { status: 200 })
  } catch (error) {
    console.error("GET hero slides error:", error)
    return NextResponse.json({ error: "Failed to fetch hero slides" }, { status: 500 })
  }
}
