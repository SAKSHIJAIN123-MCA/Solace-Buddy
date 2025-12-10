"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerTrigger } from "@/components/ui/drawer"
import { X } from "lucide-react"
import { DatePicker } from "@/components/date-picker"

interface ICity {
  _id: string
  name: string
  state: {
    _id: string
    name: string
    country: {
      _id: string
      name: string
      code: string
    }
  }
}

interface IArea {
  _id: string
  name: string
  city: {
    _id: string
    name: string
  }
}

interface VisitPropertyDrawerProps {
  propertyId: string
  propertyName: string
  children: React.ReactNode
}

export function VisitPropertyDrawer({ propertyId, propertyName, children }: VisitPropertyDrawerProps) {
  const [open, setOpen] = useState(false)
  const [formData, setFormData] = useState({
    name: "",
    mobile: "",
    email: "",
    gender: "",
    neededFrom: "",
    city: "",
    areas: [],
    otherRequirements: "",
    // Specific Requirements
    acPreference: "",
    sharingPreference: [],
    budget: "",
    // Visit Scheduling
    preferredVisitDate: "",
  })

  const [showSpecificRequirements, setShowSpecificRequirements] = useState(false)
  const [showVisitScheduling, setShowVisitScheduling] = useState(false)
  const [mobileError, setMobileError] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)

  const [cities, setCities] = useState<ICity[]>([])
  const [filteredAreas, setFilteredAreas] = useState<IArea[]>([])
  const [loadingCities, setLoadingCities] = useState(true)
  const [loadingAreas, setLoadingAreas] = useState(false)

  const sharingOptions = ["1", "2", "3", "4", "5", "6", "7", "8"]
  const budgetOptions = ["Up to 6500", "Up to 8500", "Up to 12500", "Any"]

  useEffect(() => {
    fetchCities()
  }, [])

  useEffect(() => {
    if (formData.city) {
      const selectedCity = cities.find((city) => city.name === formData.city)
      if (selectedCity) {
        fetchAreasByCity(selectedCity._id)
      }
    } else {
      setFilteredAreas([])
      setFormData((prev) => ({ ...prev, areas: [] }))
    }
  }, [formData.city, cities])

  useEffect(() => {
    if (open) {
      setFormData({
        name: "",
        mobile: "",
        email: "",
        gender: "",
        neededFrom: "",
        city: "",
        areas: [],
        otherRequirements: "",
        acPreference: "",
        sharingPreference: [],
        budget: "",
        preferredVisitDate: "",
      })
      setShowSpecificRequirements(false)
      setShowVisitScheduling(false)
      setMobileError("")
    }
  }, [open])

  const fetchCities = async () => {
    try {
      setLoadingCities(true)
      const response = await fetch("/api/locations/cities")
      const result = await response.json()
      if (result.success) {
        setCities(result.data)
      }
    } catch (error) {
      console.error("Error fetching cities:", error)
    } finally {
      setLoadingCities(false)
    }
  }

  const fetchAreasByCity = async (cityId: string) => {
    try {
      setLoadingAreas(true)
      const response = await fetch(`/api/locations/areas`)
      const result = await response.json()
      if (result.success) {
        setFilteredAreas(result.data)
      }
    } catch (error) {
      console.error("Error fetching areas:", error)
    } finally {
      setLoadingAreas(false)
    }
  }

  const handleInputChange = (field: string, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }))

    // Mobile validation
    if (field === "mobile") {
      if (!/^\d{10}$/.test(value) && value !== "") {
        setMobileError("Mobile number must be exactly 10 digits")
      } else {
        setMobileError("")
      }
    }
  }

  const handleMultiSelect = (field: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: prev[field as keyof typeof prev].includes(value)
        ? (prev[field as keyof typeof prev] as string[]).filter((item: string) => item !== value)
        : [...(prev[field as keyof typeof prev] as string[]), value],
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (mobileError || !formData.mobile.match(/^\d{10}$/)) {
      setMobileError("Please enter a valid 10-digit mobile number")
      return
    }

    setIsSubmitting(true)
    try {
      const response = await fetch("/api/inquiries", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          propertyId,
          propertyName,
          submittedAt: new Date().toISOString(),
        }),
      })

      if (response.ok) {
        alert("Visit inquiry submitted successfully!")
        setOpen(false)
      } else {
        const errorData = await response.json()
        alert(`Error: ${errorData.error || "Please try again."}`)
      }
    } catch (error) {
      alert("Error submitting inquiry. Please try again.")
    }
    setIsSubmitting(false)
  }

  return (
    <Drawer open={open} onOpenChange={setOpen}>
      <DrawerTrigger asChild>{children}</DrawerTrigger>
      <DrawerContent className="h-full w-96 bg-white/95 backdrop-blur-sm border-l shadow-xl ml-auto">
        <div className="mx-auto w-full max-w-md">
          <DrawerHeader className="relative bg-[#2e057f] text-white rounded-t-lg">
            <button onClick={() => setOpen(false)} className="absolute right-4 top-4 text-white hover:text-gray-200">
              <X className="h-6 w-6" />
            </button>
            <DrawerTitle className="text-xl font-bold text-center">Request a visit</DrawerTitle>
            <p className="text-center text-purple-100 text-sm mt-2">
              Fill out our comprehensive form and we'll match you with the perfect accommodation options.
            </p>
          </DrawerHeader>

          <div className="p-6 max-h-[calc(100vh-200px)] overflow-y-auto">
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Row 1: Name, Mobile, Email */}
              <div className="grid grid-cols-1 gap-4">
                <input
                  type="text"
                  placeholder="Your Name *"
                  value={formData.name}
                  onChange={(e) => handleInputChange("name", e.target.value)}
                  required
                  className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2e057f] focus:border-transparent outline-none transition-all duration-200"
                />
                <div>
                  <input
                    type="tel"
                    placeholder="Mobile Number*"
                    value={formData.mobile}
                    onChange={(e) => handleInputChange("mobile", e.target.value.replace(/\D/g, "").slice(0, 10))}
                    required
                    className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-[#2e057f] focus:border-transparent outline-none transition-all duration-200 ${
                      mobileError ? "border-red-500" : "border-gray-300"
                    }`}
                  />
                  {mobileError && <p className="text-red-500 text-sm mt-1">{mobileError}</p>}
                </div>
                <input
                  type="email"
                  placeholder="Email Address *"
                  value={formData.email}
                  onChange={(e) => handleInputChange("email", e.target.value)}
                  required
                  className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2e057f] focus:border-transparent outline-none transition-all duration-200"
                />
              </div>

              {/* Row 2: Gender, Needed From Date */}
              <div className="grid grid-cols-1 gap-4">
                <select
                  value={formData.gender}
                  onChange={(e) => handleInputChange("gender", e.target.value)}
                  required
                  className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2e057f] focus:border-transparent outline-none transition-all duration-200"
                >
                  <option value="">Select Gender *</option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                </select>
                <DatePicker
                  value={formData.neededFrom}
                  onChange={(date) => handleInputChange("neededFrom", date)}
                  required
                />
              </div>

              {/* Row 3: City, Areas */}
              <div className="grid grid-cols-1 gap-4">
                <select
                  value={formData.city}
                  onChange={(e) => handleInputChange("city", e.target.value)}
                  required
                  className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2e057f] focus:border-transparent outline-none transition-all duration-200"
                  disabled={loadingCities}
                >
                  <option value="">{loadingCities ? "Loading cities..." : "Select City *"}</option>
                  {cities.map((city) => (
                    <option key={city._id} value={city.name}>
                      {city.name}
                    </option>
                  ))}
                </select>

                <div className="relative">
                  <select
                    value=""
                    onChange={(e) => {
                      if (e.target.value) {
                        handleMultiSelect("areas", e.target.value)
                        e.target.value = ""
                      }
                    }}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2e057f] focus:border-transparent outline-none transition-all duration-200"
                    disabled={!formData.city || loadingAreas}
                  >
                    <option value="">
                      {!formData.city ? "Select city first" : loadingAreas ? "Loading areas..." : "Select Areas *"}
                    </option>
                    {filteredAreas.map((area) => (
                      <option key={area._id} value={area.name}>
                        {area.name}
                      </option>
                    ))}
                  </select>
                  {formData.areas.length > 0 && (
                    <div className="mt-2 flex flex-wrap gap-1">
                      {formData.areas.map((area) => (
                        <span
                          key={area}
                          className="inline-flex items-center gap-1 px-2 py-1 bg-[#2e057f] text-white text-sm rounded"
                        >
                          {area}
                          <button
                            type="button"
                            onClick={() => handleMultiSelect("areas", area)}
                            className="text-white hover:text-gray-200"
                          >
                            ×
                          </button>
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Other Requirements */}
              <textarea
                placeholder="Any other requirements"
                value={formData.otherRequirements}
                onChange={(e) => handleInputChange("otherRequirements", e.target.value)}
                rows={3}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2e057f] focus:border-transparent outline-none transition-all duration-200"
              />

              {/* Expandable Specific Requirements */}
              <div className="border border-gray-200 rounded-lg">
                <button
                  type="button"
                  onClick={() => setShowSpecificRequirements(!showSpecificRequirements)}
                  className="w-full px-4 py-3 flex items-center justify-between text-left hover:bg-gray-50 rounded-lg transition-colors"
                >
                  <span className="font-medium text-gray-700">Specific Requirements</span>
                  <svg
                    className={`w-5 h-5 transition-transform ${showSpecificRequirements ? "rotate-180" : ""}`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>

                {showSpecificRequirements && (
                  <div className="px-4 pb-4 space-y-4 border-t border-gray-200">
                    <div className="grid grid-cols-1 gap-4 mt-4">
                      <select
                        value={formData.acPreference}
                        onChange={(e) => handleInputChange("acPreference", e.target.value)}
                        className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2e057f] focus:border-transparent outline-none"
                      >
                        <option value="">AC Preference</option>
                        <option value="AC">AC</option>
                        <option value="Non-AC">Non-AC</option>
                      </select>

                      <div className="relative">
                        <select
                          value=""
                          onChange={(e) => {
                            if (e.target.value) {
                              handleMultiSelect("sharingPreference", e.target.value)
                              e.target.value = ""
                            }
                          }}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2e057f] focus:border-transparent outline-none"
                        >
                          <option value="">Sharing Preference</option>
                          {sharingOptions.map((option) => (
                            <option key={option} value={option}>
                              {option} Person{option !== "1" ? "s" : ""}
                            </option>
                          ))}
                        </select>
                        {formData.sharingPreference.length > 0 && (
                          <div className="mt-2 flex flex-wrap gap-1">
                            {formData.sharingPreference.map((pref) => (
                              <span
                                key={pref}
                                className="inline-flex items-center gap-1 px-2 py-1 bg-[#2e057f] text-white text-sm rounded"
                              >
                                {pref} Person{pref !== "1" ? "s" : ""}
                                <button
                                  type="button"
                                  onClick={() => handleMultiSelect("sharingPreference", pref)}
                                  className="text-white hover:text-gray-200"
                                >
                                  ×
                                </button>
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="grid grid-cols-1 gap-4">
                      <select
                        value={formData.budget}
                        onChange={(e) => handleInputChange("budget", e.target.value)}
                        className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2e057f] focus:border-transparent outline-none"
                      >
                        <option value="">Select Budget</option>
                        {budgetOptions.map((option) => (
                          <option key={option} value={option}>
                            {option}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                )}
              </div>

              {/* Expandable Visit Scheduling */}
              <div className="border border-gray-200 rounded-lg">
                <button
                  type="button"
                  onClick={() => setShowVisitScheduling(!showVisitScheduling)}
                  className="w-full px-4 py-3 flex items-center justify-between text-left hover:bg-gray-50 rounded-lg transition-colors"
                >
                  <span className="font-medium text-gray-700">Preferred Visit Date</span>
                  <svg
                    className={`w-5 h-5 transition-transform ${showVisitScheduling ? "rotate-180" : ""}`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>

                {showVisitScheduling && (
                  <div className="px-4 pb-4 space-y-4 border-t border-gray-200">
                    <div className="grid grid-cols-1 gap-4 mt-4">
                      <DatePicker
                        value={formData.preferredVisitDate}
                        onChange={(date) => handleInputChange("preferredVisitDate", date)}
                      />
                    </div>
                  </div>
                )}
              </div>

              <Button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-[#2e057f] hover:bg-purple-700 text-white font-semibold py-3 rounded-full mt-6"
              >
                {isSubmitting ? "SUBMITTING..." : "SUBMIT INQUIRY"}
              </Button>
            </form>
          </div>
        </div>
      </DrawerContent>
    </Drawer>
  )
}
