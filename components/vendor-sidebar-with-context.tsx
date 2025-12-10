"use client"

import * as React from "react"
import { Building2, Home, LogOut } from 'lucide-react'
import { useRouter, usePathname } from "next/navigation"
import Link from "next/link"

import { Button } from "@/components/ui/button"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from "@/components/ui/sidebar"
import { useToast } from "@/hooks/use-toast"
import { useVendor } from "@/components/vendor-auth-provider"

// Navigation items
const navItems = [
  {
    title: "Dashboard",
    url: "/vendor",
    icon: Home,
  },
  {
    title: "Hostel & PG",
    url: "/vendor/hostel-pg",
    icon: Building2,
  },
]

export function VendorSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const { vendor } = useVendor()
  const { toast } = useToast()
  const router = useRouter()
  const pathname = usePathname()

  const handleLogout = async () => {
    try {
      const response = await fetch('/api/vendor-auth/logout', {
        method: 'POST'
      })

      if (response.ok) {
        toast({
          title: "Logged Out",
          description: "You have been successfully logged out.",
        })
        router.push('/vendor/login')
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to logout",
        variant: "destructive",
      })
    }
  }

  const isActive = (path: string) => {
    if (path === "/vendor") {
      return pathname === path
    }
    return pathname === path || pathname.startsWith(path + '/')
  }

  return (
    <Sidebar {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild>
              <Link href="/vendor">
                <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
                  <Building2 className="size-4" />
                </div>
                <div className="flex flex-col gap-0.5 leading-none">
                  <span className="font-semibold">Vendor Panel</span>
                  <span className="text-xs">Dashboard</span>
                </div>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {navItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild isActive={isActive(item.url)}>
                    <Link href={item.url}>
                      <item.icon />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <div className="flex items-center justify-between p-2">
              <div className="flex items-center gap-2 min-w-0">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-sidebar-primary text-sidebar-primary-foreground">
                  <span className="text-sm font-medium">
                    {vendor?.ownerName?.charAt(0) || 'V'}
                  </span>
                </div>
                <div className="flex flex-col min-w-0">
                  <p className="text-sm font-medium text-sidebar-foreground truncate">
                    {vendor?.ownerName || 'Vendor'}
                  </p>
                  <p className="text-xs text-sidebar-foreground/70 truncate">
                    {vendor?.email || 'vendor@example.com'}
                  </p>
                </div>
              </div>
              <Button variant="ghost" size="sm" onClick={handleLogout}>
                <LogOut className="h-4 w-4" />
                <span className="sr-only">Logout</span>
              </Button>
            </div>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}
