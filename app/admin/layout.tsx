import type React from "react"
import { AdminSidebar } from "@/components/admin-sidebar"
import { ProtectedRoute } from "@/components/protected-route"
import { AuthProvider } from "@/lib/auth-context"
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"
import { AdminHeader } from "@/components/admin-header"
import { AmenitiesProvider } from "@/lib/amenities-context"

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <AuthProvider>
      <AmenitiesProvider>
        <ProtectedRoute>
          <SidebarProvider>
            <AdminSidebar />
            <SidebarInset>
              <AdminHeader />
              <div className="flex flex-1 flex-col gap-4 p-4">{children}</div>
            </SidebarInset>
          </SidebarProvider>
        </ProtectedRoute>
      </AmenitiesProvider>
    </AuthProvider>
  )
}
