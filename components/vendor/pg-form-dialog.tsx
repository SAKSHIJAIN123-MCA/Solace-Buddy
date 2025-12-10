"use client"

import type React from "react"

import { useEffect, useMemo, useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { useToast } from "@/hooks/use-toast"

type Props = {
  open: boolean
  onClose: () => void
  onSubmit: (data: any) => Promise<void> | void
  initialData?: any | null
  mode?: "add" | "edit"
}

type Option = { id: string; name: string }

export function PGFormDialog({ open, onClose, onSubmit, initialData, mode = "add" }: Props) {
  const { toast } = useToast()

  // Core fields
  const [name, setName] = useState("")
  const [type, setType] = useState<"Hostel" | "PG" | "Both">("PG")
  const [gender, setGender] = useState<"male" | "female" | "coed">("coed")
  const [pincode, setPincode] = useState("")
  const [contactNumber, setContactNumber] = useState("")
  const [alternateNumber, setAlternateNumber] = useState("")
  const [email, setEmail] = useState("")
  const [nearbyLandmark, setNearbyLandmark] = useState("")
  const [description, setDescription] = useState("")
  const [nearbyPlaces, setNearbyPlaces] = useState("")
  const [pgNickName, setPgNickName] = useState("")
  const [ownerName, setOwnerName] = useState("")
  const [ownerMobile, setOwnerMobile] = useState("")
  const [caretakerName, setCaretakerName] = useState("")
  const [caretakerMobile, setCaretakerMobile] = useState("")
  const [depositType, setDepositType] = useState<"one_rent" | "custom">("one_rent")
  const [depositAmount, setDepositAmount] = useState<number>(0)
  const [pkg, setPkg] = useState("standard")

  // Location
  const [state, setStateVal] = useState("")
  const [city, setCityVal] = useState("")
  const [area, setAreaVal] = useState("")
  const [states, setStates] = useState<Option[]>([])
  const [cities, setCities] = useState<Option[]>([])
  const [areas, setAreas] = useState<Option[]>([])

  // Images
  const [mainImage, setMainImage] = useState<string>("")
  const [commonPhotos, setCommonPhotos] = useState<string[]>([])

  // Amenities
  const [amenities, setAmenities] = useState<string[]>([])
  const [amenityOptions, setAmenityOptions] = useState<{ id: string; name: string }[]>([])

  // Optional
  const [mapLink, setMapLink] = useState<string>("")
  const [withFood, setWithFood] = useState<boolean>(false)
  const [withoutFood, setWithoutFood] = useState<boolean>(false)

  const [errors, setErrors] = useState<Record<string, string>>({})

  useEffect(() => {
    if (open) {
      // Load states
      fetch("/api/locations/states")
        .then((r) => r.json())
        .then((d) => setStates(d?.data || []))
        .catch(() => setStates([]))

      // Load amenities dynamically
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

  // Hydrate initial data (edit mode)
  useEffect(() => {
    if (initialData) {
      setName(initialData.name || "")
      setType(initialData.type || "PG")
      setGender(initialData.gender || "coed")
      setPincode(initialData.pincode || "")
      setContactNumber(initialData.contactNumber || "")
      setAlternateNumber(initialData.alternateNumber || "")
      setEmail(initialData.email || "")
      setNearbyLandmark(initialData.nearbyLandmark || "")
      setDescription(initialData.description || "")
      setNearbyPlaces(initialData.nearbyPlaces || "")
      setPgNickName(initialData.pgNickName || "")
      setOwnerName(initialData.ownerName || "")
      setOwnerMobile(initialData.ownerMobile || "")
      setCaretakerName(initialData.caretakerName || "")
      setCaretakerMobile(initialData.caretakerMobile || "")
      setDepositType(initialData.depositType || "one_rent")
      setDepositAmount(Number(initialData.depositAmount) || 0)
      setPkg(initialData.package || "standard")

      setStateVal(initialData.state || "")
      setCityVal(initialData.city || "")
      setAreaVal(initialData.area || "")

      setMainImage(initialData.mainImage || "")
      setCommonPhotos(Array.isArray(initialData.commonPhotos) ? initialData.commonPhotos : initialData.images || [])

      // amenities can be strings or objects (ids). Normalize to ids/strings.
      const a = Array.isArray(initialData.amenities) ? initialData.amenities : []
      setAmenities(
        a
          .map((it: any) => {
            if (typeof it === "string") return it
            if (it?._id) return it._id
            if (it?.id) return it.id
            return it?.name || ""
          })
          .filter(Boolean),
      )

      setMapLink(initialData.mapLink || "")
      setWithFood(!!initialData.withFood)
      setWithoutFood(!!initialData.withoutFood)
    } else {
      // clear when switching to add
      setName("")
      setType("PG")
      setGender("coed")
      setPincode("")
      setContactNumber("")
      setAlternateNumber("")
      setEmail("")
      setNearbyLandmark("")
      setDescription("")
      setNearbyPlaces("")
      setPgNickName("")
      setOwnerName("")
      setOwnerMobile("")
      setCaretakerName("")
      setCaretakerMobile("")
      setDepositType("one_rent")
      setDepositAmount(0)
      setPkg("standard")
      setStateVal("")
      setCityVal("")
      setAreaVal("")
      setMainImage("")
      setCommonPhotos([])
      setAmenities([])
      setMapLink("")
      setWithFood(false)
      setWithoutFood(false)
    }
    setErrors({})
  }, [initialData])

  // Dependent selects
  useEffect(() => {
    if (!state) {
      setCities([])
      setCityVal("")
      setAreas([])
      setAreaVal("")
      return
    }
    fetch(`/api/locations/cities?state=${encodeURIComponent(state)}`)
      .then((r) => r.json())
      .then((d) => setCities(d?.data || []))
      .catch(() => setCities([]))
    setCityVal("")
    setAreas([])
    setAreaVal("")
  }, [state])

  useEffect(() => {
    if (!state || !city) {
      setAreas([])
      setAreaVal("")
      return
    }
    fetch(`/api/locations/areas?state=${encodeURIComponent(state)}&city=${encodeURIComponent(city)}`)
      .then((r) => r.json())
      .then((d) => setAreas(d?.data || []))
      .catch(() => setAreas([]))
    setAreaVal("")
  }, [state, city])

  async function uploadSingle(file: File): Promise<string | null> {
    const fd = new FormData()
    fd.append("file", file)
    try {
      const res = await fetch("/api/upload", { method: "POST", body: fd })
      const data = await res.json()
      if (data?.success === false) throw new Error(data.error || "Upload failed")
      // Expect either { path } or { url } or { filePath }
      return data.path || data.url || data.filePath || null
    } catch (err) {
      toast({ title: "Upload failed", description: "Could not upload image", variant: "destructive" })
      return null
    }
  }

  async function onMainImageChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    const path = await uploadSingle(file)
    if (path) setMainImage(path.startsWith("/") ? path : `/${path}`)
  }

  async function onCommonPhotosChange(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files || [])
    if (!files.length) return
    const uploaded: string[] = []
    for (const f of files) {
      const path = await uploadSingle(f)
      if (path) uploaded.push(path.startsWith("/") ? path : `/${path}`)
    }
    setCommonPhotos((prev) => Array.from(new Set([...(prev || []), ...uploaded])).slice(0, 8))
  }

  function toggleAmenity(id: string) {
    setAmenities((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]))
  }

  function validateForm(): boolean {
    const newErrors: Record<string, string> = {}

    // Required field validations based on model schema
    if (!name.trim()) {
      newErrors.name = "Property name is required"
    }

    if (!type) {
      newErrors.type = "Property type is required"
    }

    if (!state.trim()) {
      newErrors.state = "State is required"
    }

    if (!city.trim()) {
      newErrors.city = "City is required"
    }

    if (!area.trim()) {
      newErrors.area = "Area is required"
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

    // Optional field format validations
    if (alternateNumber.trim() && !/^[6-9]\d{9}$/.test(alternateNumber)) {
      newErrors.alternateNumber = "Please enter a valid alternate number"
    }

    if (email.trim() && !/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/.test(email)) {
      newErrors.email = "Please enter a valid email"
    }

    if (ownerMobile.trim() && !/^[6-9]\d{9}$/.test(ownerMobile)) {
      newErrors.ownerMobile = "Please enter a valid mobile number"
    }

    if (caretakerMobile.trim() && !/^[6-9]\d{9}$/.test(caretakerMobile)) {
      newErrors.caretakerMobile = "Please enter a valid mobile number"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  async function handleSubmit() {
    if (!validateForm()) {
      toast({
        title: "Validation Error",
        description: "Please fix all errors before submitting",
        variant: "destructive",
      })
      return
    }

    const payload = {
      name: name.trim(),
      type,
      gender,
      city: city.trim(),
      state: state.trim(),
      area: area.trim(),
      pincode: pincode.trim(),
      contactNumber: contactNumber.trim(),
      alternateNumber: alternateNumber.trim() || undefined,
      email: email.trim() || undefined,
      nearbyLandmark: nearbyLandmark.trim() || undefined,
      description: description.trim() || undefined,
      nearbyPlaces: nearbyPlaces.trim() || undefined,
      pgNickName: pgNickName.trim() || undefined,
      ownerName: ownerName.trim() || undefined,
      ownerMobile: ownerMobile.trim() || undefined,
      caretakerName: caretakerName.trim() || undefined,
      caretakerMobile: caretakerMobile.trim() || undefined,
      depositType,
      depositAmount: Number.isFinite(depositAmount) ? depositAmount : 0,
      package: pkg,
      amenities,
      rules: [],

      // Images
      mainImage: mainImage || undefined,
      commonPhotos,

      // Optional new fields
      mapLink: mapLink?.trim() || undefined,
      withFood,
      withoutFood,
    }

    await onSubmit(payload)
  }

  const amenitySelectedSet = useMemo(() => new Set(amenities), [amenities])

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl h-[90vh] overflow-y-auto rounded-xl">
        <DialogHeader>
          <DialogTitle>{mode === "edit" ? "Edit Property" : "Add Property"}</DialogTitle>
          <DialogDescription>
            Fill the property details. Images upload uses server-side multer to save under /public/uploads.
          </DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Left column */}
          <div className="space-y-3">
            <div>
              <Label>
                Name <span className="text-red-500">*</span>
              </Label>
              <Input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Property name"
                className={errors.name ? "border-red-500" : ""}
              />
              {errors.name && <p className="text-sm text-red-500 mt-1">{errors.name}</p>}
            </div>

            <div>
              <Label>
                Type <span className="text-red-500">*</span>
              </Label>
              <Select value={type} onValueChange={(v: any) => setType(v)}>
                <SelectTrigger className={errors.type ? "border-red-500" : ""}>
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="PG">PG</SelectItem>
                  <SelectItem value="Hostel">Hostel</SelectItem>
                  <SelectItem value="Both">Both</SelectItem>
                </SelectContent>
              </Select>
              {errors.type && <p className="text-sm text-red-500 mt-1">{errors.type}</p>}
            </div>

            <div>
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
              {errors.gender && <p className="text-sm text-red-500 mt-1">{errors.gender}</p>}
            </div>

            <div>
              <Label>
                State <span className="text-red-500">*</span>
              </Label>
              <Select value={state} onValueChange={(v: string) => setStateVal(v)}>
                <SelectTrigger className={errors.state ? "border-red-500" : ""}>
                  <SelectValue placeholder="Select state" />
                </SelectTrigger>
                <SelectContent>
                  {states.map((s) => (
                    <SelectItem key={s.id} value={s.name}>
                      {s.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.state && <p className="text-sm text-red-500 mt-1">{errors.state}</p>}
            </div>

            <div>
              <Label>
                City <span className="text-red-500">*</span>
              </Label>
              <Select value={city} onValueChange={(v: string) => setCityVal(v)} disabled={!state}>
                <SelectTrigger className={errors.city ? "border-red-500" : ""}>
                  <SelectValue placeholder="Select city" />
                </SelectTrigger>
                <SelectContent>
                  {cities.map((c) => (
                    <SelectItem key={c.id} value={c.name}>
                      {c.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.city && <p className="text-sm text-red-500 mt-1">{errors.city}</p>}
            </div>

            <div>
              <Label>
                Area <span className="text-red-500">*</span>
              </Label>
              <Select value={area} onValueChange={(v: string) => setAreaVal(v)} disabled={!state || !city}>
                <SelectTrigger className={errors.area ? "border-red-500" : ""}>
                  <SelectValue placeholder="Select area" />
                </SelectTrigger>
                <SelectContent>
                  {areas.map((a) => (
                    <SelectItem key={a.id} value={a.name}>
                      {a.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.area && <p className="text-sm text-red-500 mt-1">{errors.area}</p>}
            </div>

            <div>
              <Label>
                Pincode <span className="text-red-500">*</span>
              </Label>
              <Input
                value={pincode}
                onChange={(e) => setPincode(e.target.value)}
                placeholder="e.g., 560001"
                className={errors.pincode ? "border-red-500" : ""}
              />
              {errors.pincode && <p className="text-sm text-red-500 mt-1">{errors.pincode}</p>}
            </div>

            <div>
              <Label>
                Contact Number <span className="text-red-500">*</span>
              </Label>
              <Input
                value={contactNumber}
                onChange={(e) => setContactNumber(e.target.value)}
                placeholder="Primary contact"
                className={errors.contactNumber ? "border-red-500" : ""}
              />
              {errors.contactNumber && <p className="text-sm text-red-500 mt-1">{errors.contactNumber}</p>}
            </div>

        {/*  <div>
              <Label>Alternate Number</Label>
              <Input
                value={alternateNumber}
                onChange={(e) => setAlternateNumber(e.target.value)}
                placeholder="Optional"
                className={errors.alternateNumber ? "border-red-500" : ""}
              />
              {errors.alternateNumber && <p className="text-sm text-red-500 mt-1">{errors.alternateNumber}</p>}
            </div> */}

         {/*   <div>
              <Label>Email</Label>
              <Input
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Optional"
                className={errors.email ? "border-red-500" : ""}
              />
              {errors.email && <p className="text-sm text-red-500 mt-1">{errors.email}</p>}
            </div> */}

            <div>
              <Label>Nearby Landmark</Label>
              <Input
                value={nearbyLandmark}
                onChange={(e) => setNearbyLandmark(e.target.value)}
                placeholder="Optional"
              />
            </div>
          </div>

          {/* Right column */}
          <div className="space-y-3">
            <div>
              <Label>PG Nickname</Label>
              <Input
                value={pgNickName}
                onChange={(e) => setPgNickName(e.target.value)}
                placeholder="Optional short name"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
             {/* <div>
                <Label>Owner Name</Label>
                <Input value={ownerName} onChange={(e) => setOwnerName(e.target.value)} />
              </div> */}
            {/* <div>
                <Label>Owner Mobile</Label>
                <Input
                  value={ownerMobile}
                  onChange={(e) => setOwnerMobile(e.target.value)}
                  className={errors.ownerMobile ? "border-red-500" : ""}
                />
                {errors.ownerMobile && <p className="text-sm text-red-500 mt-1">{errors.ownerMobile}</p>}
              </div> */}
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Caretaker Name</Label>
                <Input value={caretakerName} onChange={(e) => setCaretakerName(e.target.value)} />
              </div>
              <div>
                <Label>Caretaker Mobile</Label>
                <Input
                  value={caretakerMobile}
                  onChange={(e) => setCaretakerMobile(e.target.value)}
                  className={errors.caretakerMobile ? "border-red-500" : ""}
                />
                {errors.caretakerMobile && <p className="text-sm text-red-500 mt-1">{errors.caretakerMobile}</p>}
              </div>
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

            <div>
              <Label>PG/Hostel Address</Label>
              <Textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Optional" />
            </div>

            <div>
              <Label>Nearby Places</Label>
              <Textarea value={nearbyPlaces} onChange={(e) => setNearbyPlaces(e.target.value)} placeholder="Optional" />
            </div>
          </div>
        </div>

        {/* Amenities */}
        <div className="mt-2">
          <Label>Amenities</Label>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-2 mt-2">
            {amenityOptions.map((am) => (
              <label key={am.id} className="flex items-center gap-2">
                <Checkbox checked={amenitySelectedSet.has(am.id)} onCheckedChange={() => toggleAmenity(am.id)} />
                <span className="text-sm">{am.name}</span>
              </label>
            ))}
            {amenityOptions.length === 0 && <div className="text-sm text-gray-500">No amenities found.</div>}
          </div>
        </div>

        {/* Map link + Food options */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mt-2">
          <div className="md:col-span-2">
            <Label>Map Link (optional)</Label>
            <Input value={mapLink} onChange={(e) => setMapLink(e.target.value)} placeholder="Paste Google Maps link" />
          </div>
          <div className="flex items-end gap-4">
            <label className="flex items-center gap-2">
              <Checkbox checked={withFood} onCheckedChange={(v) => setWithFood(Boolean(v))} />
              <span className="text-sm">With Food</span>
            </label>
            <label className="flex items-center gap-2">
              <Checkbox checked={withoutFood} onCheckedChange={(v) => setWithoutFood(Boolean(v))} />
              <span className="text-sm">Without Food</span>
            </label>
          </div>
        </div>

        {/* Images */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
          <div>
            <Label>Cover Image (single)</Label>
            <Input type="file" accept="image/*" onChange={onMainImageChange} />
            {mainImage ? (
              <img
                src={mainImage || "/placeholder.svg"}
                alt="Main"
                className="mt-2 h-24 w-24 object-cover rounded border"
              />
            ) : null}
          </div>
          <div>
            <Label>Other Images (multiple)</Label>
            <Input type="file" accept="image/*" multiple onChange={onCommonPhotosChange} />
            {commonPhotos?.length ? (
              <div className="mt-2 grid grid-cols-5 gap-2">
                {commonPhotos.map((p) => (
                  <img
                    key={p}
                    src={p || "/placeholder.svg"}
                    alt="Common"
                    className="h-16 w-16 object-cover rounded border"
                  />
                ))}
              </div>
            ) : null}
          </div>
        </div>

        <div className="mt-4 flex justify-end gap-2">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button className="bg-black text-white" onClick={handleSubmit}>
            {mode === "edit" ? "Update Property" : "Add Property"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
