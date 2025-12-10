"use client"

import type React from "react"
import { createContext, useContext, useEffect, useState } from "react"

interface Vendor {
  id: string
  name: string
  ownerName: string
  email: string
  phone: string
  businessType: string
  status: string
  verificationStatus: string
}

interface VendorContextType {
  vendor: Vendor | null
  loading: boolean
  login: (vendor: Vendor) => void
  logout: () => void
  checkSession: () => Promise<void>
}

const VendorContext = createContext<VendorContextType | undefined>(undefined)

export function VendorProvider({ children }: { children: React.ReactNode }) {
  const [vendor, setVendor] = useState<Vendor | null>(null)
  const [loading, setLoading] = useState(true)

  const login = (vendorData: Vendor) => {
    setVendor(vendorData)
  }

  const logout = () => {
    setVendor(null)
  }

  const checkSession = async () => {
    try {
      const response = await fetch("/api/vendor-auth/session", {
        method: "GET",
        credentials: "include",
      })

      if (response.ok) {
        const result = await response.json()
        if (result.success && result.data?.vendor) {
          setVendor(result.data.vendor)
        } else {
          setVendor(null)
        }
      } else {
        setVendor(null)
      }
    } catch (error) {
      console.error("Session check failed:", error)
      setVendor(null)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    checkSession()
  }, [])

  return (
    <VendorContext.Provider value={{ vendor, loading, login, logout, checkSession }}>{children}</VendorContext.Provider>
  )
}

export function useVendor() {
  const context = useContext(VendorContext)
  if (context === undefined) {
    throw new Error("useVendor must be used within a VendorProvider")
  }
  return context
}
