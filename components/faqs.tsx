"use client"

import type React from "react"
import { useEffect, useMemo, useState } from "react"
import Link from "next/link"
import { ChevronDown, ChevronUp, LucideBookOpenText } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"

type FAQItem = {
  _id: string
  question: string
  answer: string
  category: string
}

type Props = {
  // pass "general" or "booking" etc. We'll match category by includes (case-insensitive)
  categorySlug?: string
  // Optional custom title override
  title?: string
}

const categoryIcons: Record<string, React.ReactNode> = {
  default: <LucideBookOpenText className="h-5 w-5" />,
}

export default function FAQ({ categorySlug = "general", title }: Props) {
  const [faqs, setFaqs] = useState<FAQItem[]>([])
  const [openItems, setOpenItems] = useState<Record<string, boolean>>({})
  const [loading, setLoading] = useState(true)

  const normalizedSlug = useMemo(() => (categorySlug ?? "general").toString().trim().toLowerCase(), [categorySlug])

  useEffect(() => {
    const fetchFaqs = async () => {
      try {
        const res = await fetch("/api/faqs", { cache: "no-store" })
        if (!res.ok) throw new Error("Failed to fetch FAQs")
        const data: FAQItem[] = await res.json()
        setFaqs(data)
      } catch (err) {
        console.error("[FAQ] Error fetching FAQs:", err)
      } finally {
        setLoading(false)
      }
    }
    fetchFaqs()
  }, [])

  const filteredFaqs = useMemo(() => {
    // Match categories like "General", "General FAQ's", "Booking", "Booking related", etc.
    return faqs.filter((f) => f.category?.toLowerCase().includes(normalizedSlug))
  }, [faqs, normalizedSlug])

  const pageTitle = useMemo(() => {
    if (title) return title
    if (normalizedSlug.includes("general")) return "General FAQs"
    if (normalizedSlug.includes("booking")) return "Booking Related FAQs"
    // Fallback; Capitalize first letter of slug
    return `${normalizedSlug.charAt(0).toUpperCase()}${normalizedSlug.slice(1)} FAQs`
  }, [normalizedSlug, title])

  const toggleItem = (id: string) => {
    setOpenItems((prev) => ({ ...prev, [id]: !prev[id] }))
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[50vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#2e057f]" />
      </div>
    )
  }

  return (
    <div className="bg-gradient-to-b from-neutral-100 to-neutral-200 min-h-screen py-1 text-black">
      <div className="container mx-auto px-4">
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center mb-10">
            <h1 className="text-2xl sm:text-3xl font-bold text-center mb-6 mt-6">Frequently Asked Qusetions</h1>
           
          </div>

          {/* FAQs */}
          <div className="space-y-4">
            {filteredFaqs.length === 0 ? (
              <div className="text-center py-10">
                <LucideBookOpenText className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-1">No questions found in this category</h3>
                <p className="text-gray-500">{"Please check back later."}</p>
              </div>
            ) : (
              filteredFaqs.map((faq, index) => (
                <motion.div
                  key={faq._id}
                  className="bg-white rounded-lg shadow-sm overflow-hidden border border-gray-100"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.05 }}
                >
                  <button
                    className="w-full flex justify-between items-center p-5 text-left focus:outline-none"
                    onClick={() => toggleItem(faq._id)}
                    aria-expanded={openItems[faq._id]}
                  >
                    <div className="flex items-center">
                      <div className="mr-3 text-[#2e057f]">{categoryIcons.default}</div>
                      <span className="font-medium text-gray-900">{faq.question}</span>
                    </div>
                    <div className="ml-4 flex-shrink-0 text-gray-500">
                      {openItems[faq._id] ? (
                        <ChevronUp className="h-5 w-5 transition-transform duration-200" />
                      ) : (
                        <ChevronDown className="h-5 w-5 transition-transform duration-200" />
                      )}
                    </div>
                  </button>
                  <AnimatePresence>
                    {openItems[faq._id] && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="overflow-hidden"
                      >
                        <div className="p-5 pt-0 text-gray-600 border-t border-gray-100 bg-gray-50">
                          <p>{faq.answer}</p>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              ))
            )}
          </div>

          {/* Contact section */}
          <motion.div
            className="mt-12 mb-10 bg-white p-10 rounded-lg shadow-md text-center text-[#2e057f]"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <h2 className="text-2xl font-medium mb-4">Still have questions?</h2>
            <p className="text-[#2e057f] mb-6 max-w-lg mx-auto">
              If you couldn't find the answer to your question, our customer support team is ready to help you with any
              inquiries.
            </p>
            <Link href="/contact">
              <button className="bg-[#2e057f] text-white hover:bg-[#2e057f] px-8 py-3 rounded-md font-medium transition-colors duration-200 shadow-sm">
                Contact Us
              </button>
            </Link>
          </motion.div>
        </div>
      </div>
    </div>
  )
}
