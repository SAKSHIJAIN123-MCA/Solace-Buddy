import type React from "react"
import type { Metadata } from "next"
import { headers } from "next/headers"
import { connectDB } from "@/lib/db"
import { SeoMeta } from "@/lib/models/SeoMeta"

async function getpropertiesMeta(): Promise<Metadata> {
  try {
    // Build absolute URL so server-side fetch to route handler works reliably
    const h = await headers()  // ✅ MUST await this
    const proto = h.get("x-forwarded-proto") ?? "http"
    const host = h.get("host")
    const base = host ? `${proto}://${host}` : ""
    const url = `${base}/api/seo-meta?pageType=properties`

    const res = await fetch(url, { cache: "no-store" })
    if (res.ok) {
      const json = await res.json()
      const data = json?.data

      if (data) {
        const keywords: string[] = Array.isArray(data.keywords)
          ? data.keywords
          : typeof data.keywords === "string"
            ? data.keywords
                .split(",")
                .map((s: string) => s.trim())
                .filter(Boolean)
            : []

        return {
          title: data.title,
          description: data.description,
          keywords,
        }
      }
    }
  } catch {
    // ignore & fallback to DB
  }

  // DB fallback
  try {
    await connectDB()
    const data = await SeoMeta.findOne({ pageType: "properties" })

    if (data) {
      const keywords: string[] = Array.isArray(data.keywords)
        ? data.keywords
        : typeof data.keywords === "string"
          ? data.keywords
              .split(",")
              .map((s: string) => s.trim())
              .filter(Boolean)
          : []

      return {
        title: data.title,
        description: data.description,
        keywords,
      }
    }
  } catch {
    // ignore and use static fallback
  }

  // Final static fallback
  return {
    title: "Properties - Solace Buddy",
    description: "Learn more Properties- Solace Buddy mission to help you achieve your goals.",
    keywords: ["Properties - Solace Buddy"],
  }
}

export async function generateMetadata(): Promise<Metadata> {
  return await getpropertiesMeta()
}

export default function propertiesLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}
