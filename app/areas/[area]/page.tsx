import { PropertyCard } from "@/components/property-card"
import { connectDB } from "@/lib/db"
import VendorProperty from "@/lib/models/vendorproper"

export const dynamic = "force-dynamic"

interface Props {
  params: { area: string }
  searchParams?: {
    q?: string
    type?: "pg" | "hostel" | "both"
    gender?: "male" | "female" | "coed"
    page?: string
    pageSize?: string
  }
}

export default async function AreaPropertiesPage({ params, searchParams = {} }: Props) {
  await connectDB()

  const areaName = decodeURIComponent(params.area)
  const { q = "", type = "all" as any, gender = "all" as any, page = "1", pageSize = "24" } = searchParams

  console.log("[v0] Area page accessed with area:", areaName)
  console.log("[v0] Search params:", searchParams)

  const filter: any = {
    isActive: true,
    area: new RegExp(`^${areaName}$`, "i"),
  }

  if (q) {
    filter.$or = [
      { name: { $regex: q, $options: "i" } },
      { pgNickName: { $regex: q, $options: "i" } },
      { address: { $regex: q, $options: "i" } },
      { nearbyLandmark: { $regex: q, $options: "i" } },
      { ownerName: { $regex: q, $options: "i" } },
    ]
  }

  if (type && type !== "all") {
    if (type === "pg") {
      filter.type = "PG"
    } else if (type === "hostel") {
      filter.type = "Hostel"
    } else if (type === "both") {
      filter.type = "Both"
    }
  }

  if (gender && gender !== "all") {
    filter.gender = gender
  }

  const pageNum = Math.max(1, Number.parseInt(page as string, 10) || 1)
  const sizeNum = Math.min(48, Math.max(1, Number.parseInt(pageSize as string, 10) || 24))
  const skip = (pageNum - 1) * sizeNum

  const [items, total] = await Promise.all([
    VendorProperty.find(filter).sort({ createdAt: -1 }).skip(skip).limit(sizeNum).lean(),
    VendorProperty.countDocuments(filter),
  ])

  console.log("[v0] Found properties:", total)
  console.log("[v0] Filter used:", filter)

  const properties = items.map((p: any) => ({
    _id: String(p._id),
    slug: p.slug || null,
    propertyId: p.propertyId,
    name: p.pgNickName || p.name,
    type: p.type || "PG",
    address: p.address,
    city: p.city,
    state: p.state,
    gender: p.gender,
    rentRange: p.rentRange || { min: 0, max: 0 },
    totalBeds: p.totalBeds || 0,
    availableBeds: p.availableBeds || 0,
    amenities: Array.isArray(p.amenities) ? p.amenities : [],
    images: p.mainImage
      ? [p.mainImage, ...(Array.isArray(p.commonPhotos) ? p.commonPhotos : [])]
      : Array.isArray(p.images) && p.images.length
        ? p.images
        : ["/diverse-property-showcase.png"],
    nearbyLandmark: p.nearbyLandmark || "",
  }))

  // Instead of notFound(), show a message when no properties are found
  if (total === 0) {
    return (
      <div className="bg-gray-50">
        <div className="container mx-auto px-4 py-4 bg-gray-50">
          <div className="mb-4 bg-gray-50">
            <h1 className="text-3xl font-bold text-[#2e057f] mb-5">Properties in {areaName}</h1>
            <p className="text-muted-foreground mb-5">Find the perfect accommodation in {areaName}</p>
          </div>

          <div className="text-center py-16">
            <div className="max-w-md mx-auto">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">No Properties Found</h2>
              <p className="text-gray-600 mb-8">
                We don't have any properties listed in {areaName} yet. Check back soon or explore other areas.
              </p>
              <a
                href="/properties"
                className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-[#2e057f] hover:bg-[#4c1d95] transition-colors"
              >
                View All Properties
              </a>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-[55px]">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-[#2e057f] mb-5">Properties in {areaName}</h1>
          <p className="text-muted-foreground mt-5">Find the perfect accommodation in {areaName}</p>
          <p className="text-sm text-muted-foreground mt-2 mb-8">
            Showing {properties.length} of {total} properties
            {q && ` for "${q}"`}
            {type !== "all" && ` • ${type.toUpperCase()}`}
            {gender !== "all" && ` • ${gender.toUpperCase()}`}
          </p>
        </div>

        {/* <PropertyFilters /> */}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mt-5">
          {properties.map((property: any) => (
            <PropertyCard key={property._id} property={property} />
          ))}
        </div>

        {total > sizeNum && (
          <div className="flex justify-center items-center gap-4 mt-8">
            <p className="text-sm text-muted-foreground">
              Page {pageNum} of {Math.ceil(total / sizeNum)}
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
