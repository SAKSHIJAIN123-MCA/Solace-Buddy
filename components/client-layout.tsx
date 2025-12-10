"use client"

import { usePathname } from "next/navigation"
import { Header } from "@/components/header"
import Footer from "@/components/footer"
import { AnnouncementBar } from "@/components/announcement-bar"

export default function ClientLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname()
  const isAdminRoute = pathname?.startsWith("/admin")
  const isVendorRoute = pathname?.startsWith("/vendor")

  const hideLayout = isAdminRoute || isVendorRoute

  return (
    <>
      {!hideLayout && <AnnouncementBar />}
      {!hideLayout && <Header />}
      <main className="flex-1">{children}</main>
      {!hideLayout && <Footer />}
    </>
  )
}
