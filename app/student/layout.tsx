"use client"

import type { ReactNode } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { LayoutDashboard, Share2, FileText, Check, Calendar, Heart, User } from "lucide-react"

const nav = [
  { href: "/student/dashboard", label: "Dashboard", icon: LayoutDashboard },
   { href: "/student/profile", label: "Profile", icon: User },
  { href: "/student/refer", label: "Refer", icon: Share2 },
   { href: "/student/wallet", label: "Wallet Requests", icon: Share2 },
    { href: "/student/afterbookingkyc", label: "Booking & Kyc", icon: LayoutDashboard },
  //{ href: "/student/kyc-details", label: "KYC Details", icon: FileText },
  // { href: "/student/booking", label: "Booking", icon:Calendar },
   { href: "/student/support", label: "Support", icon: Check },
    { href: "/student/wishlist", label: "Wishlist", icon: Heart },
]

export default function StudentLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname()

  return (
    <div className="flex min-h-screen flex-col">
      {/* 🔹 Main Layout */}
      <main className="flex-1 container mx-auto px-4 py-6 grid grid-cols-1 lg:grid-cols-[240px_1fr] gap-6">
        {/* Sidebar */}
        <aside className="rounded-lg border border-gray-200 bg-white">
          <nav className="p-3">
            <ul className="space-y-1">
              {nav.map((item) => {
                const Icon = item.icon
                const active = pathname?.startsWith(item.href)
                return (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      className={`flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors
                        ${active ? "bg-gray-100 text-gray-900" : "text-gray-700 hover:bg-gray-50"}`}
                    >
                      <Icon className="h-4 w-4 text-gray-500" />
                      <span className="font-medium">{item.label}</span>
                    </Link>
                  </li>
                )
              })}
            </ul>
          </nav>
        </aside>

        {/* Page Content */}
        <section className="min-h-[60vh]">{children}</section>
      </main>
    </div>
  )
}
