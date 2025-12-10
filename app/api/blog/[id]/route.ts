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

export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    await connectDB()
    const { id } = params
    const post: IBlogPost | null = await BlogPost.findById(id)
    if (!post) {
      return NextResponse.json({ success: false, error: "Blog post not found" }, { status: 404 })
    }
    return NextResponse.json({ success: true, data: post })
  } catch (error) {
    console.error("Error fetching blog post by ID:", error)
    return NextResponse.json({ success: false, error: "Failed to fetch blog post" }, { status: 500 })
  }
}

export async function PUT(request: Request, { params }: { params: { id: string } }) {
  try {
    await connectDB()
    const { id } = params
    const body = await request.json()
    const { title, content, tags, metaDescription, status, image } = body

    const updatedFields: Partial<IBlogPost> = {
      title,
      content,
      status,
      tags: tags
        ? tags
            .split(",")
            .map((tag: string) => tag.trim())
            .filter(Boolean)
        : [],
      metaDescription,
      image: image || "",
      slug: title ? generateSlug(title) : undefined,
    }

    const updatedPost: IBlogPost | null = await BlogPost.findByIdAndUpdate(id, updatedFields, {
      new: true,
      runValidators: true,
    })
    if (!updatedPost) {
      return NextResponse.json({ success: false, error: "Blog post not found" }, { status: 404 })
    }
    return NextResponse.json({ success: true, data: updatedPost })
  } catch (error) {
    console.error("Error updating blog post:", error)
    return NextResponse.json({ success: false, error: "Failed to update blog post" }, { status: 500 })
  }
}

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  try {
    await connectDB()
    const { id } = params
    const deletedPost: IBlogPost | null = await BlogPost.findByIdAndDelete(id)
    if (!deletedPost) {
      return NextResponse.json({ success: false, error: "Blog post not found" }, { status: 404 })
    }
    return NextResponse.json({ success: true, message: "Blog post deleted successfully" }, { status: 200 })
  } catch (error) {
    console.error("Error deleting blog post:", error)
    return NextResponse.json({ success: false, error: "Failed to delete blog post" }, { status: 500 })
  }
}
