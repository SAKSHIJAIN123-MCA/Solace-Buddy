"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { formatDistanceToNow } from "date-fns"

interface BlogPost {
  _id: string
  title: string
  slug: string
  image: string
  date: string
  content: string
}

export default function BlogPage() {
  const [posts, setPosts] = useState<BlogPost[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const response = await fetch("/api/blog")
        const data = await response.json()
        setPosts(data.data || [])
      } catch (error) {
        console.error("Failed to fetch posts:", error)
        setPosts([])
      } finally {
        setLoading(false)
      }
    }

    fetchPosts()
  }, [])

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-sm text-muted-foreground">Loading...</div>
      </div>
    )
  }

  return (
    <main className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
          <h1 className="text-3xl sm:text-4xl font-bold text-foreground mb-2">Blog</h1>
          <p className="text-sm text-muted-foreground">Insights and stories from our team</p>
        </div>
      </div>

      {/* Blog Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        {posts.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-sm text-muted-foreground">No blog posts yet</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {posts.map((post) => (
              <Link
                key={post._id}
                href={`/blog/${post.slug}`}
                className="group flex flex-col h-full hover:opacity-75 transition-opacity"
              >
                {/* Image */}
                <div className="relative w-full aspect-video bg-muted overflow-hidden rounded-lg mb-3">
                  {post.image ? (
                    <Image
                      src={post.image || "/placeholder.svg"}
                      alt={post.title}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  ) : (
                    <div className="w-full h-full bg-muted flex items-center justify-center">
                      <span className="text-xs text-muted-foreground">No image</span>
                    </div>
                  )}
                </div>

                {/* Content */}
                <div className="flex-1 flex flex-col">
                  <h2 className="text-sm font-semibold text-foreground line-clamp-2 mb-1 group-hover:underline">
                    {post.title}
                  </h2>
                  <p className="text-xs text-muted-foreground line-clamp-2 mb-3 flex-1">
                    {post.content.substring(0, 100)}...
                  </p>
                  <div className="text-xs text-muted-foreground">
                    {formatDistanceToNow(new Date(post.date), { addSuffix: true })}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </main>
  )
}
