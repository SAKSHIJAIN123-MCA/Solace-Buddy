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
    // Convert NextRequest to Node.js request-like object
    const formData = await req.formData()
    const file = formData.get("file") as File

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 })
    }

    // Convert File to Buffer
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)

    // Generate filename
    const filename = Date.now() + path.extname(file.name)
    const filepath = path.join(uploadsDir, filename)

    // Save file
    fs.writeFileSync(filepath, buffer)

    // Return URL
    const url = `/uploads/${filename}`

    return NextResponse.json({ url }, { status: 200 })
  } catch (error) {
    console.error("Error uploading file:", error)
    return NextResponse.json({ error: "Failed to upload file" }, { status: 500 })
  }
}
