"use client"

import type React from "react"
import { createContext, useContext, useState } from "react"

interface Amenity {
  id: number
  name: string
  description: string
  category: string
  icon: string
  status: string
}

interface AmenitiesContextType {
  amenities: Amenity[]
  addAmenity: (amenity: Omit<Amenity, "id">) => void
  updateAmenity: (id: number, amenity: Partial<Amenity>) => void
  deleteAmenity: (id: number) => void
  getActiveAmenities: () => Amenity[]
}

const AmenitiesContext = createContext<AmenitiesContextType | undefined>(undefined)

const initialAmenities: Amenity[] = [
  {
    id: 1,
    name: "WiFi",
    description: "High-speed internet connectivity",
    category: "Technology",
    icon: "Wifi",
    status: "active",
  },
  {
    id: 2,
    name: "Parking",
    description: "Secure vehicle parking facility",
    category: "Transportation",
    icon: "Car",
    status: "active",
  },
  {
    id: 3,
    name: "Mess/Canteen",
    description: "On-site food facility",
    category: "Food",
    icon: "Utensils",
    status: "active",
  },
  {
    id: 4,
    name: "Security",
    description: "24/7 security service",
    category: "Safety",
    icon: "Shield",
    status: "active",
  },
  {
    id: 5,
    name: "Gym",
    description: "Fitness and workout facility",
    category: "Recreation",
    icon: "Dumbbell",
    status: "active",
  },
  {
    id: 6,
    name: "Laundry",
    description: "Washing and cleaning service",
    category: "Utilities",
    icon: "Droplets",
    status: "active",
  },
  {
    id: 7,
    name: "Study Room",
    description: "Quiet space for studying",
    category: "Education",
    icon: "BookOpen",
    status: "active",
  },
  {
    id: 8,
    name: "Recreation Room",
    description: "Entertainment and relaxation area",
    category: "Recreation",
    icon: "Gamepad2",
    status: "active",
  },
]

export function AmenitiesProvider({ children }: { children: React.ReactNode }) {
  const [amenities, setAmenities] = useState<Amenity[]>(initialAmenities)

  const addAmenity = (amenity: Omit<Amenity, "id">) => {
    const newAmenity = {
      ...amenity,
      id: Date.now(),
    }
    setAmenities((prev) => [newAmenity, ...prev])
  }

  const updateAmenity = (id: number, updatedAmenity: Partial<Amenity>) => {
    setAmenities((prev) => prev.map((amenity) => (amenity.id === id ? { ...amenity, ...updatedAmenity } : amenity)))
  }

  const deleteAmenity = (id: number) => {
    setAmenities((prev) => prev.filter((amenity) => amenity.id !== id))
  }

  const getActiveAmenities = () => {
    return amenities.filter((amenity) => amenity.status === "active")
  }

  return (
    <AmenitiesContext.Provider
      value={{
        amenities,
        addAmenity,
        updateAmenity,
        deleteAmenity,
        getActiveAmenities,
      }}
    >
      {children}
    </AmenitiesContext.Provider>
  )
}

export function useAmenities() {
  const context = useContext(AmenitiesContext)
  if (context === undefined) {
    throw new Error("useAmenities must be used within an AmenitiesProvider")
  }
  return context
}
