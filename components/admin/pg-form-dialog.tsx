"use client"

import type React from "react"
import { useEffect, useMemo, useState } from "react"
import useSWR from "swr"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"

type PGFormDialogProps = {
  open: boolean
  onClose: () => void
  onSubmit: (data: any) => Promise<void> | void
  initialData?: any | null
  mode?: "add" | "edit"
}

type ICountry = { _id: string; name: string; code: string }
type IStateLoc = { _id: string; name: string; country?: ICountry | string }
type ICityLoc = { _id: string; name: string; state: IStateLoc | string }
type IAreaLoc = { _id: string; name: string; city: ICityLoc | string }

export function PGFormDialog({ open, onClose, onSubmit, initialData, mode = "add" }: PGFormDialogProps) {
  const [submitting, setSubmitting] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})

  // Core required fields
  const [name, setName] = useState(initialData?.name || "")
  const [type, setType] = useState<"Hostel" | "PG" | "Both">(initialData?.type || "PG")
  const [state, setState] = useState(initialData?.state || "")
  const [city, setCity] = useState(initialData?.city || "")
  const [area, setArea] = useState(initialData?.area || "")
  
  const [pincode, setPincode] = useState(initialData?.pincode || "")
  const [contactNumber, setContactNumber] = useState(initialData?.contactNumber || "")
  const [gender, setGender] = useState<"male" | "female" | "coed">(initialData?.gender || "coed")

  // Optional and extra fields
  const [pgNickName, setPgNickName] = useState(initialData?.pgNickName || "")
  const [ownerName, setOwnerName] = useState(initialData?.ownerName || "")
  const [ownerMobile, setOwnerMobile] = useState(initialData?.ownerMobile || "")
  const [caretakerName, setCaretakerName] = useState(initialData?.caretakerName || "")
  const [caretakerMobile, setCaretakerMobile] = useState(initialData?.caretakerMobile || "")
  const [nearbyLandmark, setNearbyLandmark] = useState(initialData?.nearbyLandmark || "")
  const [description, setDescription] = useState(initialData?.description || "")
  const [vendor, setVendor] = useState(initialData?.vendor || "")

  const [status, setStatus] = useState<"public" | "draft">(initialData?.status || "public")

  type Amenity = {
    _id: string
    name: string
    icon?: string
    status: "active" | "inactive"
  }

  const [amenities, setAmenities] = useState<string[]>([])
  const [amenityOptions, setAmenityOptions] = useState<{ id: string; name: string }[]>([])

  const [rules, setRules] = useState<string[]>(Array.isArray(initialData?.rules) ? initialData.rules : [])
  const [isFeatured, setIsFeatured] = useState<boolean>(!!initialData?.isFeatured)
  const [packageType, setPackageType] = useState(initialData?.package)
  const [depositType, setDepositType] = useState<"one_rent" | "custom">(initialData?.depositType || "one_rent")
  const [depositAmount, setDepositAmount] = useState<number>(initialData?.depositAmount || 0)

  const [mapLink, setMapLink] = useState(initialData?.mapLink || "")
  const [withFood, setWithFood] = useState<boolean>(!!initialData?.withFood)
  const [withoutFood, setWithoutFood] = useState<boolean>(!!initialData?.withoutFood)

  const [mainImage, setMainImage] = useState<string>(initialData?.mainImage || "")
  const [commonPhotos, setCommonPhotos] = useState<string[]>(
    Array.isArray(initialData?.commonPhotos) ? initialData.commonPhotos : [],
  )

  const [statesList, setStatesList] = useState<IStateLoc[]>([])
  const [citiesList, setCitiesList] = useState<ICityLoc[]>([])
  const [areasList, setAreasList] = useState<IAreaLoc[]>([])
  const [loadingStates, setLoadingStates] = useState(false)
  const [loadingCities, setLoadingCities] = useState(false)
  const [loadingAreas, setLoadingAreas] = useState(false)

  const parseCSV = (value: string) =>
    value
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean)

  useEffect(() => {
    if (!open) return
    setName(initialData?.name || "")
    setType(initialData?.type || "PG")
    setState(initialData?.state || "")
    setCity(initialData?.city || "")
    setArea(initialData?.area || "")
    setPincode(initialData?.pincode || "")
    setContactNumber(initialData?.contactNumber || "")
    setGender(initialData?.gender || "coed")
    setPgNickName(initialData?.pgNickName || "")
    setOwnerName(initialData?.ownerName || "")
    setOwnerMobile(initialData?.ownerMobile || "")
    setCaretakerName(initialData?.caretakerName || "")
    setCaretakerMobile(initialData?.caretakerMobile || "")
    setNearbyLandmark(initialData?.nearbyLandmark || "")
    setDescription(initialData?.description || "")
    setVendor(initialData?.vendor || "")
    setStatus(initialData?.status || "public")
    setRules(Array.isArray(initialData?.rules) ? initialData.rules : [])
    setIsFeatured(!!initialData?.isFeatured)
    setPackageType(initialData?.package)
    setDepositType(initialData?.depositType || "one_rent")
    setDepositAmount(initialData?.depositAmount || 0)
    setMapLink(initialData?.mapLink || "")
    setWithFood(!!initialData?.withFood)
    setWithoutFood(!!initialData?.withoutFood)
    setMainImage(initialData?.mainImage || "")
    const existingAmenities = Array.isArray(initialData?.amenities)
      ? initialData.amenities.map((a: any) => (typeof a === "string" ? a : a._id || a.id || "")).filter(Boolean)
      : []
    setAmenities(existingAmenities)
    setCommonPhotos(Array.isArray(initialData?.commonPhotos) ? initialData.commonPhotos : [])
    setErrors({})
  }, [open, initialData])

  useEffect(() => {
    if (open) {
      fetch("/api/amenities")
        .then((r) => r.json())
        .then((d) => {
          const list = Array.isArray(d?.data) ? d.data : []
          setAmenityOptions(
            list.map((a: any) => ({
              id: a._id || a.id || a.value || a.name,
              name: a.name || a.label || String(a),
            })),
          )
        })
        .catch(() => setAmenityOptions([]))
    }
  }, [open])

  useEffect(() => {
    if (!open) return
    let ignore = false
    const fetchAll = async () => {
      try {
        setLoadingStates(true)
        setLoadingCities(true)
        setLoadingAreas(true)

        const [sRes, cRes, aRes] = await Promise.allSettled([
          fetch("/api/locations/states", { cache: "no-store" }),
          fetch("/api/locations/cities", { cache: "no-store" }),
          fetch("/api/locations/areas", { cache: "no-store" }),
        ])

        if (!ignore && sRes.status === "fulfilled") {
          const js = await sRes.value.json().catch(() => ({}))
          if (js?.success && Array.isArray(js.data)) setStatesList(js.data as IStateLoc[])
        }
        if (!ignore && cRes.status === "fulfilled") {
          const js = await cRes.value.json().catch(() => ({}))
          if (js?.success && Array.isArray(js.data)) setCitiesList(js.data as ICityLoc[])
        }
        if (!ignore && aRes.status === "fulfilled") {
          const js = await aRes.value.json().catch(() => ({}))
          if (js?.success && Array.isArray(js.data)) setAreasList(js.data as IAreaLoc[])
        }
      } finally {
        if (!ignore) {
          setLoadingStates(false)
          setLoadingCities(false)
          setLoadingAreas(false)
        }
      }
    }
    fetchAll()
    return () => {
      ignore = true
    }
  }, [open])

  useEffect(() => {
    const selectedState = statesList.find((s) => s.name === state)
    if (city && selectedState) {
      const selectedCity = citiesList.find(
        (c) =>
          c.name === city &&
          (typeof c.state === "string"
            ? c.state === selectedState._id
            : (c.state as IStateLoc)._id === selectedState._id),
      )
      if (!selectedCity) {
        setCity("")
        setArea("")
      }
    } else if (state && !selectedState) {
      setArea("")
    } else if (!state) {
      setCity("")
      setArea("")
    }
  }, [state, statesList, citiesList, city])

  useEffect(() => {
    const selectedCity = citiesList.find((c) => c.name === city)
    if (area && selectedCity) {
      const ok = areasList.some((a) => {
        const aCity = a.city
        const cityId = typeof aCity === "string" ? aCity : (aCity as ICityLoc)._id
        return a.name === area && cityId === selectedCity._id
      })
      if (!ok) setArea("")
    } else if (!city) {
      setArea("")
    }
  }, [city, citiesList, areasList, area])

  const stateOptions = useMemo(() => {
    const names = Array.from(new Set(statesList.map((s) => s.name).filter(Boolean)))
    if (state && !names.includes(state)) return [state, ...names]
    return names
  }, [statesList, state])

  const filteredCities = useMemo(() => {
    const selectedState = statesList.find((s) => s.name === state)
    const list = selectedState
      ? citiesList.filter((c) => {
          const s = c.state
          const sid = typeof s === "string" ? s : (s as IStateLoc)._id
          return sid === selectedState._id
        })
      : citiesList
    const names = Array.from(new Set(list.map((c) => c.name).filter(Boolean)))
    if (city && !names.includes(city)) return [city, ...names]
    return names
  }, [citiesList, statesList, state, city])

  const filteredAreas = useMemo(() => {
    const selectedCity = citiesList.find((c) => c.name === city)
    const list = selectedCity
      ? areasList.filter((a) => {
          const ac = a.city
          const cid = typeof ac === "string" ? ac : (ac as ICityLoc)._id
          return cid === selectedCity._id
        })
      : areasList
    const names = Array.from(new Set(list.map((a) => a.name).filter(Boolean)))
    if (area && !names.includes(area)) return [area, ...names]
    return names
  }, [areasList, citiesList, city, area])

  function toggleAmenity(id: string) {
    setAmenities((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]))
  }

  const { data: pkgRes, isLoading: packagesLoading } = useSWR(
    open ? "/api/admin/packages?active=true" : null,
    (u: string) => fetch(u, { cache: "no-store" }).then((r) => r.json()),
  )

  const { data: vendorsRes, isLoading: vendorsLoading } = useSWR(
    open ? "/api/vendors?limit=100&status=active" : null,
    (u: string) => fetch(u, { cache: "no-store" }).then((r) => r.json()),
  )

  const packageOptions = useMemo(() => {
    const list = Array.isArray(pkgRes?.data) ? pkgRes.data : []
    const names = list.map((p: any) => String(p?.name || "").trim()).filter(Boolean)
    if (packageType && !names.includes(packageType)) return [packageType, ...names]
    return names
  }, [pkgRes, packageType])

  const vendorOptions = useMemo(() => {
    const list = Array.isArray(vendorsRes?.data) ? vendorsRes.data : []
    const options = list.map((v: any) => ({
      id: v._id || v.id,
      name: v.name || "",
    }))
    return options
  }, [vendorsRes])

  const handleUpload = async (file: File): Promise<string> => {
    const formData = new FormData()
    formData.append("file", file)
    const res = await fetch("/api/upload", { method: "POST", body: formData })
    const data = await res.json()
    if (!res.ok || !data?.url) {
      throw new Error(data?.error || "Upload failed")
    }
    return data.url as string
  }

  const onSelectMainImage = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    try {
      const url = await handleUpload(file)
      setMainImage(url)
    } catch (err) {
      console.error("[v0] main image upload error", err)
    } finally {
      e.target.value = ""
    }
  }

  const onSelectCommonPhotos = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    if (!files.length) return
    try {
      const remainingSlots = 8 - commonPhotos.length
      const take = files.slice(0, remainingSlots)
      const uploads = await Promise.all(take.map((f) => handleUpload(f)))
      setCommonPhotos((prev) => Array.from(new Set([...prev, ...uploads])))
    } catch (err) {
      console.error("[v0] common photos upload error", err)
    } finally {
      e.target.value = ""
    }
  }

  const removeCommonPhoto = (url: string) => {
    setCommonPhotos((prev) => prev.filter((u) => u !== url))
  }

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {}

    if (!name.trim()) {
      newErrors.name = "Property name is required"
    } else if (name.length > 200) {
      newErrors.name = "Property name cannot be more than 200 characters"
    }

    if (!type) {
      newErrors.type = "Property type is required"
    }

    if (!state.trim()) {
      newErrors.state = "State is required"
    } else if (state.length > 100) {
      newErrors.state = "State name cannot be more than 100 characters"
    }

    if (!city.trim()) {
      newErrors.city = "City is required"
    } else if (city.length > 100) {
      newErrors.city = "City name cannot be more than 100 characters"
    }

    if (!area.trim()) {
      newErrors.area = "Area is required"
    } else if (area.length > 150) {
      newErrors.area = "Area cannot be more than 150 characters"
    }

    if (!pincode.trim()) {
      newErrors.pincode = "Pincode is required"
    } else if (!/^[1-9][0-9]{5}$/.test(pincode)) {
      newErrors.pincode = "Please enter a valid pincode"
    }

    if (!contactNumber.trim()) {
      newErrors.contactNumber = "Contact number is required"
    } else if (!/^[6-9]\d{9}$/.test(contactNumber)) {
      newErrors.contactNumber = "Please enter a valid contact number"
    }

    if (!gender) {
      newErrors.gender = "Gender preference is required"
    }

    if (ownerMobile && !/^[6-9]\d{9}$/.test(ownerMobile)) {
      newErrors.ownerMobile = "Please enter a valid mobile number"
    }

    if (caretakerMobile && !/^[6-9]\d{9}$/.test(caretakerMobile)) {
      newErrors.caretakerMobile = "Please enter a valid mobile number"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async () => {
    if (!validateForm()) {
      return
    }

    setSubmitting(true)
    try {
      const payload: any = {
        name,
        type,
        state,
        city,
        area,
        pincode,
        contactNumber,
        gender,
        pgNickName: pgNickName || undefined,
        ownerName: ownerName || undefined,
        ownerMobile: ownerMobile || undefined,
        caretakerName: caretakerName || undefined,
        caretakerMobile: caretakerMobile || undefined,
        nearbyLandmark: nearbyLandmark || undefined,
        description: description || undefined,
        ...(vendor ? { vendor } : {}),
        amenities,
        rules,
        isFeatured,
        package: packageType,
        depositType,
        depositAmount,
        mainImage: mainImage || undefined,
        commonPhotos,
        mapLink: mapLink || undefined,
        withFood,
        withoutFood,
        status,
      }

      await onSubmit(payload)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-3xl h-[90vh] overflow-y-auto rounded-xl">
        <DialogHeader>
          <DialogTitle className="text-balance">{mode === "edit" ? "Edit Property" : "Add Property"}</DialogTitle>
          <DialogDescription className="text-pretty">
            Fill the details below. Upload a main image and as many common photos as needed (up to 8).
          </DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Basic Info */}
          <div className="space-y-2">
            <Label htmlFor="name">
              Property Name <span className="text-red-500">*</span>
            </Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g., Sunrise PG"
              className={errors.name ? "border-red-500" : ""}
            />
            {errors.name && <p className="text-sm text-red-500">{errors.name}</p>}
          </div>

          <div className="space-y-2">
            <Label>
              Type <span className="text-red-500">*</span>
            </Label>
            <Select value={type} onValueChange={(v: any) => setType(v)}>
              <SelectTrigger className={errors.type ? "border-red-500" : ""}>
                <SelectValue placeholder="Select type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Hostel">Hostel</SelectItem>
                <SelectItem value="PG">PG</SelectItem>
                <SelectItem value="Both">Both</SelectItem>
              </SelectContent>
            </Select>
            {errors.type && <p className="text-sm text-red-500">{errors.type}</p>}
          </div>

          {/* Location: State → City → Area */}
          <div className="space-y-2">
            <Label>
              State <span className="text-red-500">*</span>
            </Label>
            <Select value={state || "__none__"} onValueChange={(v: string) => setState(v)} disabled={loadingStates}>
              <SelectTrigger className={errors.state ? "border-red-500" : ""}>
                <SelectValue placeholder={loadingStates ? "Loading states..." : "Select state"} />
              </SelectTrigger>
              <SelectContent>
                {stateOptions.length === 0 ? (
                  <SelectItem value="__none__" disabled>
                    {loadingStates ? "Loading..." : "No states found"}
                  </SelectItem>
                ) : (
                  stateOptions.map((n) => (
                    <SelectItem key={n} value={n}>
                      {n}
                    </SelectItem>
                  ))
                )}
              </SelectContent>
            </Select>
            {errors.state && <p className="text-sm text-red-500">{errors.state}</p>}
          </div>

          <div className="space-y-2">
            <Label>
              City <span className="text-red-500">*</span>
            </Label>
            <Select
              value={city || "__none__"}
              onValueChange={(v: string) => setCity(v)}
              disabled={loadingCities || !state}
            >
              <SelectTrigger className={errors.city ? "border-red-500" : ""}>
                <SelectValue
                  placeholder={
                    !state
                      ? "Select state first"
                      : loadingCities
                        ? "Loading cities..."
                        : filteredCities.length
                          ? "Select city"
                          : "No cities found"
                  }
                />
              </SelectTrigger>
              <SelectContent>
                {filteredCities.length === 0 ? (
                  <SelectItem value="__none__" disabled>
                    {!state ? "Select state first" : loadingCities ? "Loading..." : "No cities"}
                  </SelectItem>
                ) : (
                  filteredCities.map((n) => (
                    <SelectItem key={n} value={n}>
                      {n}
                    </SelectItem>
                  ))
                )}
              </SelectContent>
            </Select>
            {errors.city && <p className="text-sm text-red-500">{errors.city}</p>}
          </div>

          <div className="space-y-2">
            <Label>
              Area <span className="text-red-500">*</span>
            </Label>
            <Select
              value={area || "__none__"}
              onValueChange={(v: string) => setArea(v)}
              disabled={loadingAreas || !city}
            >
              <SelectTrigger className={errors.area ? "border-red-500" : ""}>
                <SelectValue
                  placeholder={
                    !city
                      ? "Select city first"
                      : loadingAreas
                        ? "Loading areas..."
                        : filteredAreas.length
                          ? "Select area"
                          : "No areas found"
                  }
                />
              </SelectTrigger>
              <SelectContent>
                {filteredAreas.length === 0 ? (
                  <SelectItem value="__none__" disabled>
                    {!city ? "Select city first" : loadingAreas ? "Loading..." : "No areas"}
                  </SelectItem>
                ) : (
                  filteredAreas.map((n) => (
                    <SelectItem key={n} value={n}>
                      {n}
                    </SelectItem>
                  ))
                )}
              </SelectContent>
            </Select>
            {errors.area && <p className="text-sm text-red-500">{errors.area}</p>}
          </div>

          {/* Contact & Gender */}
          <div className="space-y-2">
            <Label htmlFor="contactNumber">
              Contact Number <span className="text-red-500">*</span>
            </Label>
            <Input
              id="contactNumber"
              value={contactNumber}
              onChange={(e) => setContactNumber(e.target.value)}
              placeholder="10-digit mobile"
              className={errors.contactNumber ? "border-red-500" : ""}
            />
            {errors.contactNumber && <p className="text-sm text-red-500">{errors.contactNumber}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="pincode">
              Pincode <span className="text-red-500">*</span>
            </Label>
            <Input
              id="pincode"
              value={pincode}
              onChange={(e) => setPincode(e.target.value)}
              placeholder="476001"
              className={errors.pincode ? "border-red-500" : ""}
            />
            {errors.pincode && <p className="text-sm text-red-500">{errors.pincode}</p>}
          </div>

          <div className="space-y-2">
            <Label>
              Gender <span className="text-red-500">*</span>
            </Label>
            <Select value={gender} onValueChange={(v: any) => setGender(v)}>
              <SelectTrigger className={errors.gender ? "border-red-500" : ""}>
                <SelectValue placeholder="Select gender" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="male">Male</SelectItem>
                <SelectItem value="female">Female</SelectItem>
                <SelectItem value="coed">Co-ed</SelectItem>
              </SelectContent>
            </Select>
            {errors.gender && <p className="text-sm text-red-500">{errors.gender}</p>}
          </div>

          <div className="space-y-2">
            <Label>Status</Label>
            <Select value={status} onValueChange={(v: any) => setStatus(v)}>
              <SelectTrigger>
                <SelectValue placeholder="Select status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="public">Public</SelectItem>
                <SelectItem value="draft">Draft</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Optional Names */}
          <div className="space-y-2">
            <Label htmlFor="pgNickName">PG Nickname (optional)</Label>
            <Input id="pgNickName" value={pgNickName} onChange={(e) => setPgNickName(e.target.value)} />
          </div>

          <div className="space-y-2">
            <Label htmlFor="caretakerName">Caretaker Name (optional)</Label>
            <Input id="caretakerName" value={caretakerName} onChange={(e) => setCaretakerName(e.target.value)} />
          </div>

          <div className="space-y-2">
            <Label htmlFor="caretakerMobile">Caretaker Mobile (optional)</Label>
            <Input
              id="caretakerMobile"
              value={caretakerMobile}
              onChange={(e) => setCaretakerMobile(e.target.value)}
              placeholder="10-digit mobile"
              className={errors.caretakerMobile ? "border-red-500" : ""}
            />
            {errors.caretakerMobile && <p className="text-sm text-red-500">{errors.caretakerMobile}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="vendor">Vendor (optional)</Label>
            <Select value={vendor || "none"} onValueChange={(v: string) => setVendor(v === "none" ? "" : v)}>
              <SelectTrigger>
                <SelectValue
                  placeholder={
                    vendorsLoading ? "Loading vendors..." : vendorOptions.length ? "Select vendor" : "No vendors found"
                  }
                />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">None</SelectItem>
                {vendorsLoading ? (
                  <SelectItem value="__loading__" disabled>
                    Loading...
                  </SelectItem>
                ) : vendorOptions.length === 0 ? (
                  <SelectItem value="__none__" disabled>
                    No vendors
                  </SelectItem>
                ) : (
                  vendorOptions.map((v) => (
                    <SelectItem key={v.id} value={v.id}>
                      {v.name}
                    </SelectItem>
                  ))
                )}
              </SelectContent>
            </Select>
          </div>

          {/* Map link (optional) */}
          <div className="md:col-span-2 space-y-2">
            <Label htmlFor="mapLink">Map Link (optional)</Label>
            <Input
              id="mapLink"
              value={mapLink}
              onChange={(e) => setMapLink(e.target.value)}
              placeholder="https://maps.google.com/..."
            />
          </div>

          {/* Food checkboxes (optional) */}
          <div className="md:col-span-2 grid grid-cols-2 gap-4">
            <div className="flex items-center space-x-2">
              <Checkbox id="withFood" checked={withFood} onCheckedChange={(v) => setWithFood(Boolean(v))} />
              <Label htmlFor="withFood">With Food</Label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox id="withoutFood" checked={withoutFood} onCheckedChange={(v) => setWithoutFood(Boolean(v))} />
              <Label htmlFor="withoutFood">Without Food</Label>
            </div>
          </div>

          {/* Amenities */}
          <div className="mt-3">
            <Label>Amenities</Label>
            <div className="flex flex-wrap gap-6 mt-2">
              {amenityOptions.map((am) => (
                <label key={am.id} className="flex items-center gap-2">
                  <Checkbox checked={amenities.includes(am.id)} onCheckedChange={() => toggleAmenity(am.id)} />
                  <span className="text-sm">{am.name}</span>
                </label>
              ))}
              {amenityOptions.length === 0 && <div className="text-sm text-gray-500">No amenities found.</div>}
            </div>
          </div>

          <div className="md:col-span-2 space-y-2">
            <Label htmlFor="rules">Rules (comma separated)</Label>
            <Input
              id="rules"
              placeholder="No smoking, No loud music"
              value={rules.join(", ")}
              onChange={(e) => setRules(parseCSV(e.target.value))}
            />
          </div>

          <div className="md:col-span-2 space-y-2">
            <Label htmlFor="description">Description (optional)</Label>
            <Textarea id="description" value={description} onChange={(e) => setDescription(e.target.value)} />
          </div>

          {/* Images */}
          <div className="space-y-2">
            <Label htmlFor="mainImage">Main Image (single)</Label>
            {mainImage ? (
              <div className="flex items-center gap-2">
                <img
                  src={mainImage || "/placeholder.svg"}
                  alt="Main"
                  className="w-20 h-20 object-cover rounded border"
                />
                <Button variant="outline" onClick={() => setMainImage("")}>
                  Remove
                </Button>
              </div>
            ) : (
              <Input id="mainImage" type="file" accept="image/*" onChange={onSelectMainImage} />
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="commonPhotos">Common Photos (multiple)</Label>
            <Input id="commonPhotos" type="file" accept="image/*" multiple onChange={onSelectCommonPhotos} />
            {commonPhotos.length > 0 && (
              <div className="mt-2 grid grid-cols-4 gap-2">
                {commonPhotos.map((url) => (
                  <div key={url} className="relative">
                    <img
                      src={url || "/placeholder.svg"}
                      alt="Common"
                      className="w-full h-20 object-cover rounded border"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      className="mt-1 w-full bg-transparent"
                      onClick={() => removeCommonPhoto(url)}
                    >
                      Remove
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Featured / Package / Deposit */}
          <div className="flex items-center gap-2">
            <Checkbox id="isFeatured" checked={isFeatured} onCheckedChange={(v) => setIsFeatured(Boolean(v))} />
            <Label htmlFor="isFeatured">Featured</Label>
          </div>

          <div className="space-y-2">
            <Label>Package</Label>
            <Select value={packageType || "__none__"} onValueChange={(v) => setPackageType(v)}>
              <SelectTrigger>
                <SelectValue
                  placeholder={
                    packagesLoading
                      ? "Loading packages..."
                      : packageOptions.length
                        ? "Select package"
                        : "No packages found"
                  }
                />
              </SelectTrigger>
              <SelectContent>
                {packagesLoading ? (
                  <SelectItem value="__loading__" disabled>
                    Loading...
                  </SelectItem>
                ) : packageOptions.length === 0 ? (
                  <SelectItem value="__none__" disabled>
                    No packages
                  </SelectItem>
                ) : (
                  packageOptions.map((n) => (
                    <SelectItem key={n} value={n}>
                      {n.slice(0, 1).toUpperCase() + n.slice(1)}
                    </SelectItem>
                  ))
                )}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Deposit Type</Label>
            <Select value={depositType} onValueChange={(v: any) => setDepositType(v)}>
              <SelectTrigger>
                <SelectValue placeholder="Select deposit" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="one_rent">One Rent</SelectItem>
                <SelectItem value="custom">Custom</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {depositType === "custom" && (
            <div className="space-y-2">
              <Label htmlFor="depositAmount">Deposit Amount</Label>
              <Input
                id="depositAmount"
                type="number"
                value={depositAmount}
                onChange={(e) => setDepositAmount(Number(e.target.value || 0))}
              />
            </div>
          )}
        </div>

        <div className="mt-6 flex items-center justify-end gap-3">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button className="bg-black text-white" disabled={submitting} onClick={handleSubmit}>
            {submitting ? "Saving..." : mode === "edit" ? "Update Property" : "Add Property"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
