import { PropertyCard } from "@/components/property-card"

interface Property {
  _id: string
  slug?: string | null
  propertyId: string
  name: string
  type: "Hostel" | "PG" | "Both"
  address: string
  city: string
  state: string
  gender: "male" | "female" | "coed"
  rentRange: { min: number; max: number }
  totalBeds: number
  availableBeds: number
  amenities: string[]
  images: string[]
  nearbyLandmark?: string
}

interface SimilarPropertiesProps {
  properties: Property[]
}

export function SimilarProperties({ properties }: SimilarPropertiesProps) {
  if (!properties.length) return null

  return (
    <section className="py-12 bg-gray-50">
      <div className="container mx-auto px-4">
        <h2 className="text-2xl font-bold text-[#2e057f] mb-8">Similar Properties</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {properties.map((property) => (
            <PropertyCard key={property._id} property={property} />
          ))}
        </div>
      </div>
    </section>
  )
}
