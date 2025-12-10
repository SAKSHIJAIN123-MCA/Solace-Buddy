"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"

type Features = {
  freeListingOnWebsite: boolean
  freeSocialMediaPromotion: boolean
  top5SearchResult: boolean
  bannerOnHomePageRecommendedBadge: boolean
  pricePerTenantPlacement: boolean
}

type PackageData = {
  _id?: string
  name: string
  active?: boolean
  features?: Partial<Features>
  advanceRule?: { percent?: number; minRupees?: number }
}

export function PackageFormDialog({
  trigger,
  initialData,
  onCompleted,
}: {
  trigger: React.ReactNode
  initialData?: PackageData
  onCompleted?: () => void
}) {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState<PackageData>(() => ({
    name: initialData?.name ?? "",
    active: initialData?.active ?? true,
    features: {
      freeListingOnWebsite: !!initialData?.features?.freeListingOnWebsite,
      freeSocialMediaPromotion: !!initialData?.features?.freeSocialMediaPromotion,
      top5SearchResult: !!initialData?.features?.top5SearchResult,
      bannerOnHomePageRecommendedBadge: !!initialData?.features?.bannerOnHomePageRecommendedBadge,
      pricePerTenantPlacement: !!initialData?.features?.pricePerTenantPlacement,
    },
    advanceRule: {
      percent: initialData?.advanceRule?.percent ?? 30,
      minRupees: initialData?.advanceRule?.minRupees ?? 3000,
    },
  }))

  function updateFeature(key: keyof Features, value: boolean) {
    setForm((p) => ({ ...p, features: { ...(p.features || {}), [key]: value } }))
  }

  async function onSubmit() {
    if (!form.name?.trim()) return
    setLoading(true)
    const payload = {
      name: form.name,
      active: form.active !== false,
      features: form.features,
      advanceRule: {
        percent: Number(form.advanceRule?.percent ?? 0),
        minRupees: Number(form.advanceRule?.minRupees ?? 0),
      },
    }
    const url = form._id ? `/api/admin/packages/${form._id}` : "/api/admin/packages"
    const method = form._id ? "PUT" : "POST"
    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    })
    setLoading(false)
    if (res.ok) {
      onCompleted?.()
      setOpen(false)
    } else {
      // naive alert; in your app use toast
      const j = await res.json().catch(() => null)
      alert(j?.message || "Failed to save package")
    }
  }

  const Trigger = <DialogTrigger asChild>{trigger}</DialogTrigger>

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      {Trigger}
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>{initialData ? "Edit Package" : "Add Package"}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="pkg-name">Package name</Label>
            <Input
              id="pkg-name"
              value={form.name}
              onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
              placeholder="e.g., silver-25, gold-50, diamond-100"
            />
            <p className="text-xs text-muted-foreground">
              Name will be saved in lowercase. It can contain letters, numbers, spaces, and hyphens.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="percent">Percent (%)</Label>
              <Input
                id="percent"
                type="number"
                min={0}
                max={1000}
                value={form.advanceRule?.percent ?? 0}
                onChange={(e) =>
                  setForm((p) => ({ ...p, advanceRule: { ...(p.advanceRule || {}), percent: Number(e.target.value) } }))
                }
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="minRupees">Rupees</Label>
              <Input
                id="minRupees"
                type="number"
                min={0}
                value={form.advanceRule?.minRupees ?? 0}
                onChange={(e) =>
                  setForm((p) => ({
                    ...p,
                    advanceRule: { ...(p.advanceRule || {}), minRupees: Number(e.target.value) },
                  }))
                }
              />
            </div>
          </div>
          <p className="text-xs text-muted-foreground">Booking amount is max(rent × percent/100, min rupees).</p>

          <div className="space-y-2">
            <Label>Features</Label>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <label className="flex items-center gap-2">
                <Checkbox
                  checked={!!form.features?.freeListingOnWebsite}
                  onCheckedChange={(v) => updateFeature("freeListingOnWebsite", !!v)}
                />
                Free listing on website
              </label>
              <label className="flex items-center gap-2">
                <Checkbox
                  checked={!!form.features?.freeSocialMediaPromotion}
                  onCheckedChange={(v) => updateFeature("freeSocialMediaPromotion", !!v)}
                />
                Verified badge
              </label>
              <label className="flex items-center gap-2">
                <Checkbox
                  checked={!!form.features?.top5SearchResult}
                  onCheckedChange={(v) => updateFeature("top5SearchResult", !!v)}
                />
                Top-5 search result
              </label>
              <label className="flex items-center gap-2">
                <Checkbox
                  checked={!!form.features?.bannerOnHomePageRecommendedBadge}
                  onCheckedChange={(v) => updateFeature("bannerOnHomePageRecommendedBadge", !!v)}
                />
                Banner promotion
              </label>
             
            </div>
          </div>

          <label className="flex items-center gap-2 text-sm">
            <Checkbox
              checked={form.active !== false}
              onCheckedChange={(v) => setForm((p) => ({ ...p, active: !!v }))}
            />
            Active
          </label>
        </div>
        <DialogFooter>
          <Button onClick={onSubmit} disabled={loading}>
            {loading ? "Saving..." : "Save"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
