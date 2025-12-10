import Link from "next/link"
import Image from "next/image"
import { Facebook, Twitter, Instagram, Linkedin, Youtube, Mail, Phone, MapPin } from "lucide-react"

const cities = [
  "Mumbai",
  "Delhi",
  "Bangalore",
  "Pune",
  "Chennai",
  "Hyderabad",
  "Kolkata",
  "Ahmedabad",
  "Gurgaon",
  "Noida",
  "Indore",
  "Navi Mumbai",
]

const propertyTypes = ["PG", "Flat on Rent", "No Brokerage Homes", "Shared Rooms", "Single Rooms", "Studio Apartments"]

export default function Footer() {
  return (
    <footer className="bg-gray-50 text-gray-800">
      {/* Main Footer Content */}
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 items-start">
          {/* Company Info with Logo */}
          <div className="lg:col-span-1">
            <div className="flex flex-col items-start">
              <Image src="/solace-logo.png" alt="SolaceBuddy" width={200} height={80} className="mb-4" />
              <p className="text-gray-600 mb-6 leading-relaxed">
                SolaceBuddy offers full homes and shared accommodations with no brokerage.
              </p>
              <div className="space-y-3">
                <div className="flex items-center gap-3 text-gray-600">
                  <Phone className="w-4 h-4 text-[#2e057f]" />
                  <span>+91 98765 43210</span>
                </div>
                <div className="flex items-center gap-3 text-gray-600">
                  <Mail className="w-4 h-4 text-[#2e057f]" />
                  <span>contact@solacebuddy.com</span>
                </div>
                <div className="flex items-center gap-3 text-gray-600">
                  <MapPin className="w-4 h-4 text-[#2e057f]" />
                  <span>Ahmedabad, Gujarat, India</span>
                </div>
              </div>
            </div>
          </div>

          {/* Company Links */}
          <div>
            <h3 className="font-bold text-lg mb-6 text-[#2e057f]">Company</h3>
            <div className="space-y-3">
              <Link href="/about-us" className="block text-gray-600 hover:text-[#2e057f] transition-colors">
                About Us
              </Link>
              <Link href="/faq" className="block text-gray-600 hover:text-[#2e057f] transition-colors">
                FAQ
              </Link>
              <Link href="/blog" className="block text-gray-600 hover:text-[#2e057f] transition-colors">
               Blogs
              </Link>
              <Link href="/privacypolicy" className="block text-gray-600 hover:text-[#2e057f] transition-colors">
                Privacy Policy
              </Link>
              <Link href="/Terms" className="block text-gray-600 hover:text-[#2e057f] transition-colors">
                Terms & Conditions
              </Link>
              <Link href="/referearn" className="block text-gray-600 hover:text-[#2e057f] transition-colors">
                Refer & Earn Policy
              </Link>
            </div>
          </div>

          {/* Important Links */}
          <div>
            <h3 className="font-bold text-lg mb-6 text-[#2e057f]">Important Links</h3>
            <div className="space-y-3">
              <Link href="/properties" className="block text-gray-600 hover:text-[#2e057f] transition-colors">
                Find PG & Hostels
              </Link>
              <Link href="/feedback" className="block text-gray-600 hover:text-[#2e057f] transition-colors">
                Testimonials
              </Link>
              <Link href="/faq" className="block text-gray-600 hover:text-[#2e057f] transition-colors">
                FAQ
              </Link>
              <Link href="/properties" className="block text-gray-600 hover:text-[#2e057f] transition-colors">
                All Properties
              </Link>
               <Link href="/compare" className="block text-gray-600 hover:text-[#2e057f] transition-colors">
              Compare
              </Link>
            </div>
          </div>

          {/* Support & Social */}
          <div>
            <h3 className="font-bold text-lg mb-6 text-[#2e057f]">Support</h3>
            <div className="space-y-3 mb-8">
              <Link href="/contact" className="block text-gray-600 hover:text-[#2e057f] transition-colors">
                Contact Us
              </Link>

              <Link href="/vendor/register" className="block text-gray-600 hover:text-[#2e057f] transition-colors">
                Hostel Owner
              </Link>
              <Link href="/signup" className="block text-gray-600 hover:text-[#2e057f] transition-colors">
                Student's Login
              </Link>
              <Link href="/vendor/register" className="block text-gray-600 hover:text-[#2e057f] transition-colors">
                List Your Property
              </Link>
            </div>

            {/* Social Media */}
            <div>
              <h4 className="font-semibold mb-4 text-[#2e057f]">Follow Us</h4>
              <div className="flex gap-3">
                <Link
                  href="https://facebook.com/solacebuddy"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-10 h-10 bg-[#2e057f]/10 rounded-full flex items-center justify-center hover:bg-[#2e057f] hover:text-white transition-colors text-[#2e057f]"
                >
                  <Facebook className="w-5 h-5" />
                </Link>
                <Link
                  href="https://twitter.com/solacebuddy"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-10 h-10 bg-[#2e057f]/10 rounded-full flex items-center justify-center hover:bg-[#2e057f] hover:text-white transition-colors text-[#2e057f]"
                >
                  <Twitter className="w-5 h-5" />
                </Link>
                <Link
                  href="https://instagram.com/solacebuddy"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-10 h-10 bg-[#2e057f]/10 rounded-full flex items-center justify-center hover:bg-[#2e057f] hover:text-white transition-colors text-[#2e057f]"
                >
                  <Instagram className="w-5 h-5" />
                </Link>
                <Link
                  href="https://linkedin.com/company/solacebuddy"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-10 h-10 bg-[#2e057f]/10 rounded-full flex items-center justify-center hover:bg-[#2e057f] hover:text-white transition-colors text-[#2e057f]"
                >
                  <Linkedin className="w-5 h-5" />
                </Link>
                <Link
                  href="https://youtube.com/@solacebuddy"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-10 h-10 bg-[#2e057f]/10 rounded-full flex items-center justify-center hover:bg-[#2e057f] hover:text-white transition-colors text-[#2e057f]"
                >
                  <Youtube className="w-5 h-5" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-gray-200">
        <div className="container mx-auto px-4 py-6">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-gray-600 text-sm">
              © 2025 SolaceBuddy. All rights reserved. | Buddy who cares bachelors
            </p>
            <div className="flex gap-6 text-sm">
              <Link href="/sitemap" className="text-gray-600 hover:text-[#2e057f] transition-colors">
                Sitemap
              </Link>
              <Link href="/accessibility" className="text-gray-600 hover:text-[#2e057f] transition-colors">
                Accessibility
              </Link>
              <Link href="/cookie-policy" className="text-gray-600 hover:text-[#2e057f] transition-colors">
                Cookie Policy
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}
