"use client"

import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import Image from "next/image"
import Link from "next/link"
import { formatDistanceToNow } from "date-fns"
import { ArrowLeft } from "lucide-react"

interface BlogPost {
  _id: string
  title: string
  slug: string
  image: string
  date: string
  content: string
  author: string
  tags: string[]
  metaDescription: string
}

export default function BlogDetailPage() {
  const params = useParams()
  const slug = params.slug as string
  const [post, setPost] = useState<BlogPost | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchPost = async () => {
      try {
        const response = await fetch("/api/blog")
        const data = await response.json()

        if (data.success && data.data) {
          const foundPost = data.data.find((p: BlogPost) => p.slug === slug)
          if (foundPost) {
            setPost(foundPost)
          } else {
            setError("Blog post not found")
          }
        } else {
          setError("Failed to fetch blog posts")
        }
      } catch (err) {
        console.error("Error fetching blog post:", err)
        setError("Failed to load blog post")
      } finally {
        setLoading(false)
      }
    }

    if (slug) {
      fetchPost()
    }
  }, [slug])

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-sm text-muted-foreground">Loading...</div>
      </div>
    )
  }

  if (error || !post) {
    return (
      <div className="min-h-screen bg-background">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
          <Link
            href="/blog"
            className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-8 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Blog
          </Link>
          <div className="text-center py-12">
            <p className="text-sm text-muted-foreground">{error || "Blog post not found"}</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <main className="min-h-screen bg-background">
      {/* Back Button */}
      <div className="border-b border-border">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <Link
            href="/blog"
            className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Blog
          </Link>
        </div>
      </div>

      {/* Article Content */}
      <article className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl sm:text-4xl font-bold text-foreground mb-4">{post.title}</h1>

          {/* Meta Information */}
          <div className="flex flex-col sm:flex-row sm:items-center gap-4 text-sm text-muted-foreground mb-6">
            <div className="flex items-center gap-2">
              <span className="font-medium">{post.author}</span>
            </div>
            <div className="hidden sm:block">•</div>
            <time dateTime={post.date}>{formatDistanceToNow(new Date(post.date), { addSuffix: true })}</time>
          </div>

          {/* Tags */}
          {post.tags && post.tags.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {post.tags.map((tag) => (
                <span
                  key={tag}
                  className="inline-block px-3 py-1 bg-muted text-xs font-medium text-foreground rounded-full"
                >
                  {tag}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Featured Image */}
        {post.image && (
          <div className="relative w-full aspect-video bg-muted overflow-hidden rounded-lg mb-8">
            <Image src={post.image || "/placeholder.svg"} alt={post.title} fill className="object-cover" priority />
          </div>
        )}

        {/* Article Body */}
        <div className="prose prose-sm max-w-none text-foreground">
          <div className="whitespace-pre-wrap leading-relaxed text-base">{post.content}</div>
        </div>
      </article>
    </main>
  )
}
