"use client";

import type React from "react"
import { VendorSidebar } from "@/components/vendor-sidebar"
import { VendorHeader } from "@/components/vendor-header"
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"
import { VendorProvider } from "@/components/vendor-auth-provider"
import { usePathname } from "next/navigation" // Import usePathname

export default function VendorLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname() // Get the current pathname

  // Define paths where the sidebar should be hidden
  const hideSidebarPaths = ['/vendor/login', '/vendor/register']
  const shouldHideSidebar = hideSidebarPaths.includes(pathname)

  return (
    <VendorProvider>
      {shouldHideSidebar ? (
        // Render only children for login/register pages
        children
      ) : (
        // Render sidebar and header for other vendor pages
        <SidebarProvider>
          <VendorSidebar />
          <SidebarInset>
            <VendorHeader />
            <div className="flex flex-1 flex-col gap-4 p-4">{children}</div>
          </SidebarInset>
        </SidebarProvider>
      )}
    </VendorProvider>
  )
}
