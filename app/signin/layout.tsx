import type React from "react"
import type { Metadata } from "next"
import { headers } from "next/headers"
import { connectDB } from "@/lib/db"
import { SeoMeta } from "@/lib/models/SeoMeta"

async function getsigninMeta(): Promise<Metadata> {
  try {
    // Build absolute URL so server-side fetch to route handler works reliably
    const h = headers()
    const proto = h.get("x-forwarded-proto") ?? "http"
    const host = h.get("host")
    const base = host ? `${proto}://${host}` : ""
    const url = `${base}/api/seo-meta?pageType=signin`

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
    // fall through to DB fallback
  }

  // DB fallback: ensure we are connected and fetch directly if API fetch failed
  try {
    await connectDB()
    const data = await SeoMeta.findOne({ pageType: "signin" })
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
    // swallow and use static fallback
  }

  // Fallback to your current static SEO if API/DB not available
  return {
    title: "signin - Solace Buddy",
    description: "Learn more signin - Solace Buddy mission to help you achieve your goals.",
    keywords: ["signin - Solace Buddy"],
  }
}

export async function generateMetadata(): Promise<Metadata> {
  return await getsigninMeta()
}

export default function signinLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
