"use client"

import { useState, useEffect } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { InfoIcon } from "lucide-react"
import StudentBookingPage from "@/components/student/booking-page"
import KYCDetailsPage from "@/components/student/kyc-page"

export default function StudentDashboard() {
  const [hasBookings, setHasBookings] = useState(false)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState("bookings")

  useEffect(() => {
    checkBookingStatus()
  }, [])

  const checkBookingStatus = async () => {
    try {
      setLoading(true)
      const response = await fetch("/api/student/bookings?limit=1")
      const result = await response.json()

      if (result.success) {
        setHasBookings(result.statistics.total > 0)
      }
    } catch (error) {
      console.error("Error checking booking status:", error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900 mx-auto"></div>
          <p className="mt-4">Loading dashboard...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-balance">Student Dashboard</h1>
        <p className="text-muted-foreground">Manage your bookings and complete your KYC verification</p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="bookings">My Bookings</TabsTrigger>
          <TabsTrigger value="kyc" disabled={!hasBookings}>
            KYC Details {!hasBookings && "🔒"}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="bookings" className="mt-6">
          <StudentBookingPage />
        </TabsContent>

        <TabsContent value="kyc" className="mt-6">
          {!hasBookings ? (
            <Card>
              <CardHeader>
                <CardTitle>KYC Verification Locked</CardTitle>
                <CardDescription>Complete a booking first to unlock KYC verification</CardDescription>
              </CardHeader>
              <CardContent>
                <Alert>
                  <InfoIcon className="h-4 w-4" />
                  <AlertDescription>
                    You need to make at least one booking before you can complete your KYC verification. Please go to
                    the Bookings tab and make a booking first.
                  </AlertDescription>
                </Alert>
              </CardContent>
            </Card>
          ) : (
            <KYCDetailsPage />
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}
