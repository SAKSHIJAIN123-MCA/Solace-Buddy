"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ChevronLeft, ChevronRight, Upload, CheckCircle } from "lucide-react"
import { toast } from "sonner"

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

  // Step 5: Payment Details
  bookingAmountPaid: string
  monthlyRent: string

  // Step 6: Any Specific Request
  specificRequest: string

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
  bookingAmountPaid: "",
  monthlyRent: "",
  specificRequest: "",
  currentStep: 1,
  isCompleted: false,
}

export default function KYCDetailsPage() {
  const [currentStep, setCurrentStep] = useState(1)
  const [kycData, setKycData] = useState<KYCData>(initialData)
  const [loading, setLoading] = useState(false)
  const [isEditing, setIsEditing] = useState(false)

  const totalSteps = 6

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

  const validateStep = (step: number): boolean => {
    switch (step) {
      case 1:
        if (!kycData.mobileNumber || kycData.mobileNumber.length !== 10) {
          toast.error("Mobile number must be exactly 10 digits")
          return false
        }
        return true
      case 4:
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
        toast.error("Failed to save step")
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
        toast.error("Failed to submit KYC")
      }
    } catch (error) {
      toast.error("Error submitting KYC")
    } finally {
      setLoading(false)
    }
  }

  const handleFileUpload = (field: keyof KYCData) => {
    // Simulate file upload
    const fileName = `uploaded_${field}_${Date.now()}.jpg`
    handleInputChange(field, fileName)
    toast.success("File uploaded successfully")
  }

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Personal Details</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="name">Name</Label>
                <Input id="name" value={kycData.name} onChange={(e) => handleInputChange("name", e.target.value)} />
              </div>
              <div>
                <Label htmlFor="mobile">Mobile Number</Label>
                <Input
                  id="mobile"
                  type="tel"
                  maxLength={10}
                  value={kycData.mobileNumber}
                  onChange={(e) => handleInputChange("mobileNumber", e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="email">Email Address</Label>
                <Input
                  id="email"
                  type="email"
                  value={kycData.email}
                  onChange={(e) => handleInputChange("email", e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="dob">Date of Birth</Label>
                <Input
                  id="dob"
                  type="date"
                  value={kycData.dateOfBirth}
                  onChange={(e) => handleInputChange("dateOfBirth", e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="caste">Caste</Label>
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
                <Label htmlFor="marital">Marital Status</Label>
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
                <Label htmlFor="nativeCity">Native City</Label>
                <Input
                  id="nativeCity"
                  value={kycData.nativeCity}
                  onChange={(e) => handleInputChange("nativeCity", e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="nativeState">Native State</Label>
                <Input
                  id="nativeState"
                  value={kycData.nativeState}
                  onChange={(e) => handleInputChange("nativeState", e.target.value)}
                />
              </div>
            </div>
            <div>
              <Label htmlFor="address">Permanent Address</Label>
              <Textarea
                id="address"
                value={kycData.permanentAddress}
                onChange={(e) => handleInputChange("permanentAddress", e.target.value)}
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label>Passport Size Photo</Label>
                <Button
                  type="button"
                  variant="outline"
                  className="w-full bg-transparent"
                  onClick={() => handleFileUpload("passportSizePhoto")}
                >
                  <Upload className="w-4 h-4 mr-2" />
                  {kycData.passportSizePhoto ? "Change Photo" : "Upload Photo"}
                </Button>
                {kycData.passportSizePhoto && <p className="text-sm text-green-600 mt-1">✓ Uploaded</p>}
              </div>
              <div>
                <Label>Aadhar Card - Front</Label>
                <Button
                  type="button"
                  variant="outline"
                  className="w-full bg-transparent"
                  onClick={() => handleFileUpload("aadharCardFront")}
                >
                  <Upload className="w-4 h-4 mr-2" />
                  {kycData.aadharCardFront ? "Change File" : "Upload File"}
                </Button>
                {kycData.aadharCardFront && <p className="text-sm text-green-600 mt-1">✓ Uploaded</p>}
              </div>
              <div>
                <Label>Aadhar Card - Back</Label>
                <Button
                  type="button"
                  variant="outline"
                  className="w-full bg-transparent"
                  onClick={() => handleFileUpload("aadharCardBack")}
                >
                  <Upload className="w-4 h-4 mr-2" />
                  {kycData.aadharCardBack ? "Change File" : "Upload File"}
                </Button>
                {kycData.aadharCardBack && <p className="text-sm text-green-600 mt-1">✓ Uploaded</p>}
              </div>
              <div>
                <Label>Residential Proof</Label>
                <Button
                  type="button"
                  variant="outline"
                  className="w-full bg-transparent"
                  onClick={() => handleFileUpload("residentialProof")}
                >
                  <Upload className="w-4 h-4 mr-2" />
                  {kycData.residentialProof ? "Change File" : "Upload File"}
                </Button>
                {kycData.residentialProof && <p className="text-sm text-green-600 mt-1">✓ Uploaded</p>}
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
                <Label htmlFor="profession">Profession</Label>
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
                <Label htmlFor="collegeName">College / Company Name</Label>
                <Input
                  id="collegeName"
                  value={kycData.collegeCompanyName}
                  onChange={(e) => handleInputChange("collegeCompanyName", e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="workingSince">Studying / Working Since</Label>
                <Input
                  id="workingSince"
                  type="date"
                  value={kycData.studyingWorkingSince}
                  onChange={(e) => handleInputChange("studyingWorkingSince", e.target.value)}
                />
              </div>
            </div>
            <div>
              <Label htmlFor="collegeAddress">Address of College / Company</Label>
              <Textarea
                id="collegeAddress"
                value={kycData.collegeCompanyAddress}
                onChange={(e) => handleInputChange("collegeCompanyAddress", e.target.value)}
              />
            </div>
            <div>
              <Label>Proof of Working Location / College</Label>
              <Button
                type="button"
                variant="outline"
                className="w-full bg-transparent"
                onClick={() => handleFileUpload("proofOfLocation")}
              >
                <Upload className="w-4 h-4 mr-2" />
                {kycData.proofOfLocation ? "Change File" : "Upload File"}
              </Button>
              {kycData.proofOfLocation && <p className="text-sm text-green-600 mt-1">✓ Uploaded</p>}
            </div>
          </div>
        )

      case 3:
        return (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Family Background</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="fatherName">Father's Name</Label>
                <Input
                  id="fatherName"
                  value={kycData.fatherName}
                  onChange={(e) => handleInputChange("fatherName", e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="fatherMobile">Father's Mobile Number</Label>
                <Input
                  id="fatherMobile"
                  type="tel"
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
              <Label htmlFor="criminalHistory">Criminal History / Any Pending Court Proceeding</Label>
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
              <Label htmlFor="pgStartDate">Your PG Stay will be started on</Label>
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
                  Premises. If found then may lead to termination.
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
                  AADHAR KYC.
                </Label>
              </div>
              <div className="flex items-start space-x-2">
                <Checkbox
                  id="agreeLockIn"
                  checked={kycData.agreeLockInPeriod}
                  onCheckedChange={(checked) => handleInputChange("agreeLockInPeriod", checked)}
                />
                <Label htmlFor="agreeLockIn" className="text-sm leading-relaxed">
                  I'm aware that there is 3 months lock-in period and 1 month of notice period for quitting the stay.
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
                  </a>
                </Label>
              </div>
            </div>
          </div>
        )

      case 5:
        return (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Payment Details</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="bookingAmount">Booking Amount Paid</Label>
                <Input
                  id="bookingAmount"
                  type="number"
                  value={kycData.bookingAmountPaid}
                  onChange={(e) => handleInputChange("bookingAmountPaid", e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="monthlyRent">Monthly Rent</Label>
                <Input
                  id="monthlyRent"
                  type="number"
                  value={kycData.monthlyRent}
                  onChange={(e) => handleInputChange("monthlyRent", e.target.value)}
                />
              </div>
            </div>
          </div>
        )

      case 6:
        return (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Any Specific Request?</h3>
            <div>
              <Label htmlFor="specificRequest">Please share any specific requests or requirements</Label>
              <Textarea
                id="specificRequest"
                rows={5}
                value={kycData.specificRequest}
                onChange={(e) => handleInputChange("specificRequest", e.target.value)}
                placeholder="Enter any specific requests or requirements..."
              />
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
            <div>
              <p className="font-medium">Monthly Rent:</p>
              <p>₹{kycData.monthlyRent}</p>
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
      <div>
        <h1 className="text-2xl font-semibold text-balance">KYC Details</h1>
        <p className="text-muted-foreground">Complete your KYC verification in 6 simple steps</p>
      </div>

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
