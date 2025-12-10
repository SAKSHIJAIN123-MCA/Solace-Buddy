import { type NextRequest, NextResponse } from "next/server"
import fs from "fs"
import path from "path"

// Ensure uploads directory exists
const uploadsDir = path.join(process.cwd(), "public", "uploads")
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true })
}

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData()
    const file = formData.get("file") as File

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 })
    }

    // Validate file type (images only)
    if (!file.type.startsWith("image/")) {
      return NextResponse.json({ error: "Only image files are allowed" }, { status: 400 })
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.json({ error: "File size must be less than 5MB" }, { status: 400 })
    }

    // Convert File to Buffer
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)

    // Generate filename with timestamp to avoid collisions
    const filename = Date.now() + "-" + Math.random().toString(36).substring(7) + path.extname(file.name)
    const filepath = path.join(uploadsDir, filename)

    // Save file
    fs.writeFileSync(filepath, buffer)

    // Return URL
    const url = `/uploads/${filename}`

    return NextResponse.json({ url, filename }, { status: 200 })
  } catch (error) {
    console.error("Error uploading file:", error)
    return NextResponse.json({ error: "Failed to upload file" }, { status: 500 })
  }
}
