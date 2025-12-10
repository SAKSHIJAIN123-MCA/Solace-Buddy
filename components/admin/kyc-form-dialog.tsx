"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { toast } from "sonner"
import { Loader2, ChevronLeft, ChevronRight, Upload, X } from "lucide-react"
import Image from "next/image"

interface Student {
  _id: string
  name: string
  email: string
  phone: string
  college: string
  course: string
  year: string
}

interface KYCRecord {
  _id: string
  studentId: string
  name: string
  mobileNumber: string
  email: string
  permanentAddress: string
  dateOfBirth: string
  caste: string
  maritalStatus: string
  passportSizePhoto: string
  nativeCity: string
  nativeState: string
  aadharCardFront: string
  aadharCardBack: string
  residentialProof: string
  profession: string
  collegeCompanyName: string
  collegeCompanyAddress: string
  studyingWorkingSince: string
  proofOfLocation: string
  fatherName: string
  fatherMobileNumber: string
  criminalHistory: string
  criminalHistoryDetails: string
  agreeToRules: boolean
  agreeToVerification: boolean
  agreeLockInPeriod: boolean
  pgStartDate: string
  agreeTermsConditions: boolean
  currentStep: number
  isCompleted: boolean
}

interface KYCFormDialogProps {
  open: boolean
  onClose: (refresh?: boolean) => void
  editingRecord?: KYCRecord | null
}

