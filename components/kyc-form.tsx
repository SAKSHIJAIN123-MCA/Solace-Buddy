"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { CheckCircle2, Upload, Shield } from "lucide-react"

export function KYCForm() {
  const [currentStep, setCurrentStep] = useState(1)
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    dateOfBirth: "",
    nationality: "",
    addressLine1: "",
    addressLine2: "",
    city: "",
    state: "",
    postalCode: "",
    country: "",
    idType: "",
    idNumber: "",
    idDocument: null as File | null,
  })

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFormData((prev) => ({ ...prev, idDocument: e.target.files![0] }))
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    console.log("[v0] KYC form submitted:", formData)
    // Handle form submission
  }

  const steps = [
    { number: 1, title: "Personal Information", description: "Basic details about you" },
    { number: 2, title: "Address Details", description: "Your residential address" },
    { number: 3, title: "Identity Verification", description: "Upload your ID document" },
  ]

  return (
    <div className="container mx-auto px-4 py-8 md:py-16 max-w-4xl">
      {/* Header */}
      <div className="text-center mb-8 md:mb-12">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-4">
          <Shield className="w-8 h-8 text-primary" />
        </div>
        <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-3 text-balance">Complete Your Verification</h1>
        <p className="text-muted-foreground text-lg leading-relaxed max-w-2xl mx-auto">
          To ensure the security of your booking, we need to verify your identity. This process takes just a few
          minutes.
        </p>
      </div>

      {/* Progress Steps */}
      <div className="mb-8 md:mb-12">
        <div className="flex items-center justify-between max-w-2xl mx-auto">
          {steps.map((step, index) => (
            <div key={step.number} className="flex items-center flex-1">
              <div className="flex flex-col items-center flex-1">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold text-sm transition-colors ${
                    currentStep > step.number
                      ? "bg-primary text-primary-foreground"
                      : currentStep === step.number
                        ? "bg-primary text-primary-foreground"
                        : "bg-secondary text-muted-foreground"
                  }`}
                >
                  {currentStep > step.number ? <CheckCircle2 className="w-5 h-5" /> : step.number}
                </div>
                <div className="mt-2 text-center hidden md:block">
                  <p
                    className={`text-sm font-medium ${
                      currentStep >= step.number ? "text-foreground" : "text-muted-foreground"
                    }`}
                  >
                    {step.title}
                  </p>
                </div>
              </div>
              {index < steps.length - 1 && (
                <div
                  className={`h-0.5 flex-1 mx-2 transition-colors ${
                    currentStep > step.number ? "bg-primary" : "bg-border"
                  }`}
                />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Form Card */}
      <Card className="border-2">
        <CardHeader>
          <CardTitle className="text-2xl">{steps[currentStep - 1].title}</CardTitle>
          <CardDescription className="text-base">{steps[currentStep - 1].description}</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit}>
            {/* Step 1: Personal Information */}
            {currentStep === 1 && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="firstName">First Name *</Label>
                    <Input
                      id="firstName"
                      placeholder="John"
                      value={formData.firstName}
                      onChange={(e) => handleInputChange("firstName", e.target.value)}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="lastName">Last Name *</Label>
                    <Input
                      id="lastName"
                      placeholder="Doe"
                      value={formData.lastName}
                      onChange={(e) => handleInputChange("lastName", e.target.value)}
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="dateOfBirth">Date of Birth *</Label>
                    <Input
                      id="dateOfBirth"
                      type="date"
                      value={formData.dateOfBirth}
                      onChange={(e) => handleInputChange("dateOfBirth", e.target.value)}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="nationality">Nationality *</Label>
                    <Select
                      value={formData.nationality}
                      onValueChange={(value) => handleInputChange("nationality", value)}
                    >
                      <SelectTrigger id="nationality">
                        <SelectValue placeholder="Select nationality" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="us">United States</SelectItem>
                        <SelectItem value="uk">United Kingdom</SelectItem>
                        <SelectItem value="ca">Canada</SelectItem>
                        <SelectItem value="au">Australia</SelectItem>
                        <SelectItem value="de">Germany</SelectItem>
                        <SelectItem value="fr">France</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
            )}

            {/* Step 2: Address Details */}
            {currentStep === 2 && (
              <div className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="addressLine1">Address Line 1 *</Label>
                  <Input
                    id="addressLine1"
                    placeholder="123 Main Street"
                    value={formData.addressLine1}
                    onChange={(e) => handleInputChange("addressLine1", e.target.value)}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="addressLine2">Address Line 2</Label>
                  <Input
                    id="addressLine2"
                    placeholder="Apartment, suite, etc. (optional)"
                    value={formData.addressLine2}
                    onChange={(e) => handleInputChange("addressLine2", e.target.value)}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="city">City *</Label>
                    <Input
                      id="city"
                      placeholder="New York"
                      value={formData.city}
                      onChange={(e) => handleInputChange("city", e.target.value)}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="state">State / Province *</Label>
                    <Input
                      id="state"
                      placeholder="NY"
                      value={formData.state}
                      onChange={(e) => handleInputChange("state", e.target.value)}
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="postalCode">Postal Code *</Label>
                    <Input
                      id="postalCode"
                      placeholder="10001"
                      value={formData.postalCode}
                      onChange={(e) => handleInputChange("postalCode", e.target.value)}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="country">Country *</Label>
                    <Select value={formData.country} onValueChange={(value) => handleInputChange("country", value)}>
                      <SelectTrigger id="country">
                        <SelectValue placeholder="Select country" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="us">United States</SelectItem>
                        <SelectItem value="uk">United Kingdom</SelectItem>
                        <SelectItem value="ca">Canada</SelectItem>
                        <SelectItem value="au">Australia</SelectItem>
                        <SelectItem value="de">Germany</SelectItem>
                        <SelectItem value="fr">France</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
            )}

            {/* Step 3: Identity Verification */}
            {currentStep === 3 && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="idType">ID Document Type *</Label>
                    <Select value={formData.idType} onValueChange={(value) => handleInputChange("idType", value)}>
                      <SelectTrigger id="idType">
                        <SelectValue placeholder="Select ID type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="passport">Passport</SelectItem>
                        <SelectItem value="drivers-license">Driver's License</SelectItem>
                        <SelectItem value="national-id">National ID Card</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="idNumber">ID Number *</Label>
                    <Input
                      id="idNumber"
                      placeholder="Enter ID number"
                      value={formData.idNumber}
                      onChange={(e) => handleInputChange("idNumber", e.target.value)}
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="idDocument">Upload ID Document *</Label>
                  <div className="border-2 border-dashed border-border rounded-lg p-8 text-center hover:border-primary/50 transition-colors">
                    <input
                      id="idDocument"
                      type="file"
                      accept="image/*,.pdf"
                      onChange={handleFileChange}
                      className="hidden"
                    />
                    <label htmlFor="idDocument" className="cursor-pointer flex flex-col items-center gap-3">
                      <div className="w-12 h-12 rounded-full bg-secondary flex items-center justify-center">
                        <Upload className="w-6 h-6 text-muted-foreground" />
                      </div>
                      <div>
                        <p className="font-medium text-foreground">
                          {formData.idDocument ? formData.idDocument.name : "Click to upload or drag and drop"}
                        </p>
                        <p className="text-sm text-muted-foreground mt-1">PNG, JPG or PDF (max. 10MB)</p>
                      </div>
                    </label>
                  </div>
                </div>

                <div className="bg-muted/50 rounded-lg p-4 border border-border">
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    <strong className="text-foreground">Privacy Notice:</strong> Your documents are encrypted and stored
                    securely. We only use this information for verification purposes and comply with all data protection
                    regulations.
                  </p>
                </div>
              </div>
            )}

            {/* Navigation Buttons */}
            <div className="flex items-center justify-between mt-8 pt-6 border-t">
              <Button
                type="button"
                variant="outline"
                onClick={() => setCurrentStep((prev) => Math.max(1, prev - 1))}
                disabled={currentStep === 1}
              >
                Previous
              </Button>

              {currentStep < 3 ? (
                <Button
                  type="button"
                  onClick={() => setCurrentStep((prev) => Math.min(3, prev + 1))}
                  className="bg-accent hover:bg-accent/90 text-accent-foreground"
                >
                  Continue
                </Button>
              ) : (
                <Button type="submit" className="bg-accent hover:bg-accent/90 text-accent-foreground">
                  Submit Verification
                </Button>
              )}
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Security Notice */}
      <div className="mt-8 text-center">
        <p className="text-sm text-muted-foreground">🔒 Your information is protected with bank-level encryption</p>
      </div>
    </div>
  )
}
