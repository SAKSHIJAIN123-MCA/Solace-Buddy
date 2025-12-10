"use client"

import useSWR from "swr"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { PackageFormDialog } from "@/components/admin/package-form-dialog"
import { Checkbox } from "@/components/ui/checkbox"

const fetcher = (url: string) => fetch(url).then((r) => r.json())

export default function PackagesPage() {
  const { data, mutate, isLoading } = useSWR("/api/admin/packages", fetcher)
  const packages: any[] = data?.data || []

  async function onToggleFeature(pkgId: string, key: string, value: boolean) {
    const pkg = packages.find((p) => p._id === pkgId)
    if (!pkg) return
    const next = { ...pkg, features: { ...pkg.features, [key]: value } }
    await fetch(`/api/admin/packages/${pkgId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ features: next.features }),
    })
    mutate()
  }

  async function onToggleActive(pkgId: string, value: boolean) {
    await fetch(`/api/admin/packages/${pkgId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ active: value }),
    })
    mutate()
  }

  async function onDelete(pkgId: string) {
    if (!confirm("Delete this package? This action cannot be undone.")) return
    await fetch(`/api/admin/packages/${pkgId}`, { method: "DELETE" })
    mutate()
  }

  return (
    <main className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold text-pretty">Packages</h1>
        <PackageFormDialog trigger={<Button>Add Package</Button>} onCompleted={() => mutate()} />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Manage package features</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-sm text-muted-foreground">Loading...</div>
          ) : packages.length === 0 ? (
            <div className="text-sm text-muted-foreground">No packages yet. Click “Add Package”.</div>
          ) : (
            <div className="overflow-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left">
                    <th className="py-2 pr-4">Name</th>
                    <th className="py-2 pr-4">Free listing</th>
                    <th className="py-2 pr-4">Verified Badge</th>
                    <th className="py-2 pr-4">Top-5 Results</th>
                    <th className="py-2 pr-4">Banner Promotion</th>

                    <th className="py-2 pr-4">Active</th>
                    <th className="py-2 pr-4">Edit</th>
                    <th className="py-2 pr-4">Delete</th>
                  </tr>
                </thead>
                <tbody>
                  {packages.map((p) => (
                    <tr key={p._id} className="border-t">
                      <td className="py-2 pr-4 capitalize">{p.name}</td>
                      <td className="py-2 pr-4">
                        <Checkbox
                          checked={!!p.features?.freeListingOnWebsite}
                          onCheckedChange={() =>
                            onToggleFeature(p._id, "freeListingOnWebsite", !p.features?.freeListingOnWebsite)
                          }
                        />
                      </td>
                      <td className="py-2 pr-4">
                        <Checkbox
                          checked={!!p.features?.freeSocialMediaPromotion}
                          onCheckedChange={() =>
                            onToggleFeature(p._id, "freeSocialMediaPromotion", !p.features?.freeSocialMediaPromotion)
                          }
                        />
                      </td>
                      <td className="py-2 pr-4">
                        <Checkbox
                          checked={!!p.features?.top5SearchResult}
                          onCheckedChange={() =>
                            onToggleFeature(p._id, "top5SearchResult", !p.features?.top5SearchResult)
                          }
                        />
                      </td>
                      <td className="py-2 pr-4">
                        <Checkbox
                          checked={!!p.features?.bannerOnHomePageRecommendedBadge}
                          onCheckedChange={() =>
                            onToggleFeature(
                              p._id,
                              "bannerOnHomePageRecommendedBadge",
                              !p.features?.bannerOnHomePageRecommendedBadge,
                            )
                          }
                        />
                      </td>

                      <td className="py-2 pr-4">
                        <Checkbox
                          checked={p.active !== false}
                          onCheckedChange={() => onToggleActive(p._id, !p.active)}
                        />
                      </td>
                      <td className="py-2 pr-4">
                        <PackageFormDialog
                          initialData={p}
                          trigger={
                            <Button size="sm" variant="secondary">
                              Edit
                            </Button>
                          }
                          onCompleted={() => mutate()}
                        />
                      </td>
                      <td className="py-2 pr-4">
                        <Button size="sm" variant="destructive" onClick={() => onDelete(p._id)}>
                          Delete
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </main>
  )
}