export function KYCFormDialog({ open, onClose, editingRecord }: KYCFormDialogProps) {
  const [students, setStudents] = useState<Student[]>([])
  const [loading, setLoading] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [currentStep, setCurrentStep] = useState(1)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const totalSteps = 4

  const [formData, setFormData] = useState({
    studentId: "",
    name: "",
    mobileNumber: "",
    email: "",
    permanentAddress: "",
    dateOfBirth: "",
    caste: "",
    maritalStatus: "",
    passportSizePhoto: "",
    nativeCity: "",
    nativeState: "",
    aadharCardFront: "",
    aadharCardBack: "",
    residentialProof: "",
    profession: "",
    collegeCompanyName: "",
    collegeCompanyAddress: "",
    studyingWorkingSince: "",
    proofOfLocation: "",
    fatherName: "",
    fatherMobileNumber: "",
    criminalHistory: "No",
    criminalHistoryDetails: "",
    agreeToRules: false,
    agreeToVerification: false,
    agreeLockInPeriod: false,
    pgStartDate: "",
    agreeTermsConditions: false,
  })

  useEffect(() => {
    if (open) {
      fetchStudents()
      if (editingRecord) {
        setFormData({
          studentId: editingRecord.studentId,
          name: editingRecord.name || "",
          mobileNumber: editingRecord.mobileNumber || "",
          email: editingRecord.email || "",
          permanentAddress: editingRecord.permanentAddress || "",
          dateOfBirth: editingRecord.dateOfBirth ? editingRecord.dateOfBirth.split("T")[0] : "",
          caste: editingRecord.caste || "",
          maritalStatus: editingRecord.maritalStatus || "",
          passportSizePhoto: editingRecord.passportSizePhoto || "",
          nativeCity: editingRecord.nativeCity || "",
          nativeState: editingRecord.nativeState || "",
          aadharCardFront: editingRecord.aadharCardFront || "",
          aadharCardBack: editingRecord.aadharCardBack || "",
          residentialProof: editingRecord.residentialProof || "",
          profession: editingRecord.profession || "",
          collegeCompanyName: editingRecord.collegeCompanyName || "",
          collegeCompanyAddress: editingRecord.collegeCompanyAddress || "",
          studyingWorkingSince: editingRecord.studyingWorkingSince
            ? editingRecord.studyingWorkingSince.split("T")[0]
            : "",
          proofOfLocation: editingRecord.proofOfLocation || "",
          fatherName: editingRecord.fatherName || "",
          fatherMobileNumber: editingRecord.fatherMobileNumber || "",
          criminalHistory: editingRecord.criminalHistory || "No",
          criminalHistoryDetails: editingRecord.criminalHistoryDetails || "",
          agreeToRules: editingRecord.agreeToRules ?? false,
          agreeToVerification: editingRecord.agreeToVerification ?? false,
          agreeLockInPeriod: editingRecord.agreeLockInPeriod ?? false,
          pgStartDate: editingRecord.pgStartDate ? editingRecord.pgStartDate.split("T")[0] : "",
          agreeTermsConditions: editingRecord.agreeTermsConditions ?? false,
        })
        setCurrentStep(1)
      } else {
        resetForm()
      }
    }
  }, [open, editingRecord])

  const fetchStudents = async () => {
    try {
      const response = await fetch("/api/admin/students")
      if (response.ok) {
        const data = await response.json()
        setStudents(data.students || [])
      }
    } catch (error) {
      console.error("Error fetching students:", error)
    }
  }

  const resetForm = () => {
    setFormData({
      studentId: "",
      name: "",
      mobileNumber: "",
      email: "",
      permanentAddress: "",
      dateOfBirth: "",
      caste: "",
      maritalStatus: "",
      passportSizePhoto: "",
      nativeCity: "",
      nativeState: "",
      aadharCardFront: "",
      aadharCardBack: "",
      residentialProof: "",
      profession: "",
      collegeCompanyName: "",
      collegeCompanyAddress: "",
      studyingWorkingSince: "",
      proofOfLocation: "",
      fatherName: "",
      fatherMobileNumber: "",
      criminalHistory: "No",
      criminalHistoryDetails: "",
      agreeToRules: false,
      agreeToVerification: false,
      agreeLockInPeriod: false,
      pgStartDate: "",
      agreeTermsConditions: false,
    })
    setCurrentStep(1)
    setErrors({})
  }

  const handleInputChange = (field: string, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }))
    }
  }

  const handleFileUpload = async (field: string, event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    setUploading(true)
    try {
      const formDataObj = new FormData()
      formDataObj.append("file", file)

      const response = await fetch("/api/admin/kyc/upload", {
        method: "POST",
        body: formDataObj,
      })

      if (response.ok) {
        const data = await response.json()
        handleInputChange(field, data.url)
        toast.success("File uploaded successfully")
      } else {
        const error = await response.json()
        toast.error(error.error || "Upload failed")
      }
    } catch (error) {
      console.error("Error uploading file:", error)
      toast.error("Upload failed")
    } finally {
      setUploading(false)
    }
  }

  const renderImagePreview = (url: string, field: string) => {
    if (!url) return null

    return (
      <div className="relative w-20 h-20 mt-2">
        <Image src={url || "/placeholder.svg"} alt={field} fill className="object-cover rounded border" />
        <button
          type="button"
          onClick={() => handleInputChange(field, "")}
          className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
        >
          <X className="w-3 h-3" />
        </button>
      </div>
    )
  }

  const validateStep = (step: number): boolean => {
    const newErrors: Record<string, string> = {}

    switch (step) {
      case 1:
        if (!editingRecord && !formData.studentId) {
          newErrors.studentId = "Please select a student"
        }
        if (!formData.name) newErrors.name = "Name is required"
        if (!formData.mobileNumber || formData.mobileNumber.length !== 10) {
          newErrors.mobileNumber = "Mobile number must be exactly 10 digits"
        }
        if (!formData.email) newErrors.email = "Email is required"
        if (!formData.dateOfBirth) newErrors.dateOfBirth = "Date of birth is required"
        if (!formData.caste) newErrors.caste = "Caste is required"
        if (!formData.maritalStatus) newErrors.maritalStatus = "Marital status is required"
        if (!formData.passportSizePhoto) newErrors.passportSizePhoto = "Passport photo is required"
        if (!formData.nativeCity) newErrors.nativeCity = "Native city is required"
        if (!formData.nativeState) newErrors.nativeState = "Native state is required"
        if (!formData.permanentAddress) newErrors.permanentAddress = "Permanent address is required"
        if (!formData.aadharCardFront) newErrors.aadharCardFront = "Aadhar card front is required"
        if (!formData.aadharCardBack) newErrors.aadharCardBack = "Aadhar card back is required"
        if (!formData.residentialProof) newErrors.residentialProof = "Residential proof is required"
        break

      case 2:
        if (!formData.profession) newErrors.profession = "Profession is required"
        if (!formData.collegeCompanyName) newErrors.collegeCompanyName = "College/Company name is required"
        if (!formData.collegeCompanyAddress) newErrors.collegeCompanyAddress = "Address is required"
        if (!formData.studyingWorkingSince) newErrors.studyingWorkingSince = "Date is required"
        if (!formData.proofOfLocation) newErrors.proofOfLocation = "Proof of location is required"
        break

      case 3:
        if (!formData.fatherName) newErrors.fatherName = "Father's name is required"
        if (!formData.fatherMobileNumber || formData.fatherMobileNumber.length !== 10) {
          newErrors.fatherMobileNumber = "Father's mobile number must be exactly 10 digits"
        }
        break

      case 4:
        if (
          !formData.agreeToRules ||
          !formData.agreeToVerification ||
          !formData.agreeLockInPeriod ||
          !formData.agreeTermsConditions
        ) {
          newErrors.terms = "Please accept all terms and conditions"
        }
        if (!formData.pgStartDate) newErrors.pgStartDate = "PG start date is required"
        break
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleNext = () => {
    if (!validateStep(currentStep)) return
    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1)
    }
  }

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateStep(currentStep)) return

    setLoading(true)
    try {
      const url = editingRecord ? `/api/admin/kyc/${editingRecord._id}` : "/api/admin/kyc"
      const method = editingRecord ? "PUT" : "POST"

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          currentStep: totalSteps,
          isCompleted: true,
        }),
      })

      if (response.ok) {
        toast.success(editingRecord ? "KYC updated successfully" : "KYC created successfully")
        onClose(true)
      } else {
        const data = await response.json()
        toast.error(data.error || "Failed to save KYC")
      }
    } catch (error) {
      console.error("Error saving KYC:", error)
      toast.error("Error saving KYC")
    } finally {
      setLoading(false)
    }
  }

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Personal Details</h3>

            {!editingRecord && (
              <div>
                <Label htmlFor="studentId">
                  Select Student <span className="text-red-500">*</span>
                </Label>
                <Select value={formData.studentId} onValueChange={(value) => handleInputChange("studentId", value)}>
                  <SelectTrigger className={errors.studentId ? "border-red-500" : ""}>
                    <SelectValue placeholder="Select a student" />
                  </SelectTrigger>
                  <SelectContent>
                    {students.map((student) => (
                      <SelectItem key={student._id} value={student._id}>
                        {student.name} - {student.email}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.studentId && <p className="text-sm text-red-500 mt-1">{errors.studentId}</p>}
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="name">
                  Name <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => handleInputChange("name", e.target.value)}
                  className={errors.name ? "border-red-500" : ""}
                />
                {errors.name && <p className="text-sm text-red-500 mt-1">{errors.name}</p>}
              </div>
              <div>
                <Label htmlFor="mobile">
                  Mobile Number <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="mobile"
                  type="tel"
                  maxLength={10}
                  value={formData.mobileNumber}
                  onChange={(e) => handleInputChange("mobileNumber", e.target.value)}
                  className={errors.mobileNumber ? "border-red-500" : ""}
                />
                {errors.mobileNumber && <p className="text-sm text-red-500 mt-1">{errors.mobileNumber}</p>}
              </div>
              <div>
                <Label htmlFor="email">
                  Email Address <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleInputChange("email", e.target.value)}
                  className={errors.email ? "border-red-500" : ""}
                />
                {errors.email && <p className="text-sm text-red-500 mt-1">{errors.email}</p>}
              </div>
              <div>
                <Label htmlFor="dob">
                  Date of Birth <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="dob"
                  type="date"
                  value={formData.dateOfBirth}
                  onChange={(e) => handleInputChange("dateOfBirth", e.target.value)}
                  className={errors.dateOfBirth ? "border-red-500" : ""}
                />
                {errors.dateOfBirth && <p className="text-sm text-red-500 mt-1">{errors.dateOfBirth}</p>}
              </div>
              <div>
                <Label htmlFor="caste">
                  Caste <span className="text-red-500">*</span>
                </Label>
                <Select value={formData.caste} onValueChange={(value) => handleInputChange("caste", value)}>
                  <SelectTrigger className={errors.caste ? "border-red-500" : ""}>
                    <SelectValue placeholder="Select caste" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Hindu">Hindu</SelectItem>
                    <SelectItem value="Muslim">Muslim</SelectItem>
                    <SelectItem value="Other">Other</SelectItem>
                  </SelectContent>
                </Select>
                {errors.caste && <p className="text-sm text-red-500 mt-1">{errors.caste}</p>}
              </div>
              <div>
                <Label htmlFor="marital">
                  Marital Status <span className="text-red-500">*</span>
                </Label>
                <Select
                  value={formData.maritalStatus}
                  onValueChange={(value) => handleInputChange("maritalStatus", value)}
                >
                  <SelectTrigger className={errors.maritalStatus ? "border-red-500" : ""}>
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Married">Married</SelectItem>
                    <SelectItem value="Unmarried">Unmarried</SelectItem>
                  </SelectContent>
                </Select>
                {errors.maritalStatus && <p className="text-sm text-red-500 mt-1">{errors.maritalStatus}</p>}
              </div>
              <div>
                <Label htmlFor="nativeCity">
                  Native City <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="nativeCity"
                  value={formData.nativeCity}
                  onChange={(e) => handleInputChange("nativeCity", e.target.value)}
                  className={errors.nativeCity ? "border-red-500" : ""}
                />
                {errors.nativeCity && <p className="text-sm text-red-500 mt-1">{errors.nativeCity}</p>}
              </div>
              <div>
                <Label htmlFor="nativeState">
                  Native State <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="nativeState"
                  value={formData.nativeState}
                  onChange={(e) => handleInputChange("nativeState", e.target.value)}
                  className={errors.nativeState ? "border-red-500" : ""}
                />
                {errors.nativeState && <p className="text-sm text-red-500 mt-1">{errors.nativeState}</p>}
              </div>
            </div>
            <div>
              <Label htmlFor="address">
                Permanent Address <span className="text-red-500">*</span>
              </Label>
              <Textarea
                id="address"
                value={formData.permanentAddress}
                onChange={(e) => handleInputChange("permanentAddress", e.target.value)}
                className={errors.permanentAddress ? "border-red-500" : ""}
              />
              {errors.permanentAddress && <p className="text-sm text-red-500 mt-1">{errors.permanentAddress}</p>}
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label>
                  Passport Size Photo <span className="text-red-500">*</span>
                </Label>
                <div className="relative">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleFileUpload("passportSizePhoto", e)}
                    disabled={uploading}
                    className="hidden"
                    id="passport-upload"
                  />
                  <label htmlFor="passport-upload" className="block">
                    <Button
                      type="button"
                      variant="outline"
                      className="w-full bg-transparent"
                      onClick={() => document.getElementById("passport-upload")?.click()}
                      disabled={uploading}
                    >
                      <Upload className="w-4 h-4 mr-2" />
                      {uploading ? "Uploading..." : formData.passportSizePhoto ? "Change Photo" : "Upload Photo"}
                    </Button>
                  </label>
                </div>
                {renderImagePreview(formData.passportSizePhoto, "passportSizePhoto")}
                {errors.passportSizePhoto && <p className="text-sm text-red-500 mt-1">{errors.passportSizePhoto}</p>}
              </div>
              <div>
                <Label>
                  Aadhar Card - Front <span className="text-red-500">*</span>
                </Label>
                <div className="relative">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleFileUpload("aadharCardFront", e)}
                    disabled={uploading}
                    className="hidden"
                    id="aadhar-front-upload"
                  />
                  <label htmlFor="aadhar-front-upload" className="block">
                    <Button
                      type="button"
                      variant="outline"
                      className="w-full bg-transparent"
                      onClick={() => document.getElementById("aadhar-front-upload")?.click()}
                      disabled={uploading}
                    >
                      <Upload className="w-4 h-4 mr-2" />
                      {uploading ? "Uploading..." : formData.aadharCardFront ? "Change File" : "Upload File"}
                    </Button>
                  </label>
                </div>
                {renderImagePreview(formData.aadharCardFront, "aadharCardFront")}
                {errors.aadharCardFront && <p className="text-sm text-red-500 mt-1">{errors.aadharCardFront}</p>}
              </div>
              <div>
                <Label>
                  Aadhar Card - Back <span className="text-red-500">*</span>
                </Label>
                <div className="relative">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleFileUpload("aadharCardBack", e)}
                    disabled={uploading}
                    className="hidden"
                    id="aadhar-back-upload"
                  />
                  <label htmlFor="aadhar-back-upload" className="block">
                    <Button
                      type="button"
                      variant="outline"
                      className="w-full bg-transparent"
                      onClick={() => document.getElementById("aadhar-back-upload")?.click()}
                      disabled={uploading}
                    >
                      <Upload className="w-4 h-4 mr-2" />
                      {uploading ? "Uploading..." : formData.aadharCardBack ? "Change File" : "Upload File"}
                    </Button>
                  </label>
                </div>
                {renderImagePreview(formData.aadharCardBack, "aadharCardBack")}
                {errors.aadharCardBack && <p className="text-sm text-red-500 mt-1">{errors.aadharCardBack}</p>}
              </div>
              <div>
                <Label>
                  Residential Proof <span className="text-red-500">*</span>
                </Label>
                <div className="relative">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleFileUpload("residentialProof", e)}
                    disabled={uploading}
                    className="hidden"
                    id="residential-upload"
                  />
                  <label htmlFor="residential-upload" className="block">
                    <Button
                      type="button"
                      variant="outline"
                      className="w-full bg-transparent"
                      onClick={() => document.getElementById("residential-upload")?.click()}
                      disabled={uploading}
                    >
                      <Upload className="w-4 h-4 mr-2" />
                      {uploading ? "Uploading..." : formData.residentialProof ? "Change File" : "Upload File"}
                    </Button>
                  </label>
                </div>
                {renderImagePreview(formData.residentialProof, "residentialProof")}
                {errors.residentialProof && <p className="text-sm text-red-500 mt-1">{errors.residentialProof}</p>}
              </div>
            </div>
          </div>
        )

      case 2:
        return (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Profession Related Details</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="profession">
                  Profession <span className="text-red-500">*</span>
                </Label>
                <Select value={formData.profession} onValueChange={(value) => handleInputChange("profession", value)}>
                  <SelectTrigger className={errors.profession ? "border-red-500" : ""}>
                    <SelectValue placeholder="Select profession" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Student">Student</SelectItem>
                    <SelectItem value="Working">Working</SelectItem>
                    <SelectItem value="Other">Other</SelectItem>
                  </SelectContent>
                </Select>
                {errors.profession && <p className="text-sm text-red-500 mt-1">{errors.profession}</p>}
              </div>
              <div>
                <Label htmlFor="collegeName">
                  College / Company Name <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="collegeName"
                  value={formData.collegeCompanyName}
                  onChange={(e) => handleInputChange("collegeCompanyName", e.target.value)}
                  className={errors.collegeCompanyName ? "border-red-500" : ""}
                />
                {errors.collegeCompanyName && <p className="text-sm text-red-500 mt-1">{errors.collegeCompanyName}</p>}
              </div>
              <div>
                <Label htmlFor="workingSince">
                  Studying / Working Since <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="workingSince"
                  type="date"
                  value={formData.studyingWorkingSince}
                  onChange={(e) => handleInputChange("studyingWorkingSince", e.target.value)}
                  className={errors.studyingWorkingSince ? "border-red-500" : ""}
                />
                {errors.studyingWorkingSince && (
                  <p className="text-sm text-red-500 mt-1">{errors.studyingWorkingSince}</p>
                )}
              </div>
            </div>
            <div>
              <Label htmlFor="collegeAddress">
                Address of College / Company <span className="text-red-500">*</span>
              </Label>
              <Textarea
                id="collegeAddress"
                value={formData.collegeCompanyAddress}
                onChange={(e) => handleInputChange("collegeCompanyAddress", e.target.value)}
                className={errors.collegeCompanyAddress ? "border-red-500" : ""}
              />
              {errors.collegeCompanyAddress && (
                <p className="text-sm text-red-500 mt-1">{errors.collegeCompanyAddress}</p>
              )}
            </div>
            <div>
              <Label>
                Proof of Working Location / College <span className="text-red-500">*</span>
              </Label>
              <div className="relative">
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleFileUpload("proofOfLocation", e)}
                  disabled={uploading}
                  className="hidden"
                  id="proof-upload"
                />
                <label htmlFor="proof-upload" className="block">
                  <Button
                    type="button"
                    variant="outline"
                    className="w-full bg-transparent"
                    onClick={() => document.getElementById("proof-upload")?.click()}
                    disabled={uploading}
                  >
                    <Upload className="w-4 h-4 mr-2" />
                    {uploading ? "Uploading..." : formData.proofOfLocation ? "Change File" : "Upload File"}
                  </Button>
                </label>
              </div>
              {renderImagePreview(formData.proofOfLocation, "proofOfLocation")}
              {errors.proofOfLocation && <p className="text-sm text-red-500 mt-1">{errors.proofOfLocation}</p>}
            </div>
          </div>
        )

      case 3:
        return (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Family Background</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="fatherName">
                  Father's Name <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="fatherName"
                  value={formData.fatherName}
                  onChange={(e) => handleInputChange("fatherName", e.target.value)}
                  className={errors.fatherName ? "border-red-500" : ""}
                />
                {errors.fatherName && <p className="text-sm text-red-500 mt-1">{errors.fatherName}</p>}
              </div>
              <div>
                <Label htmlFor="fatherMobile">
                  Father's Mobile Number <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="fatherMobile"
                  type="tel"
                  maxLength={10}
                  value={formData.fatherMobileNumber}
                  onChange={(e) => handleInputChange("fatherMobileNumber", e.target.value)}
                  className={errors.fatherMobileNumber ? "border-red-500" : ""}
                />
                {errors.fatherMobileNumber && <p className="text-sm text-red-500 mt-1">{errors.fatherMobileNumber}</p>}
              </div>
            </div>
          </div>
        )

      case 4:
        return (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Self Declaration</h3>
            <div>
              <Label htmlFor="criminalHistory">
                Criminal History / Any Pending Court Proceeding <span className="text-red-500">*</span>
              </Label>
              <Select
                value={formData.criminalHistory}
                onValueChange={(value) => handleInputChange("criminalHistory", value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select option" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="No">No</SelectItem>
                  <SelectItem value="Yes">Yes</SelectItem>
                </SelectContent>
              </Select>
            </div>
            {formData.criminalHistory === "Yes" && (
              <div>
                <Label htmlFor="criminalDetails">Provide Details</Label>
                <Textarea
                  id="criminalDetails"
                  value={formData.criminalHistoryDetails}
                  onChange={(e) => handleInputChange("criminalHistoryDetails", e.target.value)}
                />
              </div>
            )}
            <div>
              <Label htmlFor="pgStartDate">
                Your PG Stay will be started on <span className="text-red-500">*</span>
              </Label>
              <Input
                id="pgStartDate"
                type="date"
                value={formData.pgStartDate}
                onChange={(e) => handleInputChange("pgStartDate", e.target.value)}
                className={errors.pgStartDate ? "border-red-500" : ""}
              />
              {errors.pgStartDate && <p className="text-sm text-red-500 mt-1">{errors.pgStartDate}</p>}
            </div>
            <div className="space-y-3">
              <div className="flex items-start space-x-2">
                <Checkbox
                  id="agreeRules"
                  checked={formData.agreeToRules}
                  onCheckedChange={(checked) => handleInputChange("agreeToRules", checked)}
                />
                <Label htmlFor="agreeRules" className="text-sm leading-relaxed font-normal">
                  I'm aware that Non-veg, Egg, Alcohol Consumption, Spitting and Chewing Tobacco are not allowed in
                  Premises. If found then may lead to termination. <span className="text-red-500">*</span>
                </Label>
              </div>
              <div className="flex items-start space-x-2">
                <Checkbox
                  id="agreeVerification"
                  checked={formData.agreeToVerification}
                  onCheckedChange={(checked) => handleInputChange("agreeToVerification", checked)}
                />
                <Label htmlFor="agreeVerification" className="text-sm leading-relaxed font-normal">
                  While on-boarding you have to co-operate with Rent Agreement and Local Police Verifications along with
                  AADHAR KYC. <span className="text-red-500">*</span>
                </Label>
              </div>
              <div className="flex items-start space-x-2">
                <Checkbox
                  id="agreeLockIn"
                  checked={formData.agreeLockInPeriod}
                  onCheckedChange={(checked) => handleInputChange("agreeLockInPeriod", checked)}
                />
                <Label htmlFor="agreeLockIn" className="text-sm leading-relaxed font-normal">
                  I'm aware that there is 3 months lock-in period and 1 month of notice period for quitting the stay.
                  <span className="text-red-500">*</span>
                </Label>
              </div>
              <div className="flex items-start space-x-2">
                <Checkbox
                  id="agreeTerms"
                  checked={formData.agreeTermsConditions}
                  onCheckedChange={(checked) => handleInputChange("agreeTermsConditions", checked)}
                />
                <Label htmlFor="agreeTerms" className="text-sm leading-relaxed font-normal">
                  Read all Terms and Conditions{" "}
                  <a href="/Terms" className="text-blue-600 underline">
                    Here
                  </a>
                  <span className="text-red-500">*</span>
                </Label>
              </div>
            </div>
            {errors.terms && <p className="text-sm text-red-500 mt-2">{errors.terms}</p>}
          </div>
        )

      default:
        return null
    }
  }

  return (
    <Dialog open={open} onOpenChange={() => onClose()}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle>
              {editingRecord ? "Edit KYC" : "Add KYC"} - Step {currentStep} of {totalSteps}
            </DialogTitle>
            <div className="flex space-x-1">
              {Array.from({ length: totalSteps }, (_, i) => (
                <div
                  key={i}
                  className={`w-3 h-3 rounded-full ${i + 1 <= currentStep ? "bg-blue-600" : "bg-gray-200"}`}
                />
              ))}
            </div>
          </div>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {renderStepContent()}

          <div className="flex justify-between pt-4 border-t">
            <Button type="button" variant="outline" onClick={handlePrevious} disabled={currentStep === 1}>
              <ChevronLeft className="w-4 h-4 mr-2" />
              Previous
            </Button>

            <div className="flex gap-2">
              <Button type="button" variant="outline" onClick={() => onClose()} disabled={loading || uploading}>
                Cancel
              </Button>
              {currentStep < totalSteps ? (
                <Button type="button" onClick={handleNext} disabled={uploading}>
                  Next
                  <ChevronRight className="w-4 h-4 ml-2" />
                </Button>
              ) : (
                <Button type="submit" disabled={loading || uploading}>
                  {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                  {editingRecord ? "Update KYC" : "Create KYC"}
                </Button>
              )}
            </div>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
