"use client"

import useSWR from "swr"
import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Building2, Users, Calendar, MessageSquare, Bed, Store } from "lucide-react"

type StudentsStats = {
  success: boolean
  data?: {
    students: {
      today: number
      week: number
      month: number
      total: number
    }
  }
  error?: string
}

type VendorsStats = {
  success: boolean
  data?: {
    vendors: {
      today: number
      week: number
      month: number
      total: number
    }
  }
  error?: string
}

type InquiriesStats = {
  success: boolean
  data?: {
    inquiries: {
      today: number
      week: number
      month: number
      total: number
    }
  }
  error?: string
}

type BookingsStats = {
  success: boolean
  data?: {
    bookings: {
      today: number
      week: number
      month: number
      total: number
    }
  }
  error?: string
}

type ReferralsStats = {
  success: boolean
  data?: {
    referrals: {
      today: number
      week: number
      month: number
      total: number
    }
  }
  error?: string
}

type PropertiesStats = {
  success: boolean
  data?: {
    properties: {
      today: number
      week: number
      month: number
      total: number
    }
  }
  error?: string
}

const fetcher = (url: string) => fetch(url).then((r) => r.json())

function BreakdownRow({ label, value }: { label: string; value: number | string }) {
  return (
    <div className="flex items-center justify-between text-sm">
      <span className="text-muted-foreground">{label}</span>
      <span className="font-medium">{value}</span>
    </div>
  )
}

export default function AdminDashboard() {
  const { data: studentsData, isLoading: studentsLoading } = useSWR<StudentsStats>("/api/students/stats", fetcher, {
    revalidateOnFocus: false,
  })
  const { data: vendorsData, isLoading: vendorsLoading } = useSWR<VendorsStats>("/api/vendors/stats", fetcher, {
    revalidateOnFocus: false,
  })
  const { data: inquiriesData, isLoading: inquiriesLoading } = useSWR<InquiriesStats>("/api/inquiries/stats", fetcher, {
    revalidateOnFocus: false,
  })
  const { data: bookingsData, isLoading: bookingsLoading } = useSWR<BookingsStats>("/api/booking/stats", fetcher, {
    revalidateOnFocus: false,
  })
  const { data: referralsData, isLoading: referralsLoading } = useSWR<ReferralsStats>(
    "/api/admin/referrals/stats",
    fetcher,
    { revalidateOnFocus: false },
  )
  const { data: propertiesData, isLoading: propertiesLoading } = useSWR<PropertiesStats>(
    "/api/admin/vendor-properties/stats",
    fetcher,
    { revalidateOnFocus: false },
  )

  const studentsCounts = studentsData?.data?.students
  const newUsersDisplay = studentsLoading ? "…" : (studentsCounts?.total ?? 0)

  const vendorCounts = vendorsData?.data?.vendors
  const newVendorsDisplay = vendorsLoading ? "…" : (vendorCounts?.total ?? 0)

  const inquiryCounts = inquiriesData?.data?.inquiries
  const inquiriesDisplay = inquiriesLoading ? "…" : (inquiryCounts?.total ?? 0)

  const bookingCounts = bookingsData?.data?.bookings
  const bookingsDisplay = bookingsLoading ? "…" : (bookingCounts?.total ?? 0)

  const referralCounts = referralsData?.data?.referrals
  const referralsDisplay = referralsLoading ? "…" : (referralCounts?.total ?? 0)

  const propertyCounts = propertiesData?.data?.properties
  const propertiesDisplay = propertiesLoading ? "…" : (propertyCounts?.total ?? 0)

  const stats = [
    {
      key: "new-users",
      title: "New Registration Users",
      value: String(newUsersDisplay),
      description: "Total Registered Users",
      icon: Building2,
      colorClass: "text-primary",
      href: "/admin/students",
      breakdown:
        studentsLoading || !studentsCounts
          ? null
          : [
              { label: "Today", value: studentsCounts.today },
              { label: "This Week", value: studentsCounts.week },
              { label: "This Month", value: studentsCounts.month },
            ],
    },
    {
      key: "new-vendors",
      title: "New Registration Vendors",
      value: String(newVendorsDisplay),
      description: "Registered Vendors",
      icon: Users,
      colorClass: "text-muted-foreground",
      href: "/admin/vendors",
      breakdown:
        vendorsLoading || !vendorCounts
          ? null
          : [
              { label: "Today", value: vendorCounts.today },
              { label: "This Week", value: vendorCounts.week },
              { label: "This Month", value: vendorCounts.month },
            ],
    },
    {
      key: "new-property",
      title: "New Property Added",
      value: String(propertiesDisplay),
      description: "New Hostel Properties",
      icon: Calendar,
      colorClass: "text-muted-foreground",
      href: "/admin/hostel-pg",
      breakdown:
        propertiesLoading || !propertyCounts
          ? null
          : [
              { label: "Today", value: propertyCounts.today },
              { label: "This Week", value: propertyCounts.week },
              { label: "This Month", value: propertyCounts.month },
            ],
    },
    {
      key: "total-inquiry",
      title: "Total Inquiry",
      value: String(inquiriesDisplay),
      description: "",
      icon: Bed,
      colorClass: "text-muted-foreground",
      href: "/admin/inquiry",
      breakdown:
        inquiriesLoading || !inquiryCounts
          ? null
          : [
              { label: "Today", value: inquiryCounts.today },
              { label: "This Week", value: inquiryCounts.week },
              { label: "This Month", value: inquiryCounts.month },
            ],
    },
    {
      key: "total-bookings",
      title: "Total Bookings",
      value: String(bookingsDisplay),
      description: "",
      icon: Store,
      colorClass: "text-muted-foreground",
      href: "/admin/booking",
      breakdown:
        bookingsLoading || !bookingCounts
          ? null
          : [
              { label: "Today", value: bookingCounts.today },
              { label: "This Week", value: bookingCounts.week },
              { label: "This Month", value: bookingCounts.month },
            ],
    },
    {
      key: "total-referrals",
      title: "Total Referrals",
      value: String(referralsDisplay),
      description: "",
      icon: MessageSquare,
      colorClass: "text-muted-foreground",
      href: "/admin/referrals",
      breakdown:
        referralsLoading || !referralCounts
          ? null
          : [
              { label: "Today", value: referralCounts.today },
              { label: "This Week", value: referralCounts.week },
              { label: "This Month", value: referralCounts.month },
            ],
    },
  ]

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">Welcome to your hostel management dashboard</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {stats.map((stat) => {
          const Icon = stat.icon
          const content = (
            <>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
                <Icon className={`h-4 w-4 ${stat.colorClass}`} />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stat.value}</div>
                <p className="text-xs text-muted-foreground">{stat.description}</p>

                {stat.breakdown && (
                  <div className="mt-4 grid gap-2">
                    {stat.breakdown.map((b) => (
                      <BreakdownRow key={b.label} label={b.label} value={b.value} />
                    ))}
                  </div>
                )}
              </CardContent>
            </>
          )

          return (
            <Card key={stat.key} className="transition-colors hover:bg-muted/30">
              {stat.href ? (
                <Link href={stat.href} className="block p-0">
                  {content}
                </Link>
              ) : (
                content
              )}
            </Card>
          )
        })}
      </div>
    </div>
  )
}
