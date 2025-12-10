"use client"

import type React from "react"
import { useState } from "react"
import useSWR from "swr"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { useToast } from "@/hooks/use-toast"

interface SeoMeta {
  _id?: string
  pageType: string
  title: string
  description: string
  keywords: string[]
}

const fetcher = (url: string) => fetch(url).then((r) => r.json())

export default function SeoMetaManager() {
  const { toast } = useToast()

  const pageTypes = [
    { label: "About Us", value: "about-us" },
    { label: "Contact", value: "contact" },
    { label: "FAQ", value: "faq" },
    { label: "Privacy Policy", value: "privacypolicy" },
    { label: "Terms & Conditions", value: "Terms" },
    { label: "Refer Earn", value: "referearn" },
    { label: "Wishlist", value: "wishlist" },
    { label: "How to Book", value: "how-to-book" },
    { label: "Feedback", value: "feedback" },
    { label: "Compare", value: "compare" },
    { label: "Properties", value: "properties" },
     { label: "SignUp", value: "signup" },
      { label: "SignIn", value: "signin" },
  ]

  const { data, isLoading, mutate } = useSWR<{ success: boolean; data: SeoMeta[] }>("/api/admin/seo", fetcher)

  const normalizeKeywords = (k: any): string[] =>
    Array.isArray(k)
      ? k
      : typeof k === "string"
        ? k
            .split(",")
            .map((x) => x.trim())
            .filter(Boolean)
        : []

  const allMeta = (data?.success ? data.data : []).map((m: any) => ({
    ...m,
    keywords: normalizeKeywords(m.keywords),
  }))

  const [meta, setMeta] = useState<SeoMeta>({
    pageType: "",
    title: "",
    description: "",
    keywords: [],
  })
  const [keywordInput, setKeywordInput] = useState("")

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setMeta({ ...meta, [e.target.name]: e.target.value })
  }

  const handlePageTypeChange = (value: string) => {
    const existing = allMeta?.find((m) => m.pageType === value)
    if (existing) {
      setMeta({ ...existing, keywords: normalizeKeywords(existing.keywords) })
    } else {
      setMeta({
        pageType: value,
        title: "",
        description: "",
        keywords: [],
      })
    }
  }

  const addKeyword = (raw?: string) => {
    const candidate = (raw ?? keywordInput).trim()
    if (!candidate) return
    if (meta.keywords.includes(candidate)) {
      setKeywordInput("")
      return
    }
    setMeta((prev) => ({ ...prev, keywords: [...prev.keywords, candidate] }))
    setKeywordInput("")
  }

  const removeKeyword = (kw: string) => {
    setMeta((prev) => ({ ...prev, keywords: prev.keywords.filter((k) => k !== kw) }))
  }

  const handleKeywordKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault()
      addKeyword()
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!meta.pageType) {
      toast({ title: "Error", description: "Please select a page type." })
      return
    }
    if (!meta.title || !meta.description || meta.keywords.length === 0) {
      toast({ title: "Error", description: "All fields are required, including at least one keyword." })
      return
    }

    try {
      const existingMeta = allMeta?.find((m) => m.pageType === meta.pageType)
      const method = existingMeta ? "PUT" : "POST"
      const url = existingMeta ? `/api/admin/seo/${existingMeta._id}` : "/api/admin/seo"

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          pageType: meta.pageType,
          title: meta.title,
          description: meta.description,
          keywords: meta.keywords,
        }),
      })
      const result = await res.json()

      if (result?.success) {
        toast({ title: "Success", description: "SEO Meta saved!" })
        await mutate()
        setMeta({ pageType: "", title: "", description: "", keywords: [] })
        setKeywordInput("")
      } else {
        toast({ title: "Error", description: result?.error || "Failed to save SEO meta." })
      }
    } catch (err) {
      console.error("[v0] SEO save error:", err)
      toast({ title: "Error", description: "Something went wrong!" })
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this SEO entry?")) return
    try {
      const res = await fetch(`/api/admin/seo/${id}`, { method: "DELETE" })
      const result = await res.json()
      if (result?.success) {
        toast({ title: "Deleted", description: "SEO Meta deleted!" })
        await mutate()
        if (meta._id === id) {
          setMeta({ pageType: "", title: "", description: "", keywords: [] })
        }
      } else {
        toast({ title: "Error", description: result?.error || "Failed to delete SEO meta." })
      }
    } catch (err) {
      console.error("[v0] SEO delete error:", err)
      toast({ title: "Error", description: "Failed to delete SEO meta." })
    }
  }

  const handleEditLoad = (entry: SeoMeta) => {
    setMeta({ ...entry, keywords: normalizeKeywords((entry as any).keywords) })
    window?.scrollTo({ top: 0, behavior: "smooth" })
  }

  const handleReset = () => {
    setMeta({ pageType: "", title: "", description: "", keywords: [] })
    setKeywordInput("")
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-pretty">Edit SEO Meta</CardTitle>
        </CardHeader>
        <CardContent>
          <form className="space-y-5" onSubmit={handleSubmit}>
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label className="block font-medium mb-1">Page Type*</label>
                <Select onValueChange={handlePageTypeChange} value={meta.pageType}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select page type" />
                  </SelectTrigger>
                  <SelectContent>
                    {pageTypes.map((page) => (
                      <SelectItem key={page.value} value={page.value}>
                        {page.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="block font-medium mb-1">Title*</label>
                <Input name="title" value={meta.title} onChange={handleChange} placeholder="Page Title" />
              </div>

              <div className="md:col-span-2">
                <label className="block font-medium mb-1">Description*</label>
                <Textarea
                  name="description"
                  value={meta.description}
                  onChange={handleChange}
                  placeholder="Meta Description"
                  rows={3}
                />
              </div>

              <div className="md:col-span-2">
                <label className="block font-medium mb-1">Keywords*</label>
                <div className="flex items-center gap-2">
                  <Input
                    value={keywordInput}
                    onChange={(e) => setKeywordInput(e.target.value)}
                    onKeyDown={handleKeywordKeyDown}
                    placeholder="Type a keyword and press Enter"
                    aria-label="Add keyword"
                  />
                  <Button type="button" variant="outline" onClick={() => addKeyword()}>
                    Add
                  </Button>
                </div>
                {meta.keywords.length > 0 && (
                  <div className="mt-3 flex flex-wrap gap-2">
                    {meta.keywords.map((kw) => (
                      <span
                        key={kw}
                        className="inline-flex items-center rounded-md border px-2 py-1 text-sm bg-background"
                      >
                        <span className="mr-2">{kw}</span>
                        <button
                          type="button"
                          className="text-muted-foreground hover:text-foreground"
                          aria-label={`Remove keyword ${kw}`}
                          onClick={() => removeKeyword(kw)}
                        >
                          ×
                        </button>
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Button type="submit" className="min-w-32">
                Save
              </Button>
              <Button type="button" variant="secondary" onClick={handleReset} className="min-w-24">
                Reset
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-pretty">All SEO Entries</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <p className="text-muted-foreground">Loading entries…</p>
          ) : allMeta?.length === 0 ? (
            <p className="text-muted-foreground">No SEO entries found.</p>
          ) : (
            <div className="rounded-md border overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Page</TableHead>
                    <TableHead>Title</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead>Keywords</TableHead>
                    <TableHead className="w-[160px]">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {allMeta.map((m) => (
                    <TableRow key={m._id}>
                      <TableCell className="font-medium">{m.pageType}</TableCell>
                      <TableCell>{m.title}</TableCell>
                      <TableCell className="max-w-[420px] truncate">{m.description}</TableCell>
                      <TableCell className="max-w-[320px] truncate">
                        {Array.isArray(m.keywords) ? m.keywords.join(", ") : String(m.keywords)}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Button size="sm" variant="outline" onClick={() => handleEditLoad(m)}>
                            Edit
                          </Button>
                          <Button size="sm" variant="destructive" onClick={() => handleDelete(m._id!)}>
                            Delete
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
