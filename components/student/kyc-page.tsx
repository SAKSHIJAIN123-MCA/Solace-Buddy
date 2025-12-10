"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ChevronLeft, ChevronRight, Upload, CheckCircle, Loader2, X } from "lucide-react"
import { toast } from "sonner"
import Image from "next/image"

interface KYCData {
  // Step 1: Personal Details
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

  // Step 2: Profession Related Details
  profession: string
  collegeCompanyName: string
  collegeCompanyAddress: string
  studyingWorkingSince: string
  proofOfLocation: string

  // Step 3: Family Background
  fatherName: string
  fatherMobileNumber: string

  // Step 4: Self Declaration
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

const initialData: KYCData = {
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
  criminalHistory: "",
  criminalHistoryDetails: "",
  agreeToRules: false,
  agreeToVerification: false,
  agreeLockInPeriod: false,
  pgStartDate: "",
  agreeTermsConditions: false,
  currentStep: 1,
  isCompleted: false,
}

export default function KYCDetailsPage() {
  const [currentStep, setCurrentStep] = useState(1)
  const [kycData, setKycData] = useState<KYCData>(initialData)
  const [loading, setLoading] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [uploadingField, setUploadingField] = useState<string | null>(null)

  const totalSteps = 4

  useEffect(() => {
    fetchKYCData()
  }, [])

  const fetchKYCData = async () => {
    try {
      const response = await fetch("/api/student/kyc")
      if (response.ok) {
        const data = await response.json()
        if (data.kyc) {
          setKycData(data.kyc)
          setCurrentStep(data.kyc.currentStep || 1)
          setIsEditing(true)
        }
      }
    } catch (error) {
      console.error("Error fetching KYC data:", error)
    }
  }

  const handleInputChange = (field: keyof KYCData, value: any) => {
    setKycData((prev) => ({ ...prev, [field]: value }))
  }

  const handleFileUpload = async (field: keyof KYCData) => {
    const input = document.createElement("input")
    input.type = "file"
    input.accept = "image/*"
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0]
      if (!file) return

      // Validate file size
      if (file.size > 5 * 1024 * 1024) {
        toast.error("File size must be less than 5MB")
        return
      }

      setUploadingField(field)
      try {
        const formData = new FormData()
        formData.append("file", file)

        const response = await fetch("/api/student/kyc/upload", {
          method: "POST",
          body: formData,
        })

        if (!response.ok) {
          const error = await response.json()
          toast.error(error.error || "Upload failed")
          return
        }

        const data = await response.json()
        handleInputChange(field, data.url)
        toast.success("File uploaded successfully")
      } catch (error) {
        console.error("Upload error:", error)
        toast.error("Failed to upload file")
      } finally {
        setUploadingField(null)
      }
    }
    input.click()
  }

  const validateStep = (step: number): boolean => {
    switch (step) {
      case 1:
        if (!kycData.name?.trim()) {
          toast.error("Name is required")
          return false
        }
        if (!kycData.mobileNumber || kycData.mobileNumber.length !== 10) {
          toast.error("Mobile number must be exactly 10 digits")
          return false
        }
        if (!kycData.email?.includes("@")) {
          toast.error("Valid email is required")
          return false
        }
        if (!kycData.permanentAddress?.trim()) {
          toast.error("Permanent address is required")
          return false
        }
        if (!kycData.dateOfBirth) {
          toast.error("Date of birth is required")
          return false
        }
        if (!kycData.caste) {
          toast.error("Caste is required")
          return false
        }
        if (!kycData.maritalStatus) {
          toast.error("Marital status is required")
          return false
        }
        if (!kycData.passportSizePhoto) {
          toast.error("Passport size photo is required")
          return false
        }
        if (!kycData.aadharCardFront) {
          toast.error("Aadhar card front is required")
          return false
        }
        if (!kycData.aadharCardBack) {
          toast.error("Aadhar card back is required")
          return false
        }
        if (!kycData.residentialProof) {
          toast.error("Residential proof is required")
          return false
        }
        if (!kycData.nativeCity?.trim()) {
          toast.error("Native city is required")
          return false
        }
        if (!kycData.nativeState?.trim()) {
          toast.error("Native state is required")
          return false
        }
        return true

      case 2:
        if (!kycData.profession) {
          toast.error("Profession is required")
          return false
        }
        if (!kycData.collegeCompanyName?.trim()) {
          toast.error("College/Company name is required")
          return false
        }
        if (!kycData.collegeCompanyAddress?.trim()) {
          toast.error("College/Company address is required")
          return false
        }
        if (!kycData.studyingWorkingSince) {
          toast.error("Studying/Working since date is required")
          return false
        }
        if (!kycData.proofOfLocation) {
          toast.error("Proof of location is required")
          return false
        }
        return true

      case 3:
        if (!kycData.fatherName?.trim()) {
          toast.error("Father's name is required")
          return false
        }
        if (!kycData.fatherMobileNumber || kycData.fatherMobileNumber.length !== 10) {
          toast.error("Father's mobile number must be exactly 10 digits")
          return false
        }
        return true

      case 4:
        if (!kycData.criminalHistory) {
          toast.error("Criminal history declaration is required")
          return false
        }
        if (!kycData.pgStartDate) {
          toast.error("PG start date is required")
          return false
        }
        if (
          !kycData.agreeToRules ||
          !kycData.agreeToVerification ||
          !kycData.agreeLockInPeriod ||
          !kycData.agreeTermsConditions
        ) {
          toast.error("Please accept all terms and conditions")
          return false
        }
        return true

      default:
        return true
    }
  }

  const handleNext = async () => {
    if (!validateStep(currentStep)) return

    setLoading(true)
    try {
      const response = await fetch("/api/student/kyc", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...kycData, currentStep }),
      })

      if (response.ok) {
        if (currentStep < totalSteps) {
          setCurrentStep(currentStep + 1)
          setKycData((prev) => ({ ...prev, currentStep: currentStep + 1 }))
        }
        toast.success("Step saved successfully")
      } else {
        const error = await response.json()
        toast.error(error.error || "Failed to save step")
      }
    } catch (error) {
      toast.error("Error saving step")
    } finally {
      setLoading(false)
    }
  }

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1)
    }
  }

  const handleSubmit = async () => {
    if (!validateStep(totalSteps)) return

    setLoading(true)
    try {
      const response = await fetch("/api/student/kyc", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...kycData, currentStep: totalSteps, isCompleted: true }),
      })

      if (response.ok) {
        setKycData((prev) => ({ ...prev, isCompleted: true }))
        toast.success("KYC submitted successfully!")
      } else {
        const error = await response.json()
        toast.error(error.error || "Failed to submit KYC")
      }
    } catch (error) {
      toast.error("Error submitting KYC")
    } finally {
      setLoading(false)
    }
  }

  const renderImagePreview = (fieldName: keyof KYCData, label: string) => {
    const imageUrl = kycData[fieldName] as string
    if (!imageUrl) return null

    return (
      <div className="relative mt-2 group">
        <div className="relative w-full h-48 bg-gray-100 rounded-lg overflow-hidden border-2 border-gray-200">
          <Image
            src={imageUrl || "/placeholder.svg"}
            alt={label}
            fill
            className="object-cover"
            onError={(e) => {
              console.log("[v0] Image failed to load:", imageUrl)
            }}
          />
        </div>
        <button
          type="button"
          onClick={() => {
            handleInputChange(fieldName, "")
            toast.success("Image removed")
          }}
          className="absolute top-2 right-2 bg-red-500 hover:bg-red-600 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    )
  }

  const renderFileUploadField = (fieldName: keyof KYCData, label: string) => {
    return (
      <div>
        <Label>{label}</Label>
        <Button
          type="button"
          variant="outline"
          className="w-full bg-transparent"
          onClick={() => handleFileUpload(fieldName)}
          disabled={uploadingField === fieldName}
        >
          {uploadingField === fieldName ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Uploading...
            </>
          ) : (
            <>
              <Upload className="w-4 h-4 mr-2" />
              {(kycData[fieldName] as string) ? "Change File" : "Upload File"}
            </>
          )}
        </Button>
        {(kycData[fieldName] as string) && <div className="mt-3">{renderImagePreview(fieldName, label)}</div>}
      </div>
    )
  }

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Personal Details</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="name">Name *</Label>
                <Input id="name" value={kycData.name} onChange={(e) => handleInputChange("name", e.target.value)} />
              </div>
              <div>
                <Label htmlFor="mobile">Mobile Number *</Label>
                <Input
                  id="mobile"
                  type="tel"
                  maxLength={10}
                  placeholder="10 digit mobile number"
                  value={kycData.mobileNumber}
                  onChange={(e) => handleInputChange("mobileNumber", e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="email">Email Address *</Label>
                <Input
                  id="email"
                  type="email"
                  value={kycData.email}
                  onChange={(e) => handleInputChange("email", e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="dob">Date of Birth *</Label>
                <Input
                  id="dob"
                  type="date"
                  value={kycData.dateOfBirth}
                  onChange={(e) => handleInputChange("dateOfBirth", e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="caste">Caste *</Label>
                <Select value={kycData.caste} onValueChange={(value) => handleInputChange("caste", value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select caste" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Hindu">Hindu</SelectItem>
                    <SelectItem value="Muslim">Muslim</SelectItem>
                    <SelectItem value="Other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="marital">Marital Status *</Label>
                <Select
                  value={kycData.maritalStatus}
                  onValueChange={(value) => handleInputChange("maritalStatus", value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Married">Married</SelectItem>
                    <SelectItem value="Unmarried">Unmarried</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="nativeCity">Native City *</Label>
                <Input
                  id="nativeCity"
                  value={kycData.nativeCity}
                  onChange={(e) => handleInputChange("nativeCity", e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="nativeState">Native State *</Label>
                <Input
                  id="nativeState"
                  value={kycData.nativeState}
                  onChange={(e) => handleInputChange("nativeState", e.target.value)}
                />
              </div>
            </div>
            <div>
              <Label htmlFor="address">Permanent Address *</Label>
              <Textarea
                id="address"
                value={kycData.permanentAddress}
                onChange={(e) => handleInputChange("permanentAddress", e.target.value)}
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {renderFileUploadField("passportSizePhoto", "Passport Size Photo *")}
              {renderFileUploadField("aadharCardFront", "Aadhar Card - Front *")}
              {renderFileUploadField("aadharCardBack", "Aadhar Card - Back *")}
              {renderFileUploadField("residentialProof", "Residential Proof *")}
            </div>
          </div>
        )

      case 2:
        return (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Profession Related Details</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="profession">Profession *</Label>
                <Select value={kycData.profession} onValueChange={(value) => handleInputChange("profession", value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select profession" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Student">Student</SelectItem>
                    <SelectItem value="Working">Working</SelectItem>
                    <SelectItem value="Other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="collegeName">College / Company Name *</Label>
                <Input
                  id="collegeName"
                  value={kycData.collegeCompanyName}
                  onChange={(e) => handleInputChange("collegeCompanyName", e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="workingSince">Studying / Working Since *</Label>
                <Input
                  id="workingSince"
                  type="date"
                  value={kycData.studyingWorkingSince}
                  onChange={(e) => handleInputChange("studyingWorkingSince", e.target.value)}
                />
              </div>
            </div>
            <div>
              <Label htmlFor="collegeAddress">Address of College / Company *</Label>
              <Textarea
                id="collegeAddress"
                value={kycData.collegeCompanyAddress}
                onChange={(e) => handleInputChange("collegeCompanyAddress", e.target.value)}
              />
            </div>
            {renderFileUploadField("proofOfLocation", "Proof of Working Location / College *")}
          </div>
        )

      case 3:
        return (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Family Background</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="fatherName">Father's Name *</Label>
                <Input
                  id="fatherName"
                  value={kycData.fatherName}
                  onChange={(e) => handleInputChange("fatherName", e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="fatherMobile">Father's Mobile Number *</Label>
                <Input
                  id="fatherMobile"
                  type="tel"
                  maxLength={10}
                  placeholder="10 digit mobile number"
                  value={kycData.fatherMobileNumber}
                  onChange={(e) => handleInputChange("fatherMobileNumber", e.target.value)}
                />
              </div>
            </div>
          </div>
        )

      case 4:
        return (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Self Declaration</h3>
            <div>
              <Label htmlFor="criminalHistory">Criminal History / Any Pending Court Proceeding *</Label>
              <Select
                value={kycData.criminalHistory}
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
            {kycData.criminalHistory === "Yes" && (
              <div>
                <Label htmlFor="criminalDetails">Provide Details</Label>
                <Textarea
                  id="criminalDetails"
                  value={kycData.criminalHistoryDetails}
                  onChange={(e) => handleInputChange("criminalHistoryDetails", e.target.value)}
                />
              </div>
            )}
            <div>
              <Label htmlFor="pgStartDate">Your PG Stay will be started on *</Label>
              <Input
                id="pgStartDate"
                type="date"
                value={kycData.pgStartDate}
                onChange={(e) => handleInputChange("pgStartDate", e.target.value)}
              />
            </div>
            <div className="space-y-3">
              <div className="flex items-start space-x-2">
                <Checkbox
                  id="agreeRules"
                  checked={kycData.agreeToRules}
                  onCheckedChange={(checked) => handleInputChange("agreeToRules", checked)}
                />
                <Label htmlFor="agreeRules" className="text-sm leading-relaxed">
                  I'm aware that Non-veg, Egg, Alcohol Consumption, Spitting and Chewing Tobacco are not allowed in
                  Premises. If found then may lead to termination. *
                </Label>
              </div>
              <div className="flex items-start space-x-2">
                <Checkbox
                  id="agreeVerification"
                  checked={kycData.agreeToVerification}
                  onCheckedChange={(checked) => handleInputChange("agreeToVerification", checked)}
                />
                <Label htmlFor="agreeVerification" className="text-sm leading-relaxed">
                  While on-boarding you have to co-operate with Rent Agreement and Local Police Verifications along with
                  AADHAR KYC. *
                </Label>
              </div>
              <div className="flex items-start space-x-2">
                <Checkbox
                  id="agreeLockIn"
                  checked={kycData.agreeLockInPeriod}
                  onCheckedChange={(checked) => handleInputChange("agreeLockInPeriod", checked)}
                />
                <Label htmlFor="agreeLockIn" className="text-sm leading-relaxed">
                  I'm aware that there is 3 months lock-in period and 1 month of notice period for quitting the stay. *
                </Label>
              </div>
              <div className="flex items-start space-x-2">
                <Checkbox
                  id="agreeTerms"
                  checked={kycData.agreeTermsConditions}
                  onCheckedChange={(checked) => handleInputChange("agreeTermsConditions", checked)}
                />
                <Label htmlFor="agreeTerms" className="text-sm leading-relaxed">
                  Read all Terms and Conditions{" "}
                  <a href="/Terms" className="text-blue-600 underline">
                    Here
                  </a>{" "}
                  *
                </Label>
              </div>
            </div>
          </div>
        )

      default:
        return null
    }
  }

  const renderCompletedKYC = () => {
    if (!kycData.isCompleted) return null

    return (
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-green-600">
            <CheckCircle className="w-5 h-5" />
            KYC Completed Successfully
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 text-sm">
            <div>
              <p className="font-medium">Name:</p>
              <p>{kycData.name}</p>
            </div>
            <div>
              <p className="font-medium">Mobile:</p>
              <p>{kycData.mobileNumber}</p>
            </div>
            <div>
              <p className="font-medium">Email:</p>
              <p>{kycData.email}</p>
            </div>
            <div>
              <p className="font-medium">Profession:</p>
              <p>{kycData.profession}</p>
            </div>
            <div>
              <p className="font-medium">College/Company:</p>
              <p>{kycData.collegeCompanyName}</p>
            </div>
            <div>
              <p className="font-medium">Father's Name:</p>
              <p>{kycData.fatherName}</p>
            </div>
            <div>
              <p className="font-medium">PG Start Date:</p>
              <p>{kycData.pgStartDate ? new Date(kycData.pgStartDate).toLocaleDateString() : "-"}</p>
            </div>
          </div>
          <div className="border-t pt-4 mt-4">
            <p className="font-medium mb-3">Submitted Documents:</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {(kycData.passportSizePhoto as string) && (
                <div>
                  <p className="text-sm text-gray-600 mb-2">Passport Size Photo</p>
                  {renderImagePreview("passportSizePhoto", "Passport Size Photo")}
                </div>
              )}
              {(kycData.aadharCardFront as string) && (
                <div>
                  <p className="text-sm text-gray-600 mb-2">Aadhar Card - Front</p>
                  {renderImagePreview("aadharCardFront", "Aadhar Card - Front")}
                </div>
              )}
              {(kycData.aadharCardBack as string) && (
                <div>
                  <p className="text-sm text-gray-600 mb-2">Aadhar Card - Back</p>
                  {renderImagePreview("aadharCardBack", "Aadhar Card - Back")}
                </div>
              )}
              {(kycData.residentialProof as string) && (
                <div>
                  <p className="text-sm text-gray-600 mb-2">Residential Proof</p>
                  {renderImagePreview("residentialProof", "Residential Proof")}
                </div>
              )}
              {(kycData.proofOfLocation as string) && (
                <div>
                  <p className="text-sm text-gray-600 mb-2">Proof of Working Location</p>
                  {renderImagePreview("proofOfLocation", "Proof of Working Location")}
                </div>
              )}
            </div>
          </div>
          <Button
            onClick={() => {
              setIsEditing(true)
              setCurrentStep(1)
            }}
            variant="outline"
          >
            Edit KYC Details
          </Button>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {renderCompletedKYC()}

      {(!kycData.isCompleted || isEditing) && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>
                Step {currentStep} of {totalSteps}
              </CardTitle>
              <div className="flex space-x-1">
                {Array.from({ length: totalSteps }, (_, i) => (
                  <div
                    key={i}
                    className={`w-3 h-3 rounded-full ${i + 1 <= currentStep ? "bg-blue-600" : "bg-gray-200"}`}
                  />
                ))}
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            {renderStepContent()}

            <div className="flex justify-between pt-4">
              <Button variant="outline" onClick={handlePrevious} disabled={currentStep === 1}>
                <ChevronLeft className="w-4 h-4 mr-2" />
                Previous
              </Button>

              {currentStep < totalSteps ? (
                <Button onClick={handleNext} disabled={loading}>
                  Next
                  <ChevronRight className="w-4 h-4 ml-2" />
                </Button>
              ) : (
                <Button onClick={handleSubmit} disabled={loading}>
                  {loading ? "Submitting..." : "Submit KYC"}
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
