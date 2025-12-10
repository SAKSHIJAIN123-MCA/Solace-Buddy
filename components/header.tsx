"use client"
import { useAuth } from "@/hooks/use-auth"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import Image from "next/image"
import { Heart } from "lucide-react"
import { useState } from "react"

export function Header() {
  const { authenticated, logout } = useAuth()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  return (
    <header className="bg-white border-b border-gray-200 py-4 sticky top-0 z-50">
      <div className="container mx-auto px-4 flex items-center justify-between">
        {/* Logo */}
        <div className="flex items-center">
          <Link href="/" className="hover:opacity-80 transition-opacity">
            <Image src="/solace logo.jpg" alt="SolaceBuddy Logo" width={280} height={80} className="h-16 w-auto" />
          </Link>
        </div>

        {/* Navigation Links - Desktop */}
        <nav className="hidden md:flex items-center space-x-8">
          <Link href="/" className="text-[#2e057f] text-lg font-semibold hover:text-[#2e057f]/80 transition-colors">
            Home
          </Link>
          <Link
            href="/properties"
            className="text-[#2e057f] text-lg font-semibold hover:text-[#2e057f]/80 transition-colors"
          >
            Find Stay
          </Link>
          <Link
            href="/how-to-book"
            className="text-[#2e057f] text-lg font-semibold hover:text-[#2e057f]/80 transition-colors"
          >
            How to book
          </Link>
          <Link
            href="/about-us"
            className="text-[#2e057f] text-lg font-semibold hover:text-[#2e057f]/80 transition-colors"
          >
            About Us
          </Link>

          <Link
            href="/contact"
            className="text-[#2e057f] text-lg font-semibold hover:text-[#2e057f]/80 transition-colors"
          >
            Contact Us
          </Link>

          <Button
            asChild
            variant="outline"
            className="text-[#2e057f] border-[#2e057f] bg-transparent hover:bg-[#2e057f]/10"
          >
            <Link href="/wishlist" className="flex items-center gap-2">
              <Heart className="h-4 w-4" />
              Wishlist
            </Link>
          </Button>

          {!authenticated ? (
            <Button asChild className="bg-[#2e057f] hover:bg-[#2e057f]/90 text-white">
              {/* As requested: clicking Login opens signup page */}
              <Link href="/signup">Login</Link>
            </Button>
          ) : (
            <div className="flex items-center gap-3">
              <Button asChild variant="outline" className="text-[#2e057f] border-[#2e057f] bg-transparent">
                <Link href="/student/dashboard">Dashboard</Link>
              </Button>
              <Button
                className="bg-[#2e057f] hover:bg-[#2e057f]/90 text-white"
                onClick={async () => {
                  await logout()
                  window.location.href = "/"
                }}
              >
                Logout
              </Button>
            </div>
          )}
        </nav>

        {/* Mobile Menu Button */}
        <Button variant="ghost" className="md:hidden text-[#2e057f]" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
          <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
          <span className="sr-only">Open menu</span>
        </Button>
      </div>

      {/* Mobile Navigation Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-white border-t border-gray-200">
          <nav className="container mx-auto px-4 py-4 flex flex-col space-y-3">
            <Link
              href="/"
              className="text-[#2e057f] text-base font-semibold hover:text-[#2e057f]/80 transition-colors block py-2"
              onClick={() => setMobileMenuOpen(false)}
            >
              Home
            </Link>
            <Link
              href="/properties"
              className="text-[#2e057f] text-base font-semibold hover:text-[#2e057f]/80 transition-colors block py-2"
              onClick={() => setMobileMenuOpen(false)}
            >
              Find Stay
            </Link>
            <Link
              href="/how-to-book"
              className="text-[#2e057f] text-base font-semibold hover:text-[#2e057f]/80 transition-colors block py-2"
              onClick={() => setMobileMenuOpen(false)}
            >
              How to book
            </Link>
            <Link
              href="/about-us"
              className="text-[#2e057f] text-base font-semibold hover:text-[#2e057f]/80 transition-colors block py-2"
              onClick={() => setMobileMenuOpen(false)}
            >
              About Us
            </Link>
            <Link
              href="/contact"
              className="text-[#2e057f] text-base font-semibold hover:text-[#2e057f]/80 transition-colors block py-2"
              onClick={() => setMobileMenuOpen(false)}
            >
              Contact Us
            </Link>

            <Button
              asChild
              variant="outline"
              className="text-[#2e057f] border-[#2e057f] bg-transparent hover:bg-[#2e057f]/10 w-full justify-start"
            >
              <Link href="/wishlist" className="flex items-center gap-2" onClick={() => setMobileMenuOpen(false)}>
                <Heart className="h-4 w-4" />
                Wishlist
              </Link>
            </Button>

            <div className="pt-2 border-t border-gray-200 flex flex-col gap-2">
              {!authenticated ? (
                <Button asChild className="bg-[#2e057f] hover:bg-[#2e057f]/90 text-white w-full">
                  <Link href="/signup" onClick={() => setMobileMenuOpen(false)}>
                    Login
                  </Link>
                </Button>
              ) : (
                <>
                  <Button asChild variant="outline" className="text-[#2e057f] border-[#2e057f] bg-transparent w-full">
                    <Link href="/student/dashboard" onClick={() => setMobileMenuOpen(false)}>
                      Dashboard
                    </Link>
                  </Button>
                  <Button
                    className="bg-[#2e057f] hover:bg-[#2e057f]/90 text-white w-full"
                    onClick={async () => {
                      await logout()
                      setMobileMenuOpen(false)
                      window.location.href = "/"
                    }}
                  >
                    Logout
                  </Button>
                </>
              )}
            </div>
          </nav>
        </div>
      )}
    </header>
  )
}
