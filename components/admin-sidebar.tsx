"use client";

import type * as React from "react";
import {
  Building2,
  LayoutDashboard,
  FileText,
  Bed,
  Calendar,
  Users,
  Store,
  MessageSquare,
  Settings,
  UserCheck,
  ChevronDown,
  LogOut,
  User,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import Image from "next/image";

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  SidebarRail,
} from "@/components/ui/sidebar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { useAuth } from "@/lib/auth-context";

const data = {
  navMain: [
    {
      title: "Dashboard",
      url: "/admin",
      icon: LayoutDashboard,
    },
    {
      title: "Blog",
      url: "/admin/blog",
      icon: FileText,
    },
    {
      title: "Hostel & PG",
      url: "/admin/hostel-pg",
      icon: Bed,
    },
    {
      title: "Booking",
      url: "/admin/booking",
      icon: Calendar,
    },
    {
      title: "Students/Users",
      url: "/admin/students",
      icon: Users,
    },
    {
      title: "Vendors",
      url: "/admin/vendors",
      icon: Store,
    },
    {
      title: "Contact",
      url: "/admin/contact",
      icon: Store,
    },
    {
      title: "Privacy Policy",
      url: "/admin/privacypolicy",
      icon: Store,
    },
    {
      title: "Terms & Conditions",
      url: "/admin/termsandconditions",
      icon: Store,
    },
    {
      title: "Refund Policy",
      url: "/admin/returnrefundpolicy",
      icon: Store,
    },
    {
      title: "FAQ",
      url: "/admin/faqs",
      icon: Store,
    },
    {
      title: "Testimonials",
      url: "/admin/testimonials",
      icon: UserCheck,
    },
    {
      title: "Enquiries",
      url: "#",
      icon: MessageSquare,
      items: [
        {
          title: "Vendor Enquiry",
          url: "/admin/enquiries/vendor",
        },
        {
          title: "Student Enquiry",
          url: "/admin/enquiries/student",
        },
        {
          title: "Standard-Visit Enquiry",
          url: "/admin/inquiry",
        },
       
      ],
    },
    {
      title: "Settings",
      url: "#",
      icon: Settings,
      items: [
        {
          title: "Contact Address",
          url: "/admin/settings/contact-address",
        },
        {
          title: "Amenities",
          url: "/admin/settings/amenities",
        },
        {
          title: "Packages",
          url: "/admin/packages",
        },
        {
          title: "Banners",
          url: "/admin/hero",
        },
         {
          title: "Live Counter",
          url: "/admin/live-counter",
        },
      ],
    },

    {
      title: "Refferals & Wallet",
      url: "#",
      icon: UserCheck,
      items: [
        {
          title: "Referrals",
          url: "/admin/referrals",
        },

        {
          title: "Wallet Enquiries",
          url: "/admin/wallet-enquiries",
        },
      ],
    },

    {
      title: "Student kyc details",
      url: "/admin/student-kyc-details",
      icon: UserCheck,
    },
     {
      title: "Seo Meta",
      url: "/admin/seo-meta",
      icon: UserCheck,
    },
  ],
};

export function AdminSidebar({
  ...props
}: React.ComponentProps<typeof Sidebar>) {
  const pathname = usePathname();
  const { user, logout } = useAuth();

  return (
    <Sidebar {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <div className="flex items-center justify-center py-4 border-b border-sidebar-border">
              <Link href="/admin">
                <Image
                  src="/solace-logo.png"
                  alt="SolaceBuddy"
                  width={180}
                  height={60}
                  className="h-12 w-auto hover:opacity-80 transition-opacity cursor-pointer"
                />
              </Link>
            </div>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild>
              <Link href="/admin">
                <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
                  <Building2 className="size-4" />
                </div>
                <div className="flex flex-col gap-0.5 leading-none">
                  <span className="font-semibold">Hostel Admin</span>
                  <span className="">Management System</span>
                </div>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Navigation</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {data.navMain.map((item) => (
                <SidebarMenuItem key={item.title}>
                  {item.items ? (
                    <Collapsible
                      defaultOpen={pathname.startsWith(
                        item.url.replace("#", "/admin")
                      )}
                    >
                      <CollapsibleTrigger asChild>
                        <SidebarMenuButton className="font-medium">
                          <item.icon />
                          {item.title}
                          <ChevronDown className="ml-auto transition-transform group-data-[state=open]/collapsible:rotate-180" />
                        </SidebarMenuButton>
                      </CollapsibleTrigger>
                      <CollapsibleContent>
                        <SidebarMenuSub>
                          {item.items.map((subItem) => (
                            <SidebarMenuSubItem key={subItem.title}>
                              <SidebarMenuSubButton
                                asChild
                                isActive={pathname === subItem.url}
                              >
                                <Link href={subItem.url}>{subItem.title}</Link>
                              </SidebarMenuSubButton>
                            </SidebarMenuSubItem>
                          ))}
                        </SidebarMenuSub>
                      </CollapsibleContent>
                    </Collapsible>
                  ) : (
                    <SidebarMenuButton asChild isActive={pathname === item.url}>
                      <Link href={item.url}>
                        <item.icon />
                        {item.title}
                      </Link>
                    </SidebarMenuButton>
                  )}
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <SidebarMenuButton>
                  <User />
                  {user?.email}
                  <ChevronDown className="ml-auto" />
                </SidebarMenuButton>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                side="top"
                className="w-(--radix-popper-anchor-width)"
              >
                <DropdownMenuItem onClick={logout}>
                  <LogOut />
                  <span>Sign out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
