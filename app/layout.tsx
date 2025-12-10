import type React from "react"
import type { Metadata } from "next"
import { Be_Vietnam_Pro } from "next/font/google"
import "./globals.css"
import ClientLayout from "@/components/client-layout" // 👈 client wrapper
import { Suspense } from "react"

const beVietnam = Be_Vietnam_Pro({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-be-vietnam",
  weight: ["100", "200", "300", "400", "500", "600", "700", "800", "900"],
})

export const metadata: Metadata = {
  title: "SolaceBuddy - Buddy who cares bachelors",
  description: "Find the perfect hostel and PG accommodation with SolaceBuddy",
  generator: "WebMyTech",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className={beVietnam.variable}>
      <body className="font-sans antialiased flex min-h-screen flex-col">
        {/* Client-side layout control */}

        <ClientLayout><Suspense>{children}</Suspense></ClientLayout>
      </body>
    </html>
  )
}
