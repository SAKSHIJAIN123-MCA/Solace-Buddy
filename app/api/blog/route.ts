import { NextResponse } from "next/server"
import { connectDB } from "@/lib/db"
import BlogPost from "@/lib/models/blog"
import type { IBlogPost } from "@/lib/models/blog"

function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
}

export async function GET() {
  try {
    await connectDB()
    const posts: IBlogPost[] = await BlogPost.find({}).sort({ date: -1 })
    return NextResponse.json({ success: true, data: posts })
  } catch (error) {
    console.error("Error fetching blog posts:", error)
    return NextResponse.json({ success: false, error: "Failed to fetch blog posts" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    await connectDB()
    const body = await request.json()
    const { title, content, tags, metaDescription, status, image } = body

    if (!title?.trim() || !content?.trim() || !status) {
      return NextResponse.json(
        { success: false, error: "Missing required fields: title, content, and status must not be empty" },
        { status: 400 },
      )
    }

    const slug = generateSlug(title)

    const newPostData: Partial<IBlogPost> = {
      title: title.trim(),
      content: content.trim(),
      status,
      tags: tags
        ? tags
            .split(",")
            .map((tag: string) => tag.trim())
            .filter(Boolean)
        : [],
      metaDescription: metaDescription?.trim() || "",
      author: "Admin",
      views: 0,
      date: new Date(),
      image: image || "",
      slug,
    }

    const newPost: IBlogPost = await BlogPost.create(newPostData)
    return NextResponse.json({ success: true, data: newPost }, { status: 201 })
  } catch (error) {
    console.error("Error creating blog post:", error)
    return NextResponse.json(
      {
        success: false,
        error: `Failed to create blog post: ${error instanceof Error ? error.message : "Unknown error"}`,
      },
      { status: 500 },
    )
  }
}
